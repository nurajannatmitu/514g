import React, { useState, useMemo } from 'react';
import { ArrowLeftRight, ChevronLeft, ChevronRight, AlertTriangle, FileText } from 'lucide-react';
import { UploadedDoc } from '../types';
import { findMatchingPassages, segmentTextWithMatches } from '../utils/passageMatcher';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';

interface SideBySideViewerProps {
  docs: UploadedDoc[];
  selectedAId: string;
  selectedBId: string;
  onSelectA: (id: string) => void;
  onSelectB: (id: string) => void;
  onSwap: () => void;
}

export const SideBySideViewer: React.FC<SideBySideViewerProps> = ({
  docs,
  selectedAId,
  selectedBId,
  onSelectA,
  onSelectB,
  onSwap,
}) => {
  const readyDocs = docs.filter((d) => d.status === 'ready');
  const docA = readyDocs.find((d) => d.id === selectedAId);
  const docB = readyDocs.find((d) => d.id === selectedBId);

  const [activeMatchId, setActiveMatchId] = useState<number | null>(null);

  // Compute matching passages (memoized for performance)
  const matches = useMemo(() => {
    if (!docA || !docB || docA.id === docB.id) return [];
    return findMatchingPassages(docA.rawText, docB.rawText);
  }, [docA, docB]);

  // Sliced segments for Doc A and Doc B
  const segmentsA = useMemo(() => {
    if (!docA) return [];
    const ranges = matches.map((m) => ({ id: m.id, start: m.startA, end: m.endA }));
    return segmentTextWithMatches(docA.rawText, ranges);
  }, [docA, matches]);

  const segmentsB = useMemo(() => {
    if (!docB) return [];
    const ranges = matches.map((m) => ({ id: m.id, start: m.startB, end: m.endB }));
    return segmentTextWithMatches(docB.rawText, ranges);
  }, [docB, matches]);

  const handleMatchJump = (matchId: number) => {
    setActiveMatchId(matchId);
    const elLeft = document.getElementById(`match-left-${matchId}`);
    const elRight = document.getElementById(`match-right-${matchId}`);

    if (elLeft) {
      elLeft.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (elRight) {
      elRight.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNextMatch = () => {
    if (matches.length === 0) return;
    if (activeMatchId === null) {
      handleMatchJump(matches[0].id);
    } else {
      const currentIdx = matches.findIndex((m) => m.id === activeMatchId);
      const nextIdx = (currentIdx + 1) % matches.length;
      handleMatchJump(matches[nextIdx].id);
    }
  };

  const handlePrevMatch = () => {
    if (matches.length === 0) return;
    if (activeMatchId === null) {
      handleMatchJump(matches[matches.length - 1].id);
    } else {
      const currentIdx = matches.findIndex((m) => m.id === activeMatchId);
      const prevIdx = (currentIdx - 1 + matches.length) % matches.length;
      handleMatchJump(matches[prevIdx].id);
    }
  };

  if (readyDocs.length < 2) {
    return (
      <Card className="p-10 text-center border-dashed">
        <p className="text-xs text-[#8e8579]">
          Upload at least 2 documents to view side-by-side matching passages.
        </p>
      </Card>
    );
  }

  if (!docA || !docB) {
    return (
      <Card className="p-8 text-center">
        <p className="text-xs text-[#8e8579]">Please select two valid documents to inspect.</p>
      </Card>
    );
  }

  const isSelfCompare = docA.id === docB.id;

  return (
    <Card className="border-[#222228] bg-[#0c0c10] flex flex-col">
      {/* Top Controls Bar: Document chips and match stats */}
      <CardHeader className="p-4 border-b border-[#1c1c24] flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">Side-by-Side Matching Passages</CardTitle>
            <span className="font-mono text-xs text-[#8e8579]">
              [{docA.label}] vs [{docB.label}]
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Match count badge */}
            <div className="flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-md bg-[#131d2e] border border-[#234275] text-[#93c5fd]">
              <span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse" />
              <span className="font-semibold">
                {isSelfCompare
                  ? 'Identical document (100% match)'
                  : `${matches.length} matching passage${matches.length === 1 ? '' : 's'}`}
              </span>
            </div>

            {/* Match Navigation Buttons */}
            {matches.length > 0 && (
              <div className="flex items-center gap-1 bg-[#14141c] p-0.5 rounded-lg border border-[#242430]">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevMatch}
                  title="Previous match"
                  className="h-7 w-7 text-[#c5bcae] hover:text-[#efe6d4]"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <span className="text-[11px] font-mono px-1 text-[#8e8579]">
                  {activeMatchId !== null ? `#${activeMatchId}/${matches.length}` : `All`}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleNextMatch}
                  title="Next match"
                  className="h-7 w-7 text-[#c5bcae] hover:text-[#efe6d4]"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Document Selection Chips (D1–D5) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#181822] text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-[#8e8579] mr-1">Select pair:</span>
            {readyDocs.map((doc) => {
              const isA = doc.id === docA.id;
              const isB = doc.id === docB.id;

              return (
                <div
                  key={doc.id}
                  className={`inline-flex items-center rounded-md text-xs font-mono border transition-all ${
                    isA
                      ? 'bg-[#1e1b18] border-[#d47a3a] text-[#efe6d4] shadow-[0_0_8px_rgba(212,122,58,0.25)]'
                      : isB
                      ? 'bg-[#151c28] border-[#3b82f6] text-[#efe6d4] shadow-[0_0_8px_rgba(59,130,246,0.25)]'
                      : 'bg-[#14141a] border-[#252532] text-[#8e8579] hover:border-[#3b3b4d] hover:text-[#efe6d4]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectA(doc.id)}
                    title={`Set ${doc.label} (${doc.name}) as Left [A]`}
                    className={`px-2 py-1 hover:bg-[#20202a] transition-colors rounded-l-md ${
                      isA ? 'text-[#d47a3a] font-bold' : ''
                    }`}
                  >
                    {doc.label}
                    {isA && <span className="ml-1 text-[10px]">[L]</span>}
                  </button>

                  <span className="text-[#323240]">&bull;</span>

                  <button
                    type="button"
                    onClick={() => onSelectB(doc.id)}
                    title={`Set ${doc.label} (${doc.name}) as Right [B]`}
                    className={`px-2 py-1 hover:bg-[#20202a] transition-colors rounded-r-md ${
                      isB ? 'text-[#60a5fa] font-bold' : ''
                    }`}
                  >
                    {isB ? <span className="text-[10px] mr-1">[R]</span> : ''}
                    {doc.label}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSwap}
              className="text-xs h-7 gap-1"
            >
              <ArrowLeftRight className="w-3 h-3 text-[#d47a3a]" />
              <span>Swap Sides</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Two Scrollable Columns */}
      <CardContent className="p-0 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#1c1c24]">
        {/* Left Column: Document A */}
        <div className="flex flex-col min-w-0">
          {/* Column Header */}
          <div className="p-3 bg-[#0f0f14] border-b border-[#1c1c24] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Badge variant="copper" className="text-[10px] shrink-0 font-mono">
                {docA.label} &bull; LEFT
              </Badge>
              <span className="font-medium text-xs text-[#efe6d4] truncate" title={docA.name}>
                {docA.name}
              </span>
            </div>
            <div className="text-[11px] font-mono text-[#8e8579] shrink-0">
              {docA.wordCount.toLocaleString()} words
            </div>
          </div>

          {/* Left Text Canvas */}
          <div className="p-4 h-[560px] overflow-y-auto bg-[#0a0a0d] font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-[#3b82f6]/40 selection:text-white">
            {docA.isScannedOrLowText ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[#e69d43] space-y-2">
                <AlertTriangle className="w-6 h-6 text-[#e69d43]" />
                <span className="font-semibold text-xs">Scanned or Low-Text Document</span>
                <p className="text-[11px] text-[#b88c52] max-w-xs">
                  Extracted text contains only {docA.charCount} characters (&lt; 80 chars). Client-side parsing cannot extract text from image-only pages without OCR.
                </p>
              </div>
            ) : segmentsA.length > 0 ? (
              segmentsA.map((seg, idx) => {
                if (!seg.isMatch || !seg.matchId) {
                  return <span key={idx} className="text-[#c5bcae]">{seg.text}</span>;
                }

                const isCurrent = activeMatchId === seg.matchId;

                return (
                  <mark
                    key={idx}
                    id={`match-left-${seg.matchId}`}
                    onClick={() => handleMatchJump(seg.matchId!)}
                    onMouseEnter={() => setActiveMatchId(seg.matchId!)}
                    title={`Match #${seg.matchId} (Click to synchronize right side)`}
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.28)' }}
                    className={`text-[#efe6d4] rounded px-1 py-0.5 border cursor-pointer transition-all duration-150 inline ${
                      isCurrent
                        ? 'border-[#60a5fa] ring-2 ring-[#3b82f6]/50 bg-[rgba(59,130,246,0.5)]'
                        : 'border-[#3b82f6]/40 hover:border-[#60a5fa] hover:bg-[rgba(59,130,246,0.4)]'
                    }`}
                  >
                    <span className="inline-flex items-center justify-center font-mono font-bold text-[9px] bg-[#2563eb] text-white rounded px-1 py-0.2 mr-1 select-none align-baseline">
                      #{seg.matchId}
                    </span>
                    {seg.text}
                  </mark>
                );
              })
            ) : (
              <span className="text-[#6e675e] italic">No text available.</span>
            )}
          </div>
        </div>

        {/* Right Column: Document B */}
        <div className="flex flex-col min-w-0">
          {/* Column Header */}
          <div className="p-3 bg-[#0f0f14] border-b border-[#1c1c24] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Badge variant="copper" className="text-[10px] shrink-0 font-mono bg-[#19243a] text-[#60a5fa] border-[#29457a]">
                {docB.label} &bull; RIGHT
              </Badge>
              <span className="font-medium text-xs text-[#efe6d4] truncate" title={docB.name}>
                {docB.name}
              </span>
            </div>
            <div className="text-[11px] font-mono text-[#8e8579] shrink-0">
              {docB.wordCount.toLocaleString()} words
            </div>
          </div>

          {/* Right Text Canvas */}
          <div className="p-4 h-[560px] overflow-y-auto bg-[#0a0a0d] font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-[#3b82f6]/40 selection:text-white">
            {docB.isScannedOrLowText ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[#e69d43] space-y-2">
                <AlertTriangle className="w-6 h-6 text-[#e69d43]" />
                <span className="font-semibold text-xs">Scanned or Low-Text Document</span>
                <p className="text-[11px] text-[#b88c52] max-w-xs">
                  Extracted text contains only {docB.charCount} characters (&lt; 80 chars). Client-side parsing cannot extract text from image-only pages without OCR.
                </p>
              </div>
            ) : segmentsB.length > 0 ? (
              segmentsB.map((seg, idx) => {
                if (!seg.isMatch || !seg.matchId) {
                  return <span key={idx} className="text-[#c5bcae]">{seg.text}</span>;
                }

                const isCurrent = activeMatchId === seg.matchId;

                return (
                  <mark
                    key={idx}
                    id={`match-right-${seg.matchId}`}
                    onClick={() => handleMatchJump(seg.matchId!)}
                    onMouseEnter={() => setActiveMatchId(seg.matchId!)}
                    title={`Match #${seg.matchId} (Click to synchronize left side)`}
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.28)' }}
                    className={`text-[#efe6d4] rounded px-1 py-0.5 border cursor-pointer transition-all duration-150 inline ${
                      isCurrent
                        ? 'border-[#60a5fa] ring-2 ring-[#3b82f6]/50 bg-[rgba(59,130,246,0.5)]'
                        : 'border-[#3b82f6]/40 hover:border-[#60a5fa] hover:bg-[rgba(59,130,246,0.4)]'
                    }`}
                  >
                    <span className="inline-flex items-center justify-center font-mono font-bold text-[9px] bg-[#2563eb] text-white rounded px-1 py-0.2 mr-1 select-none align-baseline">
                      #{seg.matchId}
                    </span>
                    {seg.text}
                  </mark>
                );
              })
            ) : (
              <span className="text-[#6e675e] italic">No text available.</span>
            )}
          </div>
        </div>
      </CardContent>

      {/* Footer info banner */}
      <div className="p-3 bg-[#0a0a0c] border-t border-[#1c1c24] flex items-center justify-between text-[11px] font-mono text-[#8e8579] px-4">
        <span>
          Click or hover any blue passage to automatically synchronize and scroll into view.
        </span>
        <span className="hidden sm:inline">
          Filter: &ge; 6 consecutive words or &ge; 40 chars
        </span>
      </div>
    </Card>
  );
};
