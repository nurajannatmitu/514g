export interface MatchingPassage {
  id: number;
  textA: string;
  textB: string;
  startA: number;
  endA: number;
  startB: number;
  endB: number;
  wordCount: number;
  charCount: number;
}

export interface TextSegment {
  text: string;
  matchId?: number;
  isMatch: boolean;
}

interface WordToken {
  word: string;
  norm: string;
  start: number;
  end: number;
}

/**
 * Tokenizes text into words while recording exact character offsets in the original text.
 */
function tokenizeWithOffsets(text: string): WordToken[] {
  const tokens: WordToken[] = [];
  const regex = /\S+/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const raw = match[0];
    // Normalize word by lowering case and stripping non-alphanumeric edges
    const norm = raw.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
    tokens.push({
      word: raw,
      norm,
      start: match.index,
      end: match.index + raw.length,
    });
  }

  return tokens;
}

/**
 * Finds matching passages of at least 6 words OR at least 40 characters
 * between textA and textB, prioritizing longest matches first and merging overlaps.
 */
export function findMatchingPassages(textA: string, textB: string): MatchingPassage[] {
  if (!textA || !textB) return [];

  const tokensA = tokenizeWithOffsets(textA);
  const tokensB = tokenizeWithOffsets(textB);

  if (tokensA.length === 0 || tokensB.length === 0) return [];

  // Minimum thresholds
  const MIN_WORDS = 6;
  const MIN_CHARS = 40;

  // Build index for quick lookup of tokens in B
  // Map norm word -> list of token indices in B
  const indexB = new Map<string, number[]>();
  for (let i = 0; i < tokensB.length; i++) {
    const norm = tokensB[i].norm;
    if (norm.length > 1) {
      if (!indexB.has(norm)) {
        indexB.set(norm, []);
      }
      indexB.get(norm)!.push(i);
    }
  }

  interface RawMatch {
    startAIdx: number;
    endAIdx: number;
    startBIdx: number;
    endBIdx: number;
    wordCount: number;
    charCount: number;
  }

  const rawMatches: RawMatch[] = [];

  // Sliding search across tokensA
  for (let i = 0; i < tokensA.length; i++) {
    const normA = tokensA[i].norm;
    if (!normA || normA.length <= 1) continue;

    const candidateStartsB = indexB.get(normA);
    if (!candidateStartsB) continue;

    for (const j of candidateStartsB) {
      // Check match length starting at tokensA[i] and tokensB[j]
      let len = 0;
      while (
        i + len < tokensA.length &&
        j + len < tokensB.length &&
        tokensA[i + len].norm === tokensB[j + len].norm &&
        tokensA[i + len].norm !== ''
      ) {
        len++;
      }

      if (len >= 3) {
        const startA = tokensA[i].start;
        const endA = tokensA[i + len - 1].end;
        const charLenA = endA - startA;

        // Check criteria: at least 6 words OR at least 40 characters
        if (len >= MIN_WORDS || charLenA >= MIN_CHARS) {
          rawMatches.push({
            startAIdx: i,
            endAIdx: i + len - 1,
            startBIdx: j,
            endBIdx: j + len - 1,
            wordCount: len,
            charCount: charLenA,
          });
        }
      }
    }
  }

  // Sort raw matches: prefer longest matches first (by wordCount then charCount)
  rawMatches.sort((a, b) => b.wordCount - a.wordCount || b.charCount - a.charCount);

  // Greedily pick non-overlapping matches
  const usedA = new Array<boolean>(tokensA.length).fill(false);
  const usedB = new Array<boolean>(tokensB.length).fill(false);

  const accepted: RawMatch[] = [];

  for (const m of rawMatches) {
    // Check if substantial overlap with already used tokens
    let overlaps = false;
    for (let idx = m.startAIdx; idx <= m.endAIdx; idx++) {
      if (usedA[idx]) {
        overlaps = true;
        break;
      }
    }
    if (overlaps) continue;

    for (let idx = m.startBIdx; idx <= m.endBIdx; idx++) {
      if (usedB[idx]) {
        overlaps = true;
        break;
      }
    }
    if (overlaps) continue;

    // Accept this match
    accepted.push(m);
    for (let idx = m.startAIdx; idx <= m.endAIdx; idx++) {
      usedA[idx] = true;
    }
    for (let idx = m.startBIdx; idx <= m.endBIdx; idx++) {
      usedB[idx] = true;
    }
  }

  // Sort accepted matches in sequential order of their appearance in document A
  accepted.sort((a, b) => a.startAIdx - b.startAIdx);

  // Convert to MatchingPassage objects with 1-based IDs
  return accepted.map((m, idx) => {
    const startA = tokensA[m.startAIdx].start;
    const endA = tokensA[m.endAIdx].end;
    const startB = tokensB[m.startBIdx].start;
    const endB = tokensB[m.endBIdx].end;

    return {
      id: idx + 1,
      textA: textA.slice(startA, endA),
      textB: textB.slice(startB, endB),
      startA,
      endA,
      startB,
      endB,
      wordCount: m.wordCount,
      charCount: endA - startA,
    };
  });
}

/**
 * Slices a document's full raw text into highlighted and plain segments based on matches.
 */
export function segmentTextWithMatches(
  text: string,
  matches: Array<{ id: number; start: number; end: number }>
): TextSegment[] {
  if (!text) return [];
  if (matches.length === 0) {
    return [{ text, isMatch: false }];
  }

  // Ensure matches are sorted by start offset
  const sorted = [...matches].sort((a, b) => a.start - b.start);
  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const m of sorted) {
    // Plain text before match
    if (m.start > cursor) {
      segments.push({
        text: text.slice(cursor, m.start),
        isMatch: false,
      });
    }

    // Match segment
    const matchText = text.slice(m.start, m.end);
    if (matchText) {
      segments.push({
        text: matchText,
        matchId: m.id,
        isMatch: true,
      });
    }
    cursor = Math.max(cursor, m.end);
  }

  // Trailing plain text
  if (cursor < text.length) {
    segments.push({
      text: text.slice(cursor),
      isMatch: false,
    });
  }

  return segments;
}
