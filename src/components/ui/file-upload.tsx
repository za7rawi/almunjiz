'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileIcon, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileWithPreview extends File {
  preview?: string;
}

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  onFilesChange?: (files: File[]) => void;
  className?: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function FileUpload({
  accept = '*',
  multiple = false,
  maxSize = 10 * 1024 * 1024,
  maxFiles = 5,
  onFilesChange,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      setError(null);
      const incomingArr = Array.from(incoming);

      for (const file of incomingArr) {
        if (file.size > maxSize) {
          setError(`"${file.name}" exceeds ${formatSize(maxSize)} limit`);
          return;
        }
      }

      const newFiles = multiple
        ? [...files, ...incomingArr].slice(0, maxFiles)
        : incomingArr.slice(0, 1);

      const withPreviews = newFiles.map((f) => {
        if (f.type.startsWith('image/')) {
          const fw = f as FileWithPreview;
          fw.preview = URL.createObjectURL(f);
          return fw;
        }
        return f as FileWithPreview;
      });

      setFiles(withPreviews);
      onFilesChange?.(withPreviews);
    },
    [files, maxSize, maxFiles, multiple, onFilesChange],
  );

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const removed = prev[index];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      const next = prev.filter((_, i) => i !== index);
      onFilesChange?.(next);
      return next;
    });
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const isImage = (f: File) => f.type.startsWith('image/');

  return (
    <div className={cn('w-full', className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200',
          isDragging
            ? 'border-[#2580eb] bg-[#2580eb]/5'
            : 'border-slate-200 dark:border-white/10 hover:border-[#2580eb]/50 hover:bg-slate-50 dark:hover:bg-white/5',
        )}
      >
        <div className="p-3 rounded-xl bg-[#2580eb]/10">
          <Upload className="text-[#2580eb]" size={24} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Drop files here or <span className="text-[#2580eb]">browse</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Max {formatSize(maxSize)} · {multiple ? `Up to ${maxFiles} files` : 'Single file'}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      <AnimatePresence>
        {files.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-2"
          >
            {files.map((file, i) => (
              <motion.li
                key={`${file.name}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10"
              >
                {isImage(file) && file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-[#2580eb]/10 flex items-center justify-center">
                    <FileIcon className="text-[#2580eb]" size={20} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(i);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export { type FileUploadProps };
