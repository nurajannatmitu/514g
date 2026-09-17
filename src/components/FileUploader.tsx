import React, { useRef } from 'react';
import { UploadCloud, FileText, AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';
import { MAX_FILE_SIZE_BYTES } from '../utils/textExtractor';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  currentCount: number;
  maxCount: number;
  onLoadSampleDocs: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  disabled,
  currentCount,
  maxCount,
  onLoadSampleDocs,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [dragError, setDragError] = React.useState<string | null>(null);

  const remainingSlots = Math.max(0, maxCount - currentCount);

  const processFileList = (files: FileList | File[]) => {
    setDragError(null);
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'pdf' && ext !== 'docx') {
        setDragError(`Only PDF and DOCX files are supported. Skipped "${file.name}".`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setDragError(`"${file.name}" exceeds the 12MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      if (validFiles.length > remainingSlots) {
        setDragError(`Maximum of ${maxCount} documents allowed. Only the first ${remainingSlots} were added.`);
        onFilesSelected(validFiles.slice(0, remainingSlots));
      } else {
        onFilesSelected(validFiles);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || remainingSlots <= 0) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileList(e.dataTransfer.files);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && remainingSlots > 0) setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragOver(false);
        }}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && remainingSlots > 0) {
            fileInputRef.current?.click();
          }
        }}
        className={`relative flex flex-col items-center justify-center p-8 border border-dashed rounded-xl transition-all duration-200 cursor-pointer text-center select-none ${
          disabled || remainingSlots <= 0
            ? 'opacity-50 cursor-not-allowed bg-[#0d0d10] border-[#222228]'
            : isDragOver
            ? 'border-[#d47a3a] bg-[#1a1410] ring-2 ring-[#d47a3a]/20'
            : 'border-[#272732] bg-[#0f0f13] hover:border-[#3d3d4c] hover:bg-[#121217]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              processFileList(e.target.files);
              e.target.value = ''; // Reset
            }
          }}
        />

        <div className="w-12 h-12 rounded-lg bg-[#181820] border border-[#272732] flex items-center justify-center mb-3 text-[#d47a3a]">
          <UploadCloud className="w-6 h-6" />
        </div>

        <h4 className="text-sm font-medium text-[#efe6d4]">
          {remainingSlots > 0 ? 'Drop PDF or DOCX files here' : 'Document limit reached (5/5)'}
        </h4>
        <p className="text-xs text-[#8e8579] mt-1 max-w-sm">
          {remainingSlots > 0
            ? `Upload 2 to 5 documents (up to 12MB each). All parsing runs 100% in your browser.`
            : 'Remove a document below to add another file.'}
        </p>

        <div className="flex items-center gap-2 mt-4 text-[11px] font-mono text-[#8e8579]">
          <span className="px-2 py-0.5 rounded bg-[#16161c] border border-[#24242e]">.PDF</span>
          <span className="px-2 py-0.5 rounded bg-[#16161c] border border-[#24242e]">.DOCX</span>
          <span className="text-[#efe6d4] font-medium ml-1">
            Slots available: {remainingSlots} of {maxCount}
          </span>
        </div>
      </div>

      {dragError && (
        <div className="flex items-center gap-2 p-3 text-xs bg-[#2b1616] border border-[#4d1f1f] text-[#fca5a5] rounded-lg">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{dragError}</span>
        </div>
      )}

      {currentCount === 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#222228] bg-[#0c0c0f]">
          <div className="flex items-center gap-2 text-xs text-[#8e8579]">
            <FileText className="w-4 h-4 text-[#d47a3a]" />
            <span>Need sample files to inspect right now?</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onLoadSampleDocs}
            className="text-xs text-[#efe6d4] hover:text-[#d47a3a] hover:border-[#d47a3a]/40"
          >
            Load 3 Sample Docs
          </Button>
        </div>
      )}
    </div>
  );
};
