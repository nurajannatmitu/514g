import React from 'react';
import { UploadedDoc } from '../types';
import { computeComparison } from '../utils/similarityEngine';

interface HeatmapProps {
  docs: UploadedDoc[];
  selectedAId: string;
  selectedBId: string;
  onSelectPair: (docAId: string, docBId: string) => void;
}

export const HeatmapMatrix: React.FC<HeatmapProps> = ({
  docs,
  selectedAId,
  selectedBId,
  onSelectPair,
}) => {
  const readyDocs = docs.filter((d) => d.status === 'ready');

  if (readyDocs.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-[#262630] rounded-xl bg-[#0e0e12] min-h-[220px]">
        <span className="text-xs text-[#8e8579] max-w-sm">
          Upload at least 2 documents to generate the full pairwise similarity matrix.
        </span>
      </div>
    );
  }

  // Generate color styles based on similarity (0 to 1)
  const getCellColor = (sim: number, isDiagonal: boolean) => {
    if (isDiagonal) {
      return {
        background: '#1c1c24',
        color: '#8e8579',
        border: '1px solid #282834',
      };
    }

    if (sim >= 0.85) {
      return {
        background: 'rgba(212, 122, 58, 0.85)',
        color: '#0e0e11',
        fontWeight: 600,
      };
    }
    if (sim >= 0.6) {
      return {
        background: 'rgba(212, 122, 58, 0.55)',
        color: '#efe6d4',
        fontWeight: 600,
      };
    }
    if (sim >= 0.35) {
      return {
        background: 'rgba(212, 122, 58, 0.30)',
        color: '#efe6d4',
      };
    }
    if (sim >= 0.15) {
      return {
        background: 'rgba(212, 122, 58, 0.15)',
        color: '#c5bcae',
      };
    }
    return {
      background: '#131318',
      color: '#6e675e',
    };
  };

  return (
    <div className="w-full overflow-x-auto select-none">
      <div className="inline-block min-w-full align-middle">
        <div className="flex flex-col gap-2">
          {/* Header row labels */}
          <div className="flex items-center gap-1.5 ml-12">
            {readyDocs.map((doc) => (
              <div
                key={doc.id}
                className="w-16 sm:w-20 text-center font-mono text-xs font-semibold text-[#efe6d4] truncate px-1"
                title={`${doc.label}: ${doc.name}`}
              >
                {doc.label}
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          {readyDocs.map((rowDoc) => (
            <div key={rowDoc.id} className="flex items-center gap-1.5">
              {/* Row Label */}
              <div
                className="w-10 text-right font-mono text-xs font-semibold text-[#efe6d4] pr-2 shrink-0 truncate"
                title={`${rowDoc.label}: ${rowDoc.name}`}
              >
                {rowDoc.label}
              </div>

              {/* Row Cells */}
              <div className="flex items-center gap-1.5">
                {readyDocs.map((colDoc) => {
                  const isDiagonal = rowDoc.id === colDoc.id;
                  const isSelectedPair =
                    (rowDoc.id === selectedAId && colDoc.id === selectedBId) ||
                    (rowDoc.id === selectedBId && colDoc.id === selectedAId);

                  const comp = isDiagonal
                    ? { cosineSimilarity: 1.0, jaccardSimilarity: 1.0 }
                    : computeComparison(rowDoc, colDoc, readyDocs);

                  const simValue = comp.cosineSimilarity;
                  const percentage = (simValue * 100).toFixed(1);
                  const style = getCellColor(simValue, isDiagonal);

                  return (
                    <button
                      key={colDoc.id}
                      type="button"
                      onClick={() => {
                        if (!isDiagonal) {
                          onSelectPair(rowDoc.id, colDoc.id);
                        }
                      }}
                      disabled={isDiagonal}
                      title={
                        isDiagonal
                          ? `${rowDoc.label}: Self (100%)`
                          : `${rowDoc.label} vs ${colDoc.label}: ${percentage}% Cosine Similarity`
                      }
                      style={style}
                      className={`w-16 h-12 sm:w-20 sm:h-14 rounded-lg flex flex-col items-center justify-center transition-all duration-150 relative text-xs font-mono group ${
                        isDiagonal
                          ? 'opacity-60 cursor-default'
                          : 'cursor-pointer hover:ring-2 hover:ring-[#d47a3a] hover:z-10 active:scale-95'
                      } ${
                        isSelectedPair
                          ? 'ring-2 ring-[#d47a3a] ring-offset-2 ring-offset-[#0a0a0c] z-20 shadow-[0_0_12px_rgba(212,122,58,0.4)]'
                          : ''
                      }`}
                    >
                      <span className="text-xs tracking-tight font-medium">
                        {isDiagonal ? '—' : `${percentage}%`}
                      </span>
                      {!isDiagonal && (
                        <span className="text-[9px] opacity-75 hidden sm:inline">
                          J: {(comp.jaccardSimilarity * 100).toFixed(0)}%
                        </span>
                      )}

                      {/* Active Indicator dot */}
                      {isSelectedPair && !isDiagonal && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#d47a3a] ring-2 ring-[#0a0a0c]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[11px] font-mono text-[#8e8579] mt-3">
        Click any cell in the heatmap to load that document pair into the main inspector.
      </p>
    </div>
  );
};
