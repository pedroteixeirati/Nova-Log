export function serializeNovalogEntry(entry: Record<string, unknown> | null) {
  if (!entry) return null;
  return entry;
}

export function serializeNovalogEntries(entries: Array<Record<string, unknown>>) {
  return entries.map(serializeNovalogEntry);
}
