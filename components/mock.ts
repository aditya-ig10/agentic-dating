// Mock data for pre-scaffold component development (Agent C).
// Shapes mirror AGENDA §4 contracts exactly:
//   Analysis JSON (profiles.analysis), transcript, verdicts, ranking rows.
// Fixtures from Agent A will replace these after the scaffold merge.

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

export interface MockPerson {
  id: string;
  name: string;
  status: "pending" | "scraped" | "analyzed" | "failed";
  analysis: Analysis;
}

export interface TranscriptTurn {
  speaker: "a" | "b";
  text: string;
}

export interface Verdict {
  from_person_id: string;
  from_name: string;
  score: number; // 0..100
  chemistry: "none" | "low" | "warm" | "strong";
  red_flags: string[];
  would_meet_again: boolean;
  note: string;
}

export interface MockDate {
  id: string;
  a_id: string;
  a_name: string;
  b_id: string;
  b_name: string;
  status: "queued" | "running" | "done" | "failed";
  transcript: TranscriptTurn[];
  verdicts: Verdict[];
}

export interface RankingRow {
  candidate_id: string;
  candidate_name: string;
  rank: number;
  final_score: number; // 0..100
  why: string;
  has_date: boolean;
  date_id?: string;
}

function fullAnalysis(
  headline: string,
  summary: string,
  partial: Partial<Analysis> & { needs: EvidenceClaim[] },
): Analysis {
  return {
    hobbies: [],
    interests: [],
    values: [],
    personality: [],
    communication_style: "",
    partner_wants: [],
    dealbreakers: [],
    confidence: 0.7,
    data_gaps: [],
    ...partial,
    headline,
    summary,
  };
}

export const mockPeople: MockPerson[] = [
  {
    id: "p-aria",
    name: "Aria Sharma",
    status: "analyzed",
    analysis: fullAnalysis(
      "Product designer who trail-runs and hosts supper clubs",
      "Aria is a product designer in Bangalore who spends weekends trail-running and weeknights hosting small supper clubs. She values direct communication and is looking for a partner who shares her curiosity about food and the outdoors.",
      {
        needs: [
          {
            text: "Intellectual sparring and honest feedback",
            evidence: "LinkedIn post: 'the best design critiques are the ones that sting a little'",
          },
          {
            text: "A partner comfortable with early mornings",
            evidence: "IG caption: '5am Nandi Hills run, who's in? (nobody, ever)'",
          },
        ],
        hobbies: [
          {
            text: "Trail running",
            evidence: "IG: 12 reels tagged #trailrunning, Nandi Hills and Skandagiri routes",
          },
          {
            text: "Hosting supper clubs",
            evidence: "IG highlights: 'supper club vol. 6' — 8-person tasting menu at home",
          },
        ],
        interests: [
          {
            text: "Regional Indian cuisines",
            evidence: "IG saved series on Chettinad and Coorgi cooking",
          },
          {
            text: "Design systems and typography",
            evidence: "LinkedIn: article on Kannada type in product UI",
          },
        ],
        values: [
          {
            text: "Showing up counts more than grand gestures",
            evidence: "LinkedIn: 'consistency > intensity, in sprints and in people'",
          },
        ],
        personality: [
          {
            text: "Warm but blunt — says the uncomfortable thing kindly",
            evidence: "Inferred from direct caption style and critique posts",
          },
        ],
        communication_style:
          "Direct and playful; long voice notes over texting; plans concretely, dislikes vague 'let's hang sometime' energy.",
        partner_wants: [
          "Loves food and is up for odd culinary experiments",
          "Active — happy with sunrise hikes, not just dinners",
          "Communicates directly, no game-playing",
        ],
        dealbreakers: ["Smoking", "Disdain for exercise", "Keeping plans deliberately vague"],
        confidence: 0.82,
        data_gaps: ["Instagram is public but LinkedIn activity is sparse — career detail is thin"],
      },
    ),
  },
  {
    id: "p-dev",
    name: "Dev Patel",
    status: "analyzed",
    analysis: fullAnalysis(
      "Backend engineer, chess nerd, weekend trekker",
      "Dev is a backend engineer in Pune who plays competitive chess online and treks the Sahyadris most long weekends. He is deliberate and a little reserved at first, and wants a partner who respects slow-burn connection over instant fireworks.",
      {
        needs: [
          {
            text: "Unstructured downtime — recharges alone",
            evidence: "IG caption: 'solo Harishchandragad trek. no signal, no small talk, bliss'",
          },
        ],
        hobbies: [
          {
            text: "Online blitz chess (~1900 rated)",
            evidence: "IG bio links chess profile; stories of tournament brackets",
          },
          {
            text: "Sahyadri trekking",
            evidence: "IG: Rajmachi, Kalsubai, Harishchandragad summit photos",
          },
        ],
        interests: [
          {
            text: "Distributed systems",
            evidence: "LinkedIn: posts on Postgres replication and on-call stories",
          },
          {
            text: "Marathi theatre",
            evidence: "IG stories from Prithvi-style natak screenings",
          },
        ],
        values: [
          {
            text: "Reliability — do what you said you'd do",
            evidence: "LinkedIn recommendation received: 'the person you want on-call with you'",
          },
        ],
        personality: [
          {
            text: "Quietly competitive, dry humor",
            evidence: "Caption style: deadpan one-liners under summit photos",
          },
        ],
        communication_style:
          "Sparse texter, prefers one long call to twenty short texts; precise with plans; warms up over shared activities, not small talk.",
        partner_wants: [
          "Independent with their own pursuits",
          "Up for treks and board-game nights",
          "Patient — lets rapport build over a few dates",
        ],
        dealbreakers: ["Flakiness with plans", "Needing constant texting"],
        confidence: 0.76,
        data_gaps: ["LinkedIn present but Instagram stories expire — off-grid interests may be missed"],
      },
    ),
  },
  {
    id: "p-meera",
    name: "Meera Iyer",
    status: "analyzed",
    analysis: fullAnalysis(
      "Doctoral researcher in linguistics, Carnatic singer, filter-coffee purist",
      "Meera is a linguistics PhD candidate in Chennai who sings Carnatic music and takes her filter coffee very seriously. She wants a partner who is curious about ideas and comfortable with her demanding rehearsal and fieldwork schedule.",
      {
        needs: [
          {
            text: "Respect for an unpredictable academic schedule",
            evidence: "IG: 'fieldwork month — Madras → Madurai → missing all birthdays, sorry'",
          },
        ],
        hobbies: [
          {
            text: "Carnatic vocal (kutcheri performer)",
            evidence: "IG: Margazhi season performance clips",
          },
          {
            text: "Brewing and rating filter coffee",
            evidence: "IG highlight: 'kaapi diaries' with 20+ shop reviews",
          },
        ],
        interests: [
          {
            text: "Dravidian language contact phenomena",
            evidence: "LinkedIn: conference paper on code-switching in Chennai Tamil",
          },
          {
            text: "Margazhi music season",
            evidence: "IG: December concert calendar screenshots",
          },
        ],
        values: [
          {
            text: "Depth over breadth in friendships and work",
            evidence: "LinkedIn: 'ten years with one guru beats ten gurus in a year'",
          },
        ],
        personality: [
          {
            text: "Thoughtful, observant, quietly funny",
            evidence: "Long reflective captions with a dry punchline at the end",
          },
        ],
        communication_style:
          "Thoughtful long-form messages; loves exchanging essays, papers, playlists; slow replier during rehearsal weeks — says so upfront.",
        partner_wants: [
          "Genuinely curious about ideas and art forms",
          "Comfortable with solo time during her busy seasons",
          "Willing to sit through a 3-hour kutcheri (at least once)",
        ],
        dealbreakers: ["Mocking classical arts", "Demanding daily availability"],
        confidence: 0.88,
        data_gaps: [],
      },
    ),
  },
  {
    id: "p-kabir",
    name: "Kabir Anand",
    status: "scraped",
    analysis: fullAnalysis(
      "Analysis pending — scrape complete",
      "Kabir's LinkedIn and Instagram have been scraped and are awaiting LLM analysis.",
      {
        needs: [],
        confidence: 0,
        data_gaps: ["Analysis not yet run"],
      },
    ),
  },
];

export const mockDate: MockDate = {
  id: "d-aria-dev",
  a_id: "p-aria",
  a_name: "Aria Sharma",
  b_id: "p-dev",
  b_name: "Dev Patel",
  status: "done",
  transcript: [
    { speaker: "a", text: "Okay, first-date confession: I picked this place because their filter coffee got a 9/10 in a very serious tasting I did. What's your go-to order?" },
    { speaker: "b", text: "Ha — no pressure then. I'm a black coffee guy, whatever's darkest on the menu. Though I hear there's a kaapi expert in Chennai who'd disown me for that." },
    { speaker: "a", text: "Black coffee people are just supper-club guests who haven't been converted yet. I host these tiny tasting menus at home — eight people, one theme. Last one was all Coorgi food. Do you cook at all, or is it trek rations for you?" },
    { speaker: "b", text: "Trek rations is harsh but... not inaccurate. I can do maggi at 4000 feet, that's my range. But I respect the craft — my chess prep is the same kind of obsessive. Do you get competitive about the supper clubs?" },
    { speaker: "a", text: "Fiercely. Vol. 6 had a scoring sheet, I'm not proud. Okay here's my probe though — you describe yourself as needing lots of solo recharge time. I plan things constantly, group chats, Sunday plans... would that exhaust you?" },
    { speaker: "b", text: "Honest answer: a big group every weekend would. But a supper club of eight with actual conversation? That's my speed. I dislike small talk, not people. The 5am runs though — I'm a night owl. That's a real gap." },
    { speaker: "a", text: "Hmm. I could respect a night owl who shows up for the supper club and skips the sunrise. Deal? And you'd have to survive one Coorgi pork curry night." },
    { speaker: "b", text: "Deal — I'll bring a chessboard for after dessert, and I'll even try the sunrise once. Exactly once, and there better be good coffee at the top." },
  ],
  verdicts: [
    {
      from_person_id: "p-aria",
      from_name: "Aria Sharma",
      score: 78,
      chemistry: "warm",
      red_flags: ["Different chronotypes — 5am vs night owl"],
      would_meet_again: true,
      note: "Funny, direct, showed up with opinions — would love a supper-club seat for him.",
    },
    {
      from_person_id: "p-dev",
      from_name: "Dev Patel",
      score: 74,
      chemistry: "warm",
      red_flags: [],
      would_meet_again: true,
      note: "No small talk, real conversation, and she didn't flinch at the quiet parts. Sunrise run TBD.",
    },
  ],
};

export const mockRanking: RankingRow[] = [
  {
    candidate_id: "p-dev",
    candidate_name: "Dev Patel",
    rank: 1,
    final_score: 76,
    why: "Shared love of the outdoors and direct communication; the date had warm chemistry with only a schedule-timing caveat.",
    has_date: true,
    date_id: "d-aria-dev",
  },
  {
    candidate_id: "p-meera",
    candidate_name: "Meera Iyer",
    rank: 2,
    final_score: 64,
    why: "Both value depth and intellectual curiosity, and both keep demanding creative schedules — but food/outdoors overlap is thin.",
    has_date: false,
  },
  {
    candidate_id: "p-kabir",
    candidate_name: "Kabir Anand",
    rank: 3,
    final_score: 41,
    why: "Pre-score only — Kabir's analysis is still pending, so this is based on surface overlap alone.",
    has_date: false,
  },
];
