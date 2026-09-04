import type { AppState } from "@/types";

/** Lowercase, trimmed, spaces collapsed to dashes, and a leading "#" (people
 * naturally type one, since that's how tags are always displayed) stripped —
 * so "#Front End", "front-end", and "#front-end" all normalize to the same
 * stored tag. "#" is a display-only prefix, never part of the stored value,
 * so it can't cause a search for "#test" to miss a stored tag "test". */
export function normalizeTag(raw: string): string {
  return raw
    .trim()
    .replace(/^#+/, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

/** Every tag currently in use, anywhere, sorted. Deliberately computed live
 * from the actual cards/todos rather than kept in a separate registry —
 * a separate list would need to be kept in sync by hand (add on create,
 * remove when the last user of a tag is deleted/changed) and could drift
 * from reality; deriving it from the data that's already the source of
 * truth can't drift, by construction. */
export function getAllTags(state: AppState): string[] {
  const set = new Set<string>();
  for (const project of state.projects) {
    for (const card of project.cards) card.tags?.forEach((tag) => set.add(tag));
    for (const card of project.archivedCards) card.tags?.forEach((tag) => set.add(tag));
    for (const todo of project.todos) todo.tags?.forEach((tag) => set.add(tag));
  }
  return [...set].sort();
}
