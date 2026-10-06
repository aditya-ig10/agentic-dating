// Shared contracts for the agentic dating site (AGENDA §4).
// ONLY Agent A edits this file. Others: request changes in coord/REQUESTS.md.

export type PersonStatus = "pending" | "scraped" | "analyzed" | "failed";
export type DateStatus = "queued" | "running" | "done" | "failed";
export type Chemistry = "none" | "low" | "warm" | "strong";

export interface Person {
  id: string;
  name: string;
  linkedin_url: string;
  instagram_url: string;
  consent: boolean;
  status: PersonStatus;
  error: string | null;
  created_at: string;
}

export interface EvidenceClaim {
  text: string;
  evidence: string;
}

export interface Analysis {
  headline: string;
  summary: string;
  needs: EvidenceClaim[];
  hobbies: EvidenceClaim[];
  interests: EvidenceClaim[];
  values: EvidenceClaim[];
  personality: EvidenceClaim[];
  communication_style: string;
  partner_wants: string[];
  dealbreakers: string[];
  confidence: number; // 0..1
  data_gaps: string[];
}

export interface Profile {
  person_id: string;
  analysis: Analysis;
  summary: string;
  created_at: string;
}

export interface TranscriptTurn {
  speaker: "a" | "b";
  speaker_name: string;
  text: string;
}

export interface Verdict {
  date_id: string;
  from_person_id: string;
  score: number; // 0..100
  chemistry: Chemistry;
  red_flags: string[];
  would_meet_again: boolean;
  note: string;
}

export interface DateWithVerdicts {
  id: string;
  a_id: string;
  b_id: string;
  status: DateStatus;
  transcript: TranscriptTurn[];
  created_at: string;
  verdicts: Verdict[];
}

export interface RankingEntry {
  person_id: string;
  candidate_id: string;
  candidate_name: string;
  rank: number;
  final_score: number;
  why: string;
}

export interface PairScore {
  a_id: string;
  b_id: string;
  score: number; // 0..100 cheap pre-score
  reason: string;
}

// ---- API payloads ----

export interface CreatePersonInput {
  linkedin_url: string;
  instagram_url: string;
  name?: string;
  consent?: boolean;
}

export interface Job {
  id: string;
  type: string;
  status: "queued" | "running" | "done" | "failed";
  progress: number; // 0..1
  error: string | null;
  created_at: string;
}
