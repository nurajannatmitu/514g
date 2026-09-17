import { ComparisonResult, HeatmapCell, SharedKeyword, UploadedDoc } from '../types';

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any',
  'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
  'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot', 'could', 'couldn\'t',
  'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
  'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
  'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here',
  'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it',
  'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my',
  'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t',
  'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some',
  'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re',
  'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up',
  'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were',
  'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which',
  'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would',
  'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours',
  'yourself', 'yourselves', 'also', 'etc', 'via', 'using', 'used', 'within', 'one',
  'two', 'three', 'may', 'might', 'will', 'just', 'well', 'like', 'even'
]);

/**
 * Clean and tokenize raw document text into meaningful normalized terms.
 */
export function tokenizeText(text: string): { tokens: string[]; tokenCounts: Map<string, number> } {
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, ' ')
    .split(/\s+/);

  const tokens: string[] = [];
  const tokenCounts = new Map<string, number>();

  for (const rawWord of words) {
    const word = rawWord.trim().replace(/^[-_]+|[-_]+$/g, '');
    if (word.length >= 2 && !STOP_WORDS.has(word) && !/^\d+$/.test(word)) {
      tokens.push(word);
      tokenCounts.set(word, (tokenCounts.get(word) || 0) + 1);
    }
  }

  return { tokens, tokenCounts };
}

/**
 * Computes TF-IDF vectors for a collection of documents and evaluates pairwise metrics.
 */
export function computeComparison(
  docA: UploadedDoc,
  docB: UploadedDoc,
  corpus: UploadedDoc[]
): ComparisonResult {
  if (docA.id === docB.id) {
    return {
      docA,
      docB,
      cosineSimilarity: 1.0,
      jaccardSimilarity: 1.0,
      sharedTokensCount: docA.tokens.length,
      unionTokensCount: docA.tokens.length,
      topSharedKeywords: getSelfKeywords(docA),
      category: 'identical',
      summary: 'Exact identical document source. Term frequency and structural overlap are 100% matched.'
    };
  }

  // Handle empty or very short docs
  if (docA.tokens.length === 0 || docB.tokens.length === 0) {
    return {
      docA,
      docB,
      cosineSimilarity: 0,
      jaccardSimilarity: 0,
      sharedTokensCount: 0,
      unionTokensCount: 0,
      topSharedKeywords: [],
      category: 'distinct',
      summary: 'Insufficient extracted vocabulary to compute semantic similarity.'
    };
  }

  // 1. Compute corpus Document Frequencies (DF)
  const N = Math.max(corpus.length, 2);
  const docFrequency = new Map<string, number>();

  for (const doc of corpus) {
    const uniqueTerms = new Set(doc.tokenCounts.keys());
    for (const term of uniqueTerms) {
      docFrequency.set(term, (docFrequency.get(term) || 0) + 1);
    }
  }

  // 2. Compute IDF for all terms in A and B
  // Smoothed formula: ln((1 + N) / (1 + df)) + 1
  const idf = (term: string) => {
    const df = docFrequency.get(term) || 1;
    return Math.log((1 + N) / (1 + df)) + 1;
  };

  // 3. Vector representations: TF-IDF
  const lengthA = docA.tokens.length || 1;
  const lengthB = docB.tokens.length || 1;

  const vectorA = new Map<string, number>();
  let normA = 0;
  for (const [term, count] of docA.tokenCounts.entries()) {
    const tf = count / lengthA;
    const weight = tf * idf(term);
    vectorA.set(term, weight);
    normA += weight * weight;
  }
  normA = Math.sqrt(normA);

  const vectorB = new Map<string, number>();
  let normB = 0;
  for (const [term, count] of docB.tokenCounts.entries()) {
    const tf = count / lengthB;
    const weight = tf * idf(term);
    vectorB.set(term, weight);
    normB += weight * weight;
  }
  normB = Math.sqrt(normB);

  // 4. Dot Product
  let dotProduct = 0;
  const sharedKeywordsList: SharedKeyword[] = [];

  for (const [term, weightA] of vectorA.entries()) {
    const weightB = vectorB.get(term);
    if (weightB !== undefined) {
      dotProduct += weightA * weightB;
      const countA = docA.tokenCounts.get(term) || 0;
      const countB = docB.tokenCounts.get(term) || 0;
      sharedKeywordsList.push({
        word: term,
        countA,
        countB,
        score: weightA * weightB,
      });
    }
  }

  let cosine = 0;
  if (normA > 0 && normB > 0) {
    cosine = dotProduct / (normA * normB);
  }
  // Clamp between 0 and 1
  cosine = Math.max(0, Math.min(1, cosine));

  // 5. Jaccard Similarity: |A intersect B| / |A union B| on unique vocabulary
  const setA = new Set(docA.tokenCounts.keys());
  const setB = new Set(docB.tokenCounts.keys());
  let intersectionCount = 0;
  for (const term of setA) {
    if (setB.has(term)) {
      intersectionCount++;
    }
  }
  const unionCount = new Set([...setA, ...setB]).size;
  const jaccard = unionCount > 0 ? intersectionCount / unionCount : 0;

  // Sort shared keywords by combined importance
  sharedKeywordsList.sort((a, b) => b.score - a.score);
  const topSharedKeywords = sharedKeywordsList.slice(0, 12);

  // Determine category & summary
  let category: ComparisonResult['category'] = 'distinct';
  let summary = '';

  if (cosine >= 0.94) {
    category = 'identical';
    summary = 'Nearly identical text structure and thematic vocabulary. Documents likely represent minor revisions or duplicates.';
  } else if (cosine >= 0.65) {
    category = 'high';
    summary = 'High degree of shared terminology and topic coverage. Significant sections or arguments overlap directly.';
  } else if (cosine >= 0.35) {
    category = 'moderate';
    summary = 'Moderate semantic overlap. The documents share core themes or domain vocabulary, but differ in composition.';
  } else if (cosine >= 0.12) {
    category = 'low';
    summary = 'Low topical correlation. Occasional shared domain terminology without structural overlap.';
  } else {
    category = 'distinct';
    summary = 'Distinct documents with disparate vocabulary and independent subject matter.';
  }

  return {
    docA,
    docB,
    cosineSimilarity: cosine,
    jaccardSimilarity: jaccard,
    sharedTokensCount: intersectionCount,
    unionTokensCount: unionCount,
    topSharedKeywords,
    category,
    summary,
  };
}

function getSelfKeywords(doc: UploadedDoc): SharedKeyword[] {
  const list: SharedKeyword[] = [];
  for (const [term, count] of doc.tokenCounts.entries()) {
    list.push({
      word: term,
      countA: count,
      countB: count,
      score: count,
    });
  }
  list.sort((a, b) => b.countA - a.countA);
  return list.slice(0, 12);
}

/**
 * Builds the full pairwise heatmap matrix for all ready documents.
 */
export function buildHeatmapMatrix(docs: UploadedDoc[]): HeatmapCell[][] {
  const readyDocs = docs.filter((d) => d.status === 'ready');
  const matrix: HeatmapCell[][] = [];

  for (let i = 0; i < readyDocs.length; i++) {
    const row: HeatmapCell[] = [];
    for (let j = 0; j < readyDocs.length; j++) {
      const docA = readyDocs[i];
      const docB = readyDocs[j];

      if (i === j) {
        row.push({
          rowDocId: docA.id,
          colDocId: docB.id,
          rowLabel: docA.label,
          colLabel: docB.label,
          cosineSimilarity: 1.0,
          jaccardSimilarity: 1.0,
        });
      } else {
        const comp = computeComparison(docA, docB, readyDocs);
        row.push({
          rowDocId: docA.id,
          colDocId: docB.id,
          rowLabel: docA.label,
          colLabel: docB.label,
          cosineSimilarity: comp.cosineSimilarity,
          jaccardSimilarity: comp.jaccardSimilarity,
        });
      }
    }
    matrix.push(row);
  }

  return matrix;
}
