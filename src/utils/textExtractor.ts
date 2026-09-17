import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { DocFormat } from '../types';

// Set up the worker from unpkg 3.11.174 as specified in requirements
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}

export const MAX_FILE_SIZE_BYTES = 12 * 1024 * 1024; // 12MB limit

export async function extractTextFromFile(file: File): Promise<{
  text: string;
  format: DocFormat;
  isScannedOrLowText: boolean;
}> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File "${file.name}" exceeds 12MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  let format: DocFormat = 'text';

  if (extension === 'pdf' || file.type === 'application/pdf') {
    format = 'pdf';
  } else if (
    extension === 'docx' ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    format = 'docx';
  } else {
    throw new Error(`Unsupported file type ".${extension}". Only PDF and DOCX files are supported.`);
  }

  const arrayBuffer = await file.arrayBuffer();
  let extractedText = '';

  if (format === 'pdf') {
    extractedText = await extractPdfText(arrayBuffer);
  } else if (format === 'docx') {
    extractedText = await extractDocxText(arrayBuffer);
  }

  const cleanText = extractedText.trim();
  const isScannedOrLowText = cleanText.length < 80;

  return {
    text: cleanText,
    format,
    isScannedOrLowText,
  };
}

async function extractPdfText(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      stopAtErrors: false,
    });
    const pdf = await loadingTask.promise;
    const pagePromises: Promise<string>[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      pagePromises.push(
        pdf.getPage(i).then(async (page) => {
          const content = await page.getTextContent();
          return content.items
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((item: any) => ('str' in item ? item.str : ''))
            .join(' ');
        })
      );
    }

    const pages = await Promise.all(pagePromises);
    return pages.join('\n\n');
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse PDF document: ${errorMsg}`);
  }
}

async function extractDocxText(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || '';
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse DOCX document: ${errorMsg}`);
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
