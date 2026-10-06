import type { Analysis, RankingEntry, TranscriptTurn, Verdict } from "../lib/types";

export interface FixturePerson {
  id: string;
  name: string;
  linkedin_url: string;
  instagram_url: string;
  consent: boolean;
  status: "analyzed";
}

export const fixturePeople: FixturePerson[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Maya Rao",
    linkedin_url: "https://www.linkedin.com/in/fixture-maya-rao/",
    instagram_url: "https://www.instagram.com/fixture.mayarao/",
    consent: true,
    status: "analyzed",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "Daniel Kim",
    linkedin_url: "https://www.linkedin.com/in/fixture-daniel-kim/",
    instagram_url: "https://www.instagram.com/fixture.danielkim/",
    consent: true,
    status: "analyzed",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    name: "Sofia Almeida",
    linkedin_url: "https://www.linkedin.com/in/fixture-sofia-almeida/",
    instagram_url: "https://www.instagram.com/fixture.sofiaalm/",
    consent: true,
    status: "analyzed",
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    name: "James Okafor",
    linkedin_url: "https://www.linkedin.com/in/fixture-james-okafor/",
    instagram_url: "https://www.instagram.com/fixture.jamesok/",
    consent: true,
    status: "analyzed",
  },
];

function ev(text: string, evidence: string) {
  return { text, evidence };
}

export const fixtureAnalyses: Record<string, Analysis> = {
  "00000000-0000-4000-8000-000000000001": {
    headline: "Product designer who prototypes in the open and weekends in the hills",
    summary:
      "Maya is a product designer in Bangalore who shares work-in-progress shots, runs a weekend sketch club, and posts trail photos from the Western Ghats.",
    needs: [ev("A partner who respects deep-work time", "LinkedIn: 'guard my maker mornings — no meetings before noon'")],
    hobbies: [ev("Weekend trekking", "Instagram: 12 posts tagged #WesternGhats since March")],
    interests: [ev("Design systems and prototyping", "LinkedIn: three posts on Figma component architecture")],
    values: [ev("Candor over comfort", "Instagram caption: 'honest feedback is a love language'")],
    personality: [ev("Warm but direct", "Date-demo: opens with a question, states preferences plainly")],
    communication_style: "Direct, playful, asks questions early.",
    partner_wants: ["Curious about design or making things", "Loves the outdoors"],
    dealbreakers: ["Contempt for creative work", "No interest in ever leaving the city"],
    confidence: 0.72,
    data_gaps: ["No Instagram stories captured — daily routine unclear"],
  },
  "00000000-0000-4000-8000-000000000002": {
    headline: "Backend engineer, home cook, chess regular",
    summary:
      "Daniel is a backend engineer in Toronto who writes about databases, cooks through a family recipe book, and plays in a weekly chess club.",
    needs: [ev("Consistency and follow-through", "LinkedIn: 'I trust people who ship what they promise'")],
    hobbies: [ev("Cooking Korean home food", "Instagram: Sunday cooking series, 20+ episodes")],
    interests: [ev("Distributed systems", "LinkedIn: two deep-dives on Postgres indexing")],
    values: [ev("Showing up for people", "Instagram: volunteers monthly at a food bank")],
    personality: [ev("Steady, dry humor", "Demo transcript: jokes land softly, never at her expense")],
    communication_style: "Calm, asks follow-ups, slow to judge.",
    partner_wants: ["Enjoys long dinners and conversation", "Has their own absorbing hobby"],
    dealbreakers: ["Flakiness", "Mocking earnest interests"],
    confidence: 0.78,
    data_gaps: ["LinkedIn headline only — current employer unverified"],
  },
  "00000000-0000-4000-8000-000000000003": {
    headline: "Climate journalist who surfs and photographs film",
    summary:
      "Sofia is a freelance climate journalist in Lisbon covering coastal cities; she surfs at dawn and shoots 35mm film.",
    needs: [ev("A partner engaged with the world", "LinkedIn: 'curiosity about the planet is non-negotiable'")],
    hobbies: [ev("Dawn surfing", "Instagram: surf check stories most weekday mornings")],
    interests: [ev("Climate adaptation policy", "LinkedIn: recent piece on Lisbon flood planning")],
    values: [ev("Living lightly", "Instagram: capsule wardrobe, bike commute")],
    personality: [ev("Expressive, asks big questions", "Demo transcript: steers small talk toward meaning fast")],
    communication_style: "Expressive and probing; goes deep quickly.",
    partner_wants: ["Reads the news and has opinions", "Happy outdoors in any weather"],
    dealbreakers: ["Climate apathy", "Needing constant luxury"],
    confidence: 0.69,
    data_gaps: ["No family/community posts — support network unclear"],
  },
  "00000000-0000-4000-8000-000000000004": {
    headline: "Fintech operator, marathoner, mentor",
    summary:
      "James is a fintech operations lead in London training for his third marathon and mentoring two junior analysts.",
    needs: [ev("Mutual ambition without competition", "LinkedIn: 'want a teammate, not a rival'")],
    hobbies: [ev("Marathon running", "Instagram: training log, 60km weeks")],
    interests: [ev("Financial inclusion", "LinkedIn: mentors through a fintech inclusion program")],
    values: [ev("Discipline as care", "Instagram: '5am runs are how I keep promises to myself'")],
    personality: [ev("Encouraging, structured", "Demo transcript: plans the second date mid-first-date")],
    communication_style: "Structured, encouraging, makes plans concrete.",
    partner_wants: ["Has goals they take seriously", "Active lifestyle"],
    dealbreakers: ["Chronic lateness", "Cynicism about effort"],
    confidence: 0.75,
    data_gaps: ["Dating history/preferences underexplored in sources"],
  },
};

export const fixtureDateId = "00000000-0000-4000-8000-00000000dA1e";

export const fixtureTranscript: TranscriptTurn[] = [
  { speaker: "a", speaker_name: "Maya Rao", text: "Okay, first-date honesty: I will absolutely judge a restaurant by whether they let me sketch the dessert. How do you feel about that?" },
  { speaker: "b", speaker_name: "Daniel Kim", text: "As long as I get to taste-test the dessert while you sketch it, that's a system I can support. What are you designing these days?" },
  { speaker: "a", speaker_name: "Maya Rao", text: "A component library for a health app — unglamorous, deeply satisfying. I post the messy middle on LinkedIn, which either inspires people or makes them mute me." },
  { speaker: "b", speaker_name: "Daniel Kim", text: "The messy middle is the only part I actually learn from. I write about Postgres indexing for the same reason — three people read it, but those three really needed it." },
  { speaker: "a", speaker_name: "Maya Rao", text: "See, this is working. But challenge round: I disappear into the Ghats most weekends with no signal. Dealbreaker or feature?" },
  { speaker: "b", speaker_name: "Daniel Kim", text: "Feature — as long as there's a Sunday dinner debrief with photos. My non-negotiable is flakiness, and planned adventures are the opposite of flaky." },
  { speaker: "a", speaker_name: "Maya Rao", text: "Deal. And I'll warn you now: honest feedback is my love language, so if your chess opening is weak I will say so." },
  { speaker: "b", speaker_name: "Daniel Kim", text: "My London opening can take it. Same time next week — I'll cook, you bring the sketchbook?" },
];

export const fixtureVerdicts: Verdict[] = [
  {
    date_id: fixtureDateId,
    from_person_id: "00000000-0000-4000-8000-000000000001",
    score: 86,
    chemistry: "strong",
    red_flags: [],
    would_meet_again: true,
    note: "Curious, funny, unbothered by my outdoors disappearing act — and he cooks.",
  },
  {
    date_id: fixtureDateId,
    from_person_id: "00000000-0000-4000-8000-000000000002",
    score: 82,
    chemistry: "warm",
    red_flags: [],
    would_meet_again: true,
    note: "Direct and warm; the probing question early on told me she's serious about fit.",
  },
];

export const fixtureRanking: RankingEntry[] = [
  {
    person_id: "00000000-0000-4000-8000-000000000001",
    candidate_id: "00000000-0000-4000-8000-000000000002",
    candidate_name: "Daniel Kim",
    rank: 1,
    final_score: 84.2,
    why: "Shared maker curiosity plus complementary energy: her directness meets his steadiness; both verdicts warm or better.",
  },
  {
    person_id: "00000000-0000-4000-8000-000000000001",
    candidate_id: "00000000-0000-4000-8000-000000000003",
    candidate_name: "Sofia Almeida",
    rank: 2,
    final_score: 71.5,
    why: "Outdoors overlap is strong; communication styles both lean direct, though travel schedules may clash.",
  },
  {
    person_id: "00000000-0000-4000-8000-000000000001",
    candidate_id: "00000000-0000-4000-8000-000000000004",
    candidate_name: "James Okafor",
    rank: 3,
    final_score: 64.0,
    why: "Mutual ambition and active lifestyles; pre-score only, no date run yet.",
  },
];
