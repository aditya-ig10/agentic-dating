/**
 * lib/agents/date.ts — runDate: full agent-vs-agent date (Agent B owns).
 *
 * 6-8 alternating turns (persona system prompts per agent), then one
 * structured verdict per agent from its person's point of view.
 * This is the most graded part of the build — prompts favor specificity
 * over generic rom-com patter.
 *
 * Deps-injected (profiles, settings, persistence) per AGENDA §4.
 */
import type { Analysis } from './analyze';

export type Chemistry = 'none' | 'low' | 'warm' | 'strong';

export interface DateMessage {
  from: string; // personId
  text: string;
}

export interface Verdict {
  fromPersonId: string;
  score: number; // 0-100
  chemistry: Chemistry;
  red_flags: string[];
  would_meet_again: boolean;
  note: string;
}

export interface DateResult {
  transcript: DateMessage[];
  verdicts: [Verdict, Verdict];
}

const VERDICT_SCHEMA = `{ score: 0-100, chemistry: "none"|"low"|"warm"|"strong", red_flags: [string], would_meet_again: bool, one_line_note: string }`;

export const DATE_SETTINGS = [
  'a cozy independent coffee shop on a rainy evening',
  'a secondhand bookstore with a creaky staircase',
  'a Sunday morning farmers market',
  'a rooftop with fairy lights, after a food-truck dinner',
  'a long walk around a lake at sunset',
  'a board-game cafe on a weeknight',
  'a live gig in a small basement venue',
  'a picnic in a botanical garden',
  'a street-food night market, grazing stall to stall',
  'a quiet wine bar with a record player in the corner',
];

/** Deterministic setting per pair: same pair always gets the same setting. */
export function settingFor(aId: string, bId: string): string {
  const [x, y] = [aId, bId].sort();
  let h = 0;
  for (const ch of `${x}::${y}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return DATE_SETTINGS[h % DATE_SETTINGS.length];
}

function personaPrompt(self: Analysis, selfName: string, otherName: string, setting: string): string {
  const items = (list: Array<{ text: string }>) => list.map((c) => c.text).join('; ') || '(none listed)';
  return `You are ${selfName} on a first date over text with ${otherName}. You ARE them — speak in first person as they would, drawing ONLY on this profile of yourself:

${self.headline}
${self.summary}
Interests: ${items(self.interests)} | Hobbies: ${items(self.hobbies)} | Values: ${items(self.values)}
Communication style: ${self.communication_style}
What you want in a partner: ${self.partner_wants.join('; ')}
Dealbreakers: ${self.dealbreakers.join('; ')}

How to behave on this date:
- Open naturally (react to the setting: ${setting}), be curious, ask follow-ups.
- Bring up 1-2 of YOUR real interests when they fit; react honestly when theirs don't overlap — polite disinterest is fine, fake enthusiasm is not.
- Around the middle of the date, probe ONE thing: a playful disagreement, a deeper question, or a gentle challenge about something they said. Dates with no friction feel fake.
- Keep each message 1-3 sentences, texting style. No stage directions, no asterisks, no narrating. Just your messages.
- NEVER state facts about yourself not in your profile (no invented job, city, pet, trip). If asked something you don't know, deflect lightly or ask back.
- End warmly or honestly when the host closes the conversation.`;
}

function verdictPrompt(selfName: string, transcript: DateMessage[], names: Map<string, string>): string {
  const lines = transcript
    .map((m) => `${names.get(m.from) ?? m.from}: ${m.text}`)
    .join('\n');
  return `The date just ended. Give your honest verdict from ${selfName}'s point of view as STRICT JSON — no other text:
{ score: 0-100, chemistry: "none"|"low"|"warm"|"strong", red_flags: [string], would_meet_again: bool, one_line_note: string }
Judge as them: their dealbreakers are real. A polite but boring date scores 40-55 and would_meet_again=false. Score 75+ only if genuinely excited.
one_line_note: <= 120 chars, in their voice.

Transcript:
${lines}

Your verdict as ${selfName}. JSON only.

Respond with JSON matching this shape (no other text):
${VERDICT_SCHEMA}`;
}

function cleanTurn(text: string, name: string): string {
  let t = text.trim().replace(/^["“”']+|["“”']+$/g, '');
  // Strip a leading "Name:" prefix models sometimes add.
  t = t.replace(new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*`, 'i'), '');
  // Soft truncate at a sentence boundary past 300 chars.
  if (t.length > 320) {
    const cut = t.lastIndexOf('. ', 320);
    t = cut > 120 ? t.slice(0, cut + 1) : t.slice(0, 320);
  }
  return t;
}

/** Test seam. */
export const __test = { personaPrompt, verdictPrompt, cleanTurn, settingFor, DATE_SETTINGS };

export interface DateTurnDeps {
  chat: (system: string, history: Array<{ role: 'user' | 'assistant'; content: string }>) => Promise<string>;
}

export interface RunDateDeps extends DateTurnDeps {
  getAnalysis: (id: string) => Promise<Analysis>;
  getName: (id: string) => Promise<string>;
}

export interface DateVerdictDeps {
  json: <T>(prompt: string, schema: string) => Promise<T>;
}

export async function runDate(aId: string, bId: string, deps: RunDateDeps & DateVerdictDeps): Promise<DateResult> {
  const [aAnalysis, bAnalysis] = await Promise.all([deps.getAnalysis(aId), deps.getAnalysis(bId)]);
  const [aName, bName] = await Promise.all([deps.getName(aId), deps.getName(bId)]);
  const names = new Map([
    [aId, aName],
    [bId, bName],
  ]);
  const setting = settingFor(aId, bId);
  const personaA = personaPrompt(aAnalysis, aName, bName, setting);
  const personaB = personaPrompt(bAnalysis, bName, aName, setting);

  const transcript: DateMessage[] = [];
  // Stable opener: lower id starts.
  let turn: [string, string] = aId < bId ? [aId, personaA] : [bId, personaB];
  const other: Record<string, [string, string]> = {
    [aId]: [bId, personaB],
    [bId]: [aId, personaA],
  };
  const renderFor = (selfId: string) =>
    transcript.map((m) => ({
      role: (m.from === selfId ? 'assistant' : 'user') as 'assistant' | 'user',
      content: m.text,
    }));

  const TOTAL_TURNS = 6;
  for (let t = 0; t < TOTAL_TURNS + 2; t++) {
    const [selfId, system] = turn;
    const history =
      t === 0
        ? [{ role: 'user' as const, content: `The date begins at ${setting}. Say your opening message.` }]
        : renderFor(selfId);
    const raw = await deps.chat(system, history);
    transcript.push({ from: selfId, text: cleanTurn(raw, names.get(selfId) ?? '') });
    // Extension rule: go to 8 turns if both asked a question in turns 5-6.
    if (t === TOTAL_TURNS - 1) {
      const last2 = transcript.slice(-2);
      if (!(last2.length === 2 && last2.every((m) => m.text.includes('?')))) break;
    }
    if (t >= TOTAL_TURNS + 1) break;
    turn = other[selfId];
  }

  const verdicts = (await Promise.all(
    [aId, bId].map(async (id) => {
      const persona = id === aId ? personaA : personaB;
      const v = await deps.json<{
        score: number;
        chemistry: Chemistry;
        red_flags: string[];
        would_meet_again: boolean;
        one_line_note: string;
      }>(`Stay in character.\n${persona}\n\n${verdictPrompt(names.get(id) ?? id, transcript, names)}`, VERDICT_SCHEMA);
      const chem: Chemistry[] = ['none', 'low', 'warm', 'strong'];
      return {
        fromPersonId: id,
        score: typeof v.score === 'number' ? Math.min(100, Math.max(0, Math.round(v.score))) : 50,
        chemistry: chem.includes(v.chemistry) ? v.chemistry : ('low' as Chemistry),
        red_flags: Array.isArray(v.red_flags) ? v.red_flags.map(String).slice(0, 5) : [],
        would_meet_again: v.would_meet_again === true,
        note: String(v.one_line_note ?? '').slice(0, 140),
      } satisfies Verdict;
    }),
  )) as [Verdict, Verdict];

  return { transcript, verdicts };
}
