export interface HighlightSegment {
  text: string
  highlighted: boolean
}

/**
 * Split text into segments, marking parts that match the query.
 * Matching is case-insensitive.
 */
export function highlightText(text: string, query: string): HighlightSegment[] {
  if (!query.trim()) return [{ text, highlighted: false }]

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const segments: HighlightSegment[] = []

  let cursor = 0
  while (cursor < text.length) {
    const matchIndex = lowerText.indexOf(lowerQuery, cursor)
    if (matchIndex === -1) {
      segments.push({ text: text.slice(cursor), highlighted: false })
      break
    }

    if (matchIndex > cursor) {
      segments.push({ text: text.slice(cursor, matchIndex), highlighted: false })
    }

    segments.push({ text: text.slice(matchIndex, matchIndex + query.length), highlighted: true })
    cursor = matchIndex + query.length
  }

  return segments
}
