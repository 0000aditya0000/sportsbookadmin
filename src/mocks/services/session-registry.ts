import "server-only";

type Challenge = {
  id: string;
  expiresAt: number;
  attempts: number;
};

const challenges = new Map<string, Challenge>();
const revokedSessionIds = new Set<string>();

export function saveChallenge(challenge: Challenge) {
  challenges.set(challenge.id, challenge);
}

export function takeChallenge(id: string): Challenge | undefined {
  return challenges.get(id);
}

export function deleteChallenge(id: string) {
  challenges.delete(id);
}

export function revokeSession(sessionId: string) {
  revokedSessionIds.add(sessionId);
}

export function isSessionRevoked(sessionId: string): boolean {
  return revokedSessionIds.has(sessionId);
}
