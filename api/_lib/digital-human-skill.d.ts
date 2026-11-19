export type DigitalHumanKnowledge = {
  sha: string;
  documents: { path: string; content: string }[];
  stale?: boolean;
};
export function loadDigitalHumanKnowledge(token: string | undefined): Promise<DigitalHumanKnowledge>;
export function buildDigitalHumanSystemPrompt(snapshot: DigitalHumanKnowledge): string;
