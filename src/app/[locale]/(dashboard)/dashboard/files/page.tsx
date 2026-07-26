'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileText,
  Image,
  File,
  Archive,
  Download,
  Trash2,
  Grid3X3,
  List,
  Search,
  FolderOpen,
  CloudUpload,
  X,
  CheckCircle2,
  Loader2,
  Eye,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'

type FileType = 'all' | 'document' | 'image' | 'other'

interface FileRecord {
  id: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  uploadedAt: string
  order?: { id: string; orderNumber: string } | null
}

const tabs: { id: FileType; label: string; labelEn: string }[] = [
  { id: 'all', label: 'الكل', labelEn: 'All' },
  { id: 'document', label: 'مستندات', labelEn: 'Documents' },
  { id: 'image', label: 'صور', labelEn: 'Images' },
  { id: 'other', label: 'أخرى', labelEn: 'Other' },
]

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function getFileCategory(mimeType: string): 'image' | 'document' | 'other' {
  if (mimeType.startsWith('image/')) return 'image'
  if (
    mimeType.includes('pdf') ||
    mimeType.includes('word') ||
    mimeType.includes('document') ||
    mimeType.includes('sheet') ||
    mimeType.includes('excel') ||
    mimeType.includes('text/plain')
  )
    return 'document'
  return 'other'
}

function getFileIcon(category: 'image' | 'document' | 'other', mimeType: string) {
  if (category === 'image') return <Image size={20} className="text-emerald-500" />
  if (mimeType.includes('pdf')) return <FileText size={20} className="text-red-500" />
  if (mimeType.includes('word') || mimeType.includes('document'))
    return <FileText size={20} className="text-[#2580eb]" />
  if (mimeType.includes('sheet') || mimeType.includes('excel'))
    return <FileText size={20} className="text-emerald-600" />
  return <File size={20} className="text-amber-500" />
}

function getFileTypeBadge(mimeType: string): { label: string; variant: 'danger' | 'success' | 'primary' | 'warning' } {
  if (mimeType.includes('pdf')) return { label: 'PDF', variant: 'danger' }
  if (mimeType.startsWith('image/')) return { label: 'صورة', variant: 'success' }
  if (mimeType.includes('word') || mimeType.includes('document')) return { label: 'مستند', variant: 'primary' }
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return { label: 'جدول', variant: 'primary' }
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('rar')) return { label: 'أرشيف', variant: 'warning' }
  return { label: 'ملف', variant: 'warning' }
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileRecord[]>([])
  const [activeTab, setActiveTab] = useState<FileType>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuthStore()

  const fetchFiles = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (activeTab !== 'all') params.set('type', activeTab)
      if (search) params.set('search', search)
      const res = await fetch(`/api/files?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setFiles(data.data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [activeTab, search])

  useEffect(() => {
    setLoading(true)
    fetchFiles()
  }, [fetchFiles])

  useEffect(() => {
    const interval = setInterval(fetchFiles, 30000)
    return () => clearInterval(interval)
  }, [fetchFiles])

  const handleUpload = async (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles)
    if (fileArray.length === 0) return

    setUploading(true)
    setUploadProgress(0)
    setUploadSuccess(false)

    try {
      const formData = new FormData()
      fileArray.forEach((f) => formData.append('files', f))

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        cache: 'no-store',
      })
      const uploadData = await uploadRes.json()

      if (!uploadData.success || !uploadData.data) {
        setUploading(false)
        return
      }

      setUploadProgress(100)
      setUploadSuccess(true)
      await fetchFiles()
      setTimeout(() => {
        setUploading(false)
        setUploadSuccess(false)
      }, 2000)
    } catch {
      setUploading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUpload(e.target.files)
      e.target.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files)
    }
  }

  const deleteFile = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      return
    }
    setConfirmDeleteId(null)
    setDeletingId(id)
    try {
      const res = await fetch(`/api/files?id=${id}`, { method: 'DELETE', cache: 'no-store' })
      const data = await res.json()
      if (data.success) {
        setFiles((prev) => prev.filter((f) => f.id !== id))
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ملفاتي"
        subtitle={`${files.length} ملف`}
        breadcrumbs={[
          { label: 'لوحة التحكم', href: '/dashboard' },
          { label: 'ملفاتي' },
        ]}
        gradient
      />

      {/* Upload Area */}
      <motion.div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          dragOver
            ? 'border-[#2580eb] bg-[#2580eb]/5'
            : 'border-slate-200 hover:border-[#2580eb]/50 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={handleFileInputChange}
        />
        {uploading ? (
          <div className="space-y-4">
            {uploadSuccess ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center"
              >
                <CheckCircle2 size={32} className="text-emerald-500" />
              </motion.div>
            ) : (
              <div className="w-16 h-16 mx-auto rounded-full bg-[#2580eb]/10 flex items-center justify-center">
                <CloudUpload size={32} className="text-[#2580eb] animate-bounce" />
              </div>
            )}
            <div className="max-w-xs mx-auto">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#2580eb] to-[#14b8a6] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-sm text-slate-500 mt-2">
                {uploadSuccess ? 'تم الرفع بنجاح!' : `جاري الرفع... ${Math.round(uploadProgress)}%`}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#2580eb]/10 to-[#14b8a6]/10 flex items-center justify-center mb-4">
              <Upload size={28} className="text-[#2580eb]" />
            </div>
            <p className="text-sm font-medium text-slate-700 mb-1">اسحب الملفات هنا أو انقر للرفع</p>
            <p className="text-xs text-slate-400">PDF, PNG, JPG, DOCX — حتى 10 ميجابايت لكل ملف</p>
          </>
        )}
      </motion.div>

      {/* Tabs & View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 w-full sm:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#2580eb] text-white shadow-lg shadow-[#2580eb]/25'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-[#2580eb]/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث..."
              className="pr-9 pl-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all w-48"
            />
          </div>
          <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#2580eb] text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[#2580eb] text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Files Grid / List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#2580eb]" size={32} />
        </div>
      ) : files.length === 0 ? (
        <Card padding="lg">
          <div className="py-16 text-center">
            <FolderOpen size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">لا توجد ملفات</p>
            <p className="text-xs text-slate-400 mt-1">ابدأ برفع ملفاتك الأولى</p>
          </div>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {files.map((file, i) => {
              const category = getFileCategory(file.fileType)
              const badge = getFileTypeBadge(file.fileType)
              const isImage = file.fileType.startsWith('image/')
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Card padding="none" className="overflow-hidden hover:border-[#2580eb]/30 transition-all group">
                    <div className="p-4">
                      {isImage && (
                        <div
                          className="w-full h-32 rounded-xl mb-3 bg-slate-100 overflow-hidden cursor-pointer relative group/preview"
                          onClick={() => setPreviewUrl(`/api/files/${file.id}?inline=true`)}
                        >
                          <img
                            src={`/api/files/${file.id}?inline=true`}
                            alt={file.fileName}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/preview:bg-black/30 transition-colors flex items-center justify-center">
                            <Eye size={20} className="text-white opacity-0 group-hover/preview:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                          {getFileIcon(category, file.fileType)}
                        </div>
                        <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
                      </div>
                      <h4 className="text-sm font-medium text-slate-900 truncate mb-1">{file.fileName}</h4>
                      <p className="text-xs text-slate-400">
                        {formatFileSize(file.fileSize)} · {new Date(file.uploadedAt).toLocaleDateString('ar-SA')}
                      </p>
                      {file.order && (
                        <p className="text-xs text-[#2580eb] mt-1 truncate">طلب: {file.order.orderNumber}</p>
                      )}
                    </div>
                    <div className="flex border-t border-slate-100">
                      <a
                        href={`/api/files/${file.id}`}
                        download={file.fileName}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-[#2580eb] hover:bg-[#2580eb]/5 transition-colors"
                      >
                        <Download size={14} />
                        تحميل
                      </a>
                      <div className="w-px bg-slate-100" />
                      <button
                        onClick={() => deleteFile(file.id)}
                        disabled={deletingId === file.id}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors disabled:opacity-50 ${confirmDeleteId === file.id ? 'bg-red-50 text-red-600 font-bold' : 'text-red-500 hover:bg-red-50'}`}
                      >
                        {deletingId === file.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        {confirmDeleteId === file.id ? 'هل أنت متأكد؟' : 'حذف'}
                      </button>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase">الاسم</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase hidden sm:table-cell">النوع</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">الحجم</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">التاريخ</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, i) => {
                  const category = getFileCategory(file.fileType)
                  const badge = getFileTypeBadge(file.fileType)
                  return (
                    <motion.tr
                      key={file.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          {getFileIcon(category, file.fileType)}
                          <div>
                            <span className="text-sm font-medium text-slate-900">{file.fileName}</span>
                            {file.order && (
                              <p className="text-xs text-[#2580eb]">طلب: {file.order.orderNumber}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 hidden sm:table-cell">
                        <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-500 hidden md:table-cell">
                        {formatFileSize(file.fileSize)}
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-500 hidden md:table-cell">
                        {new Date(file.uploadedAt).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1">
                          <motion.a
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            href={`/api/files/${file.id}`}
                            download={file.fileName}
                            className="p-1.5 rounded-lg hover:bg-[#2580eb]/10 text-[#2580eb] transition-colors"
                          >
                            <Download size={15} />
                          </motion.a>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteFile(file.id)}
                            disabled={deletingId === file.id}
                            className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${confirmDeleteId === file.id ? 'bg-red-100 text-red-600' : 'hover:bg-red-50 text-red-500'}`}
                            title={confirmDeleteId === file.id ? 'هل أنت متأكد؟' : 'حذف'}
                          >
                            {deletingId === file.id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setPreviewUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[85vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewUrl(null)}
                className="absolute -top-12 left-0 text-white hover:text-slate-300 transition-colors"
              >
                <X size={24} />
              </button>
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain rounded-xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
