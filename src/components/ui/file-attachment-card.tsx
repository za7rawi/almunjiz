'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, FileIcon, Image as ImageIcon, Download, ExternalLink, X, ZoomIn } from 'lucide-react';

export interface FileAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  mimeType?: string;
  fileSize: number;
  uploadedAt?: string;
}

function isImageFile(mt: string): boolean {
  return mt?.startsWith('image/') || false;
}

function isPdfFile(mt: string): boolean {
  return mt === 'application/pdf';
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileIcon(mimeType: string, fileType: string, className: string) {
  const mt = mimeType || fileType || '';
  if (isImageFile(mt)) return <ImageIcon size={20} className={className} />;
  if (isPdfFile(mt)) return <FileText size={20} className={className} />;
  return <FileIcon size={20} className={className} />;
}

function getFileColor(mimeType: string, fileType: string) {
  const mt = mimeType || fileType || '';
  if (isImageFile(mt)) return { bg: 'bg-blue-50 dark:bg-blue-500/10', icon: 'text-blue-500', border: 'border-blue-200 dark:border-blue-500/20', btnView: 'text-blue-600 bg-blue-50 dark:bg-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/30', btnDownload: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/30' };
  if (isPdfFile(mt)) return { bg: 'bg-red-50 dark:bg-red-500/10', icon: 'text-red-500', border: 'border-red-200 dark:border-red-500/20', btnView: 'text-red-600 bg-red-50 dark:bg-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/30', btnDownload: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/30' };
  return { bg: 'bg-slate-50 dark:bg-white/5', icon: 'text-amber-500', border: 'border-slate-200 dark:border-white/10', btnView: 'text-slate-600 bg-slate-50 dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20', btnDownload: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/30' };
}

interface FileAttachmentCardProps {
  file: FileAttachment;
  isAr: boolean;
}

export function FileAttachmentCard({ file, isAr }: FileAttachmentCardProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const mime = file.mimeType || file.fileType || '';
  const colors = getFileColor(mime, file.fileType);
  const previewUrl = `/api/files/${file.id}?inline=true`;
  const downloadUrl = `/api/files/${file.id}`;

  const handlePreview = () => {
    if (isImageFile(mime)) {
      setLightboxUrl(previewUrl);
    } else if (isPdfFile(mime)) {
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-xl border ${colors.border} ${colors.bg} p-4 hover:shadow-md transition-all duration-200 group`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-white dark:bg-white/10`}>
            {getFileIcon(mime, file.fileType, colors.icon)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate" title={file.fileName}>
              {file.fileName}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{formatFileSize(file.fileSize)}</p>
          </div>
        </div>

        {isImageFile(mime) && (
          <div
            className="relative rounded-lg overflow-hidden mb-3 cursor-pointer aspect-video bg-slate-100 dark:bg-slate-800"
            onClick={handlePreview}
          >
            <img
              src={previewUrl}
              alt={file.fileName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-slate-800/90 rounded-full p-2.5">
                <ZoomIn size={18} className="text-[#2580eb]" />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePreview}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg ${colors.btnView} transition-colors`}
          >
            <ExternalLink size={13} /> {isAr ? 'معاينة' : 'Preview'}
          </button>
          <a
            href={downloadUrl}
            download={file.fileName}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg ${colors.btnDownload} transition-colors`}
          >
            <Download size={13} /> {isAr ? 'تحميل' : 'Download'}
          </a>
        </div>
      </motion.div>

      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setLightboxUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLightboxUrl(null)}
                className="absolute -top-3 -end-3 z-10 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
              <img
                src={lightboxUrl}
                alt={isAr ? 'معاينة' : 'Preview'}
                className="w-full h-full object-contain rounded-xl max-h-[85vh]"
              />
              <div className="flex justify-center mt-3 gap-2">
                <a
                  href={lightboxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 dark:bg-slate-800/90 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                >
                  <ExternalLink size={14} /> {isAr ? 'فتح في تبويب جديد' : 'Open in new tab'}
                </a>
                <a
                  href={downloadUrl}
                  download={file.fileName}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 dark:bg-slate-800/90 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                >
                  <Download size={14} /> {isAr ? 'تحميل' : 'Download'}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
