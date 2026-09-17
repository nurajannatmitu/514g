import React from 'react';
import { ArrowLeftRight, FileText, CheckCircle2, Layers } from 'lucide-react';
import { UploadedDoc } from '../types';
import { computeComparison } from '../utils/similarityEngine';
import { CircularMeter } from './CircularMeter';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { BorderBeam } from './BorderBeam';

interface PairComparatorProps {
  docs: UploadedDoc[];
  selectedAId: string;
  selectedBId: string;
  onSelectA: (id: string) => void;
  onSelectB: (id: string) => void;
  onSwap: () => void;
}

export const PairComparator: React.FC<PairComparatorProps> = ({
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

  if (readyDocs.length < 2) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
        <div className="w-12 h-12 rounded-xl bg-[#14141a] border border-[#262632] flex items-center justify-center mb-3 text-[#d47a3a]">
          <Layers className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-[#efe6d4]">Pairwise Comparator Offline</h4>
        <p className="text-xs text-[#8e8579] max-w-sm mt-1">
          Minimum 2 documents required to compute similarity. One file cannot run compare. Upload another PDF or DOCX file to proceed.
        </p>
      </Card>
    );
  }

  if (!docA || !docB) {
    return (
      <Card className="p-8 text-center">
        <p className="text-xs text-[#8e8579]">Please select two valid documents to compare.</p>
      </Card>
    );
  }

  const comparison = computeComparison(docA, docB, readyDocs);

  return (
    <Card className="relative overflow-hidden border-[#252530]">
      {/* Subtle border beam accent */}
      <BorderBeam size={220} duration={14} colorFrom="#d47a3a" />

      <CardHeader className="bg-[#0c0c10] border-b border-[#1c1c24] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5">
        <div>
          <CardTitle className="text-sm font-semibold text-[#efe6d4] flex items-center gap-2">
            <span>Pairwise Comparator</span>
            <span className="text-[#8e8579] font-normal font-mono text-xs">
              [{docA.label}] vs [{docB.label}]
            </span>
          </CardTitle>
          <p className="text-xs text-[#8e8579] mt-0.5">
            Real-time client-side TF-IDF Cosine &amp; Jaccard coefficient evaluation
          </p>
        </div>

        {/* Compare [A] with [B] switcher & Swap button */}
        <div className="flex items-center gap-2 shrink-0 bg-[#121217] p-1.5 rounded-lg border border-[#242430]">
          {/* Doc A Selector */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-mono text-[#d47a3a] font-bold px-1">[A]</span>
            <select
              value={docA.id}
              onChange={(e) => onSelectA(e.target.value)}
              className="bg-[#181820] text-[#efe6d4] text-xs rounded border border-[#2b2b36] px-2 py-1 font-mono focus:outline-none focus:border-[#d47a3a]"
            >
              {readyDocs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}: {d.name.slice(0, 18)}...
                </option>
              ))}
            </select>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onSwap}
            title="Swap Document A and Document B"
            className="h-7 w-7 text-[#c5bcae] hover:text-[#efe6d4] hover:bg-[#1f1f2a]"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </Button>

          {/* Doc B Selector */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-mono text-[#d47a3a] font-bold px-1">[B]</span>
            <select
              value={docB.id}
              onChange={(e) => onSelectB(e.target.value)}
              className="bg-[#181820] text-[#efe6d4] text-xs rounded border border-[#2b2b36] px-2 py-1 font-mono focus:outline-none focus:border-[#d47a3a]"
            >
              {readyDocs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}: {d.name.slice(0, 18)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Animated Circular Meter */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <CircularMeter
            value={comparison.cosineSimilarity}
            jaccard={comparison.jaccardSimilarity}
            category={comparison.category}
            docALabel={docA.label}
            docBLabel={docB.label}
          />
        </div>

        {/* Right Column: In-depth Breakdown */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Summary card */}
          <div className="p-3.5 rounded-xl bg-[#0e0e12] border border-[#202028]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#8e8579] block mb-1">
              Semantic Assessment
            </span>
            <p className="text-xs text-[#efe6d4] leading-relaxed">
              {comparison.summary}
            </p>
          </div>

          {/* Side-by-side Document Metadata Comparison */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-[#0c0c10] border border-[#1f1f26]">
              <div className="flex items-center gap-1.5 text-[#d47a3a] font-semibold mb-1 truncate">
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">[{docA.label}] {docA.name}</span>
              </div>
              <div className="text-[11px] text-[#8e8579] space-y-0.5 mt-2">
                <div>Tokens: <span className="text-[#efe6d4]">{docA.tokens.length}</span></div>
                <div>Vocabulary: <span className="text-[#efe6d4]">{docA.tokenCounts.size}</span></div>
                <div>Characters: <span className="text-[#efe6d4]">{docA.charCount}</span></div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0c0c10] border border-[#1f1f26]">
              <div className="flex items-center gap-1.5 text-[#d47a3a] font-semibold mb-1 truncate">
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">[{docB.label}] {docB.name}</span>
              </div>
              <div className="text-[11px] text-[#8e8579] space-y-0.5 mt-2">
                <div>Tokens: <span className="text-[#efe6d4]">{docB.tokens.length}</span></div>
                <div>Vocabulary: <span className="text-[#efe6d4]">{docB.tokenCounts.size}</span></div>
                <div>Characters: <span className="text-[#efe6d4]">{docB.charCount}</span></div>
              </div>
            </div>
          </div>

          {/* Overlap Metrics Table */}
          <div className="rounded-lg border border-[#202028] bg-[#0c0c10] overflow-hidden">
            <div className="px-3.5 py-2 border-b border-[#1b1b22] text-[11px] font-mono uppercase tracking-wider text-[#8e8579] flex items-center justify-between">
              <span>Pairwise Vocabulary Overlap</span>
              <span className="text-[#efe6d4]">
                {comparison.sharedTokensCount} / {comparison.unionTokensCount} unique terms
              </span>
            </div>

            <div className="p-3.5">
              <span className="text-[11px] font-mono text-[#8e8579] block mb-2">
                Top Shared Semantic Terms (Corpus TF-IDF weighted):
              </span>
              {comparison.topSharedKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {comparison.topSharedKeywords.map((item) => (
                    <Badge
                      key={item.word}
                      variant="copper"
                      className="text-xs px-2.5 py-1 gap-1.5"
                    >
                      <span>{item.word}</span>
                      <span className="text-[10px] text-[#8e8579] font-mono">
                        ({item.countA}|{item.countB})
                      </span>
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-[#706a61] italic">
                  No overlapping vocabulary terms detected between these two documents.
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
