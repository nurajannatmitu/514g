import React, { useState } from 'react';
import { FileText, Trash2, AlertTriangle, Eye, CheckCircle2, Loader2, X } from 'lucide-react';
import { UploadedDoc } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { formatBytes } from '../utils/textExtractor';

interface DocumentListProps {
  docs: UploadedDoc[];
  onRemoveDoc: (id: string) => void;
  selectedAId: string;
  selectedBId: string;
  onSetAsA: (id: string) => void;
  onSetAsB: (id: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  docs,
  onRemoveDoc,
  selectedAId,
  selectedBId,
  onSetAsA,
  onSetAsB,
}) => {
  const [viewingDoc, setViewingDoc] = useState<UploadedDoc | null>(null);

  if (docs.length === 0) {
    return (
      <div className="p-6 text-center border border-dashed border-[#222228] rounded-xl bg-[#0c0c10] text-[#8e8579] text-xs">
        No documents loaded. Upload 2–5 PDF/DOCX files above or click &quot;Load 3 Sample Docs&quot;.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between text-xs text-[#8e8579] px-1">
        <span>Loaded Documents ({docs.length}/5)</span>
        <span>Min: 2 &bull; Max: 5</span>
      </div>

      <div className="space-y-2">
        {docs.map((doc) => {
          const isA = doc.id === selectedAId;
          const isB = doc.id === selectedBId;

          return (
            <div
              key={doc.id}
              className={`p-3.5 rounded-xl border transition-all duration-200 bg-[#0f0f13] flex flex-col gap-2.5 ${
                isA || isB
                  ? 'border-[#383844] shadow-[0_2px_12px_rgba(0,0,0,0.3)]'
                  : 'border-[#202026] hover:border-[#2d2d38]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Slot identifier D1..D5 */}
                  <div className="w-7 h-7 rounded-md bg-[#181820] border border-[#2b2b36] flex items-center justify-center font-mono font-bold text-xs text-[#d47a3a] shrink-0">
                    {doc.label}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs text-[#efe6d4] truncate max-w-[220px] sm:max-w-[340px]" title={doc.name}>
                        {doc.name}
                      </span>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {doc.format}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#8e8579] mt-0.5">
                      <span>{formatBytes(doc.size)}</span>
                      <span>&bull;</span>
                      <span>{doc.wordCount.toLocaleString()} words</span>
                      <span>&bull;</span>
                      <span>{doc.charCount.toLocaleString()} chars</span>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {doc.status === 'parsing' && (
                    <Badge variant="neutral" className="gap-1 text-[10px]">
                      <Loader2 className="w-3 h-3 animate-spin text-[#d47a3a]" />
                      Parsing...
                    </Badge>
                  )}
                  {doc.status === 'ready' && !doc.isScannedOrLowText && (
                    <Badge variant="success" className="gap-1 text-[10px] hidden sm:inline-flex">
                      <CheckCircle2 className="w-3 h-3" />
                      Ready
                    </Badge>
                  )}
                  {doc.status === 'error' && (
                    <Badge variant="warning" className="gap-1 text-[10px]">
                      <AlertTriangle className="w-3 h-3" />
                      Error
                    </Badge>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewingDoc(doc)}
                    title="Inspect extracted text"
                    className="h-7 w-7 text-[#8e8579] hover:text-[#efe6d4]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveDoc(doc.id)}
                    title="Remove document"
                    className="h-7 w-7 text-[#8e8579] hover:text-[#f87171] hover:bg-[#281313]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Scanned PDF warning alert (< 80 chars) */}
              {doc.isScannedOrLowText && doc.status === 'ready' && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-[#28190d] border border-[#523315] text-[#f2ad61] text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#e69d43]" />
                  <div className="leading-snug">
                    <span className="font-medium">Scanned or image-only document warning:</span> Extracted text contains only {doc.charCount} characters (&lt; 80 chars). Client-side text parsing cannot extract text from raster images without OCR. Pairwise similarity may be inaccurate.
                  </div>
                </div>
              )}

              {/* Pairwise assignment controls */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1a1a22] text-[11px] font-mono">
                <span className="text-[#8e8579]">Assign to comparator:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSetAsA(doc.id)}
                    className={`px-2 py-0.5 rounded text-xs transition-colors ${
                      isA
                        ? 'bg-[#d47a3a] text-[#0a0a0c] font-bold'
                        : 'bg-[#181820] text-[#c5bcae] border border-[#2b2b36] hover:text-[#efe6d4] hover:bg-[#22222c]'
                    }`}
                  >
                    Set as [A]
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetAsB(doc.id)}
                    className={`px-2 py-0.5 rounded text-xs transition-colors ${
                      isB
                        ? 'bg-[#d47a3a] text-[#0a0a0c] font-bold'
                        : 'bg-[#181820] text-[#c5bcae] border border-[#2b2b36] hover:text-[#efe6d4] hover:bg-[#22222c]'
                    }`}
                  >
                    Set as [B]
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Extracted Text Inspector Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#101014] border border-[#252530] rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#1f1f28]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#d47a3a]" />
                <span className="text-sm font-medium text-[#efe6d4] truncate">
                  {viewingDoc.label}: {viewingDoc.name}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setViewingDoc(null)}
                className="h-8 w-8 text-[#8e8579] hover:text-[#efe6d4]"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4 overflow-y-auto font-mono text-xs text-[#c5bcae] whitespace-pre-wrap leading-relaxed bg-[#0b0b0e] m-4 rounded-lg border border-[#1b1b22] max-h-[60vh]">
              {viewingDoc.rawText || (
                <span className="italic text-[#706a61]">No plain text extracted from this file.</span>
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-[#1f1f28] text-xs font-mono text-[#8e8579]">
              <span>
                {viewingDoc.wordCount} words &bull; {viewingDoc.charCount} characters
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setViewingDoc(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
