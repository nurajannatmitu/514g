export type DocFormat = 'pdf' | 'docx' | 'text';

export interface UploadedDoc {
  id: string;
  label: string; // "D1", "D2", "D3", "D4", "D5"
  name: string;
  size: number;
  format: DocFormat;
  rawText: string;
  charCount: number;
  wordCount: number;
  tokens: string[];
  tokenCounts: Map<string, number>;
  isScannedOrLowText: boolean;
  status: 'idle' | 'parsing' | 'ready' | 'error';
  errorMessage?: string;
  uploadedAt: number;
}

export interface SharedKeyword {
  word: string;
  countA: number;
  countB: number;
  score: number;
}

export interface ComparisonResult {
  docA: UploadedDoc;
  docB: UploadedDoc;
  cosineSimilarity: number; // 0 to 1
  jaccardSimilarity: number; // 0 to 1
  sharedTokensCount: number;
  unionTokensCount: number;
  topSharedKeywords: SharedKeyword[];
  category: 'identical' | 'high' | 'moderate' | 'low' | 'distinct';
  summary: string;
}

export interface HeatmapCell {
  rowDocId: string;
  colDocId: string;
  rowLabel: string;
  colLabel: string;
  cosineSimilarity: number;
  jaccardSimilarity: number;
}
