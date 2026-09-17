/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Trash2,
  Sparkles,
  HelpCircle,
  Layers,
  FileCheck2,
  Info,
  Columns2,
} from 'lucide-react';
import { UploadedDoc } from './types';
import { extractTextFromFile } from './utils/textExtractor';
import { tokenizeText } from './utils/similarityEngine';
import { getInitializedSampleDocs } from './utils/sampleDocs';
import { FileUploader } from './components/FileUploader';
import { DocumentList } from './components/DocumentList';
import { PairComparator } from './components/PairComparator';
import { HeatmapMatrix } from './components/HeatmapMatrix';
import { SideBySideViewer } from './components/SideBySideViewer';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { Badge } from './components/ui/Badge';

export default function App() {
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [selectedAId, setSelectedAId] = useState<string>('');
  const [selectedBId, setSelectedBId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'comparator' | 'sidebyside' | 'heatmap'>('comparator');
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Synchronize slots (D1...D5) whenever docs array changes
  const assignSlots = (rawDocs: UploadedDoc[]): UploadedDoc[] => {
    return rawDocs.slice(0, 5).map((doc, idx) => ({
      ...doc,
      label: `D${idx + 1}`,
    }));
  };

  // Automatically pick first two ready docs when none are selected
  useEffect(() => {
    const readyDocs = docs.filter((d) => d.status === 'ready');
    if (readyDocs.length >= 2) {
      if (!selectedAId || !readyDocs.some((d) => d.id === selectedAId)) {
        setSelectedAId(readyDocs[0].id);
      }
      if (!selectedBId || !readyDocs.some((d) => d.id === selectedBId) || selectedBId === readyDocs[0].id) {
        setSelectedBId(readyDocs[1].id);
      }
    } else if (readyDocs.length === 1) {
      setSelectedAId(readyDocs[0].id);
      setSelectedBId('');
    } else {
      setSelectedAId('');
      setSelectedBId('');
    }
  }, [docs, selectedAId, selectedBId]);

  // Load sample demo documents on initial launch if empty
  const handleLoadSampleDocs = () => {
    const sampleDocs = getInitializedSampleDocs();
    setDocs(sampleDocs);
    if (sampleDocs.length >= 2) {
      setSelectedAId(sampleDocs[0].id);
      setSelectedBId(sampleDocs[1].id);
    }
  };

  // Process newly uploaded files
  const handleFilesSelected = async (files: File[]) => {
    const currentLength = docs.length;
    const availableSlots = 5 - currentLength;
    const filesToProcess = files.slice(0, availableSlots);

    const newDocs: UploadedDoc[] = filesToProcess.map((file, idx) => ({
      id: `doc-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      label: `D${currentLength + idx + 1}`,
      name: file.name,
      size: file.size,
      format: file.name.endsWith('.docx') ? 'docx' : 'pdf',
      rawText: '',
      charCount: 0,
      wordCount: 0,
      tokens: [],
      tokenCounts: new Map(),
      isScannedOrLowText: false,
      status: 'parsing',
      uploadedAt: Date.now(),
    }));

    setDocs((prev) => assignSlots([...prev, ...newDocs]));

    // Parse each file asynchronously in memory
    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      const targetDoc = newDocs[i];

      try {
        const { text, format, isScannedOrLowText } = await extractTextFromFile(file);
        const { tokens, tokenCounts } = tokenizeText(text);

        setDocs((prev) =>
          prev.map((d) =>
            d.id === targetDoc.id
              ? {
                  ...d,
                  format,
                  rawText: text,
                  charCount: text.length,
                  wordCount: tokens.length,
                  tokens,
                  tokenCounts,
                  isScannedOrLowText,
                  status: 'ready',
                }
              : d
          )
        );
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setDocs((prev) =>
          prev.map((d) =>
            d.id === targetDoc.id
              ? {
                  ...d,
                  status: 'error',
                  errorMessage: errorMsg,
                }
              : d
          )
        );
      }
    }
  };

  const handleRemoveDoc = (id: string) => {
    setDocs((prev) => assignSlots(prev.filter((d) => d.id !== id)));
  };

  const handleClearAll = () => {
    setDocs([]);
    setSelectedAId('');
    setSelectedBId('');
  };

  const handleSwapPair = () => {
    const temp = selectedAId;
    setSelectedAId(selectedBId);
    setSelectedBId(temp);
  };

  const handleSelectFromHeatmap = (docAId: string, docBId: string) => {
    setSelectedAId(docAId);
    setSelectedBId(docBId);
    setActiveTab('comparator');
  };

  const readyDocsCount = docs.filter((d) => d.status === 'ready').length;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#efe6d4] flex flex-col selection:bg-[#d47a3a]/30 selection:text-[#efe6d4]">
      {/* Top Navigation / App Header */}
      <header className="border-b border-[#1f1f26] bg-[#0c0c10]/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#181820] border border-[#2b2b36] flex items-center justify-center text-[#d47a3a] font-mono font-bold text-sm">
                //
              </div>
              <span className="font-bold tracking-tight text-base text-[#efe6d4]">OVERLAP</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 ml-2">
              <Badge variant="copper" className="text-[10px] tracking-wider uppercase">
                Zero-Upload Engine
              </Badge>
              <Badge variant="neutral" className="text-[10px] hidden md:inline-flex">
                PDF &bull; DOCX
              </Badge>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {docs.length === 0 ? (
              <Button
                type="button"
                variant="copper"
                size="sm"
                onClick={handleLoadSampleDocs}
                className="text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample Files</span>
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs text-[#8e8579] hover:text-[#f87171]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLoadSampleDocs}
                  className="text-xs text-[#c5bcae] hover:text-[#d47a3a]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reload Samples</span>
                </Button>
              </>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowHelpModal(true)}
              title="About Mathematical Formulas & Privacy"
              className="h-8 w-8 text-[#8e8579] hover:text-[#efe6d4]"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Privacy & Guarantee Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-lg bg-[#0e0e13] border border-[#1e1e26] text-xs">
          <div className="flex items-center gap-2 text-[#c5bcae]">
            <ShieldCheck className="w-4 h-4 text-[#4ade80] shrink-0" />
            <span>
              <strong className="text-[#efe6d4]">Zero-Server Transmission:</strong> Files are parsed strictly in your browser memory. No text or data leaves this machine.
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-[#8e8579] shrink-0">
            <span>Client-side PDF.js + Mammoth</span>
            <span>&bull;</span>
            <span className="text-[#d47a3a]">Max 12MB/file</span>
          </div>
        </div>

        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 cols): File Ingestion & Corpus Inventory */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Card>
              <CardHeader className="p-4 pb-3">
                <CardTitle className="text-sm">Document Ingestion</CardTitle>
                <p className="text-xs text-[#8e8579]">
                  Upload 2 to 5 PDF or DOCX documents to compare.
                </p>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-4">
                <FileUploader
                  onFilesSelected={handleFilesSelected}
                  currentCount={docs.length}
                  maxCount={5}
                  disabled={docs.length >= 5}
                  onLoadSampleDocs={handleLoadSampleDocs}
                />

                <DocumentList
                  docs={docs}
                  onRemoveDoc={handleRemoveDoc}
                  selectedAId={selectedAId}
                  selectedBId={selectedBId}
                  onSetAsA={(id) => setSelectedAId(id)}
                  onSetAsB={(id) => setSelectedBId(id)}
                />
              </CardContent>
            </Card>

            {/* Quick Math Primer Card */}
            <Card className="bg-[#0b0b0f] border-[#1c1c24]">
              <CardContent className="p-4 space-y-2 text-xs text-[#8e8579]">
                <div className="flex items-center gap-2 text-[#efe6d4] font-medium">
                  <Info className="w-3.5 h-3.5 text-[#d47a3a]" />
                  <span>Metric Specifications</span>
                </div>
                <p className="leading-relaxed">
                  <strong className="text-[#efe6d4]">TF-IDF Cosine (Main %):</strong> Evaluates term frequency normalized by smoothed corpus inverse document frequency, capturing contextual and thematic similarity.
                </p>
                <p className="leading-relaxed">
                  <strong className="text-[#efe6d4]">Jaccard Similarity (Secondary %):</strong> Computes the strict lexical intersection over union: $|A \cap B| / |A \cup B|$ across non-stopword tokens.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (7 cols): Analysis Tabs (Comparator & Heatmap) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* View Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-[#1f1f26] pb-2">
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveTab('comparator')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'comparator'
                      ? 'bg-[#181820] text-[#efe6d4] border border-[#2e2e3a]'
                      : 'text-[#8e8579] hover:text-[#efe6d4] hover:bg-[#121218]'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-[#d47a3a]" />
                  <span>Pairwise Inspector</span>
                  {selectedAId && selectedBId && (
                    <span className="font-mono text-[10px] text-[#d47a3a] ml-1">
                      [{docs.find((d) => d.id === selectedAId)?.label || 'A'} vs {docs.find((d) => d.id === selectedBId)?.label || 'B'}]
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('sidebyside')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'sidebyside'
                      ? 'bg-[#141b29] text-[#efe6d4] border border-[#243e69]'
                      : 'text-[#8e8579] hover:text-[#efe6d4] hover:bg-[#121218]'
                  }`}
                >
                  <Columns2 className="w-3.5 h-3.5 text-[#60a5fa]" />
                  <span>Side by side</span>
                  {readyDocsCount >= 2 && (
                    <span className="font-mono text-[9px] bg-[#1d2b45] text-[#93c5fd] px-1.5 py-0.5 rounded border border-[#2b4472]">
                      Matches
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('heatmap')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'heatmap'
                      ? 'bg-[#181820] text-[#efe6d4] border border-[#2e2e3a]'
                      : 'text-[#8e8579] hover:text-[#efe6d4] hover:bg-[#121218]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-[#d47a3a]" />
                  <span>Pairwise Heatmap Matrix</span>
                  {readyDocsCount >= 2 && (
                    <Badge variant="copper" className="text-[9px] px-1.5 py-0 ml-1">
                      {readyDocsCount}&times;{readyDocsCount}
                    </Badge>
                  )}
                </button>
              </div>

              <span className="text-[11px] font-mono text-[#8e8579]">
                Ready: {readyDocsCount} / 5
              </span>
            </div>

            {/* Tab 1: Pairwise Comparator */}
            {activeTab === 'comparator' && (
              <PairComparator
                docs={docs}
                selectedAId={selectedAId}
                selectedBId={selectedBId}
                onSelectA={(id) => setSelectedAId(id)}
                onSelectB={(id) => setSelectedBId(id)}
                onSwap={handleSwapPair}
                onOpenSideBySide={() => setActiveTab('sidebyside')}
              />
            )}

            {/* Tab 2: Side by Side Matching View */}
            {activeTab === 'sidebyside' && (
              <SideBySideViewer
                docs={docs}
                selectedAId={selectedAId}
                selectedBId={selectedBId}
                onSelectA={(id) => setSelectedAId(id)}
                onSelectB={(id) => setSelectedBId(id)}
                onSwap={handleSwapPair}
              />
            )}

            {/* Tab 2: Pairwise Heatmap */}
            {activeTab === 'heatmap' && (
              <Card>
                <CardHeader className="p-4 sm:p-5">
                  <CardTitle className="text-sm">Full Pairwise Similarity Matrix</CardTitle>
                  <p className="text-xs text-[#8e8579]">
                    Symmetric $N \times N$ TF-IDF Cosine heatmap. Click any cell to inspect that pair in detail.
                  </p>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <HeatmapMatrix
                    docs={docs}
                    selectedAId={selectedAId}
                    selectedBId={selectedBId}
                    onSelectPair={handleSelectFromHeatmap}
                  />
                </CardContent>
              </Card>
            )}

            {/* Secondary Heatmap preview if user is in Comparator view with >= 3 docs */}
            {activeTab === 'comparator' && readyDocsCount >= 3 && (
              <Card className="border-[#202028] bg-[#0c0c10]">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xs">Quick Matrix Reference</CardTitle>
                    <p className="text-[11px] text-[#8e8579]">
                      Click a cell below to jump between document comparisons:
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('heatmap')}
                    className="text-xs text-[#d47a3a]"
                  >
                    Expand Matrix &rarr;
                  </Button>
                </CardHeader>
                <CardContent className="p-4 pt-1">
                  <HeatmapMatrix
                    docs={docs}
                    selectedAId={selectedAId}
                    selectedBId={selectedBId}
                    onSelectPair={handleSelectFromHeatmap}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#1a1a22] bg-[#08080a] py-5 px-4 sm:px-6 text-xs text-[#736c62]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#efe6d4] font-mono text-xs">
            <span className="font-semibold tracking-wide">OVERLAP</span>
            <span className="text-[#8e8579]">&bull;</span>
            <span className="text-[#c5bcae]">Pairwise Document Similarity Analyzer</span>
          </div>

          <div className="text-[11px] text-[#8e8579]">
            Client-side privacy &bull; Files are processed locally in your browser memory
          </div>
        </div>
      </footer>

      {/* Methodology & Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#101014] border border-[#272734] rounded-xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-xs leading-relaxed">
            <div className="flex items-center justify-between border-b border-[#202028] pb-3">
              <h3 className="text-sm font-semibold text-[#efe6d4] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#d47a3a]" />
                <span>OVERLAP Methodology &amp; Architecture</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-[#8e8579] hover:text-[#efe6d4]"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-[#c5bcae]">
              <div>
                <h4 className="font-semibold text-[#efe6d4] mb-1">1. Local Memory Text Extraction</h4>
                <p>
                  Documents never transit external servers or third-party APIs. PDF parsing utilizes Mozilla&apos;s WebAssembly/JavaScript library (<code className="text-[#d47a3a]">pdfjs-dist@3.11.174</code>), while DOCX parsing is handled in client memory via <code className="text-[#d47a3a]">mammoth</code>.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#efe6d4] mb-1">2. Term Frequency-Inverse Document Frequency (TF-IDF)</h4>
                <p>
                  Vocabulary terms are filtered against standard stop-word lexicons. Term frequencies are weighted with smoothed inverse document frequency across the active 2–5 file corpus:
                  <br />
                  <code className="font-mono text-[#d47a3a] block bg-[#0c0c10] p-1.5 rounded my-1">
                    IDF(t) = ln((1 + N) / (1 + DF(t))) + 1
                  </code>
                  Pairwise cosine vectors are computed with normalized Euclidean norms.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#efe6d4] mb-1">3. Scanned PDF &amp; Raster Image Detection</h4>
                <p>
                  If a document yields fewer than 80 total extracted characters, OVERLAP raises an automatic warning badge. This identifies image-only or raster scans that require optical character recognition (OCR) before textual similarity can be measured accurately.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#202028] flex justify-end">
              <Button
                type="button"
                variant="copper"
                size="sm"
                onClick={() => setShowHelpModal(false)}
              >
                Understood
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
