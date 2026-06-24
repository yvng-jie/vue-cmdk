import { describe, it, expect } from 'vitest'
import { highlightText } from '../utils/highlight'

describe('highlightText', () => {
  it('returns a single non-highlighted segment when query is empty', () => {
    const result = highlightText('Hello World', '')
    expect(result).toEqual([{ text: 'Hello World', highlighted: false }])
  })

  it('returns a single non-highlighted segment when query is whitespace', () => {
    const result = highlightText('Hello World', '   ')
    expect(result).toEqual([{ text: 'Hello World', highlighted: false }])
  })

  it('highlights matching text at the start', () => {
    const result = highlightText('Hello World', 'Hello')
    expect(result).toEqual([
      { text: 'Hello', highlighted: true },
      { text: ' World', highlighted: false },
    ])
  })

  it('highlights matching text in the middle', () => {
    const result = highlightText('Hello World', 'lo Wo')
    expect(result).toEqual([
      { text: 'Hel', highlighted: false },
      { text: 'lo Wo', highlighted: true },
      { text: 'rld', highlighted: false },
    ])
  })

  it('highlights matching text at the end', () => {
    const result = highlightText('Hello World', 'World')
    expect(result).toEqual([
      { text: 'Hello ', highlighted: false },
      { text: 'World', highlighted: true },
    ])
  })

  it('is case-insensitive', () => {
    const result = highlightText('Hello World', 'world')
    expect(result).toEqual([
      { text: 'Hello ', highlighted: false },
      { text: 'World', highlighted: true },
    ])
  })

  it('returns no highlighted segments when there is no match', () => {
    const result = highlightText('Hello World', 'xyz')
    expect(result).toEqual([{ text: 'Hello World', highlighted: false }])
  })

  it('handles multiple occurrences', () => {
    const result = highlightText('test test test', 'test')
    expect(result).toEqual([
      { text: 'test', highlighted: true },
      { text: ' ', highlighted: false },
      { text: 'test', highlighted: true },
      { text: ' ', highlighted: false },
      { text: 'test', highlighted: true },
    ])
  })

  it('handles empty text', () => {
    const result = highlightText('', 'test')
    expect(result).toEqual([])
  })
})
