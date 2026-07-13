/** Group entries by UTC day — a YYYY-MM-DD key derived from pubDateTime. */
export function groupNotesByDay<T extends { data: { pubDateTime: Date } }>(notes: T[]): Map<string, T[]> {
  const byDay = new Map<string, T[]>()
  for (const note of notes) {
    const key = new Date(note.data.pubDateTime).toISOString().slice(0, 10)
    if (!byDay.has(key)) byDay.set(key, [])
    byDay.get(key)?.push(note)
  }
  return byDay
}
