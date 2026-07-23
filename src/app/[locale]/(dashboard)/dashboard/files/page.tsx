'use client'

import { useState, useRef, useEffect } from 'react'
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
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type FileType = 'all' | 'document' | 'image' | 'other'

interface MockFile {
  id: string
  name: string
  type: 'pdf' | 'image' | 'doc' | 'archive'
  size: string
  date: string
  dateEn: string
}

const mockFiles: MockFile[] = [
  { id: '1', name: 'تقرير-المبيعات-2024.pdf', type: 'pdf', size: '2.4 MB', date: '15 يناير 2026', dateEn: 'Jan 15, 2026' },
  { id: '2', name: 'تصميم-الشعار.png', type: 'image', size: '1.1 MB', date: '12 يناير 2026', dateEn: 'Jan 12, 2026' },
  { id: '3', name: 'عقد-الخدمة.docx', type: 'doc', size: '856 KB', date: '10 يناير 2026', dateEn: 'Jan 10, 2026' },
  { id: '4', name: 'صور-المشروع.zip', type: 'archive', size: '15.3 MB', date: '8 يناير 2026', dateEn: 'Jan 8, 2026' },
  { id: '5', name: 'فاتورة-ديسمبر.pdf', type: 'pdf', size: '320 KB', date: '5 يناير 2026', dateEn: 'Jan 5, 2026' },
  { id: '6', name: 'واجهة-الموقع.jpg', type: 'image', size: '3.2 MB', date: '3 يناير 2026', dateEn: 'Jan 3, 2026' },
  { id: '7', name: 'بيانات-العملاء.xlsx', type: 'doc', size: '1.8 MB', date: '1 يناير 2026', dateEn: 'Jan 1, 2026' },
  { id: '8', name: 'شارة-التوثيق.pdf', type: 'pdf', size: '540 KB', date: '28 ديسمبر 2025', dateEn: 'Dec 28, 2025' },
]

const tabs: { id: FileType; label: string; labelEn: string }[] = [
  { id: 'all', label: 'الكل', labelEn: 'All' },
  { id: 'document', label: 'مستندات', labelEn: 'Documents' },
  { id: 'image', label: 'صور', labelEn: 'Images' },
  { id: 'other', label: 'أخرى', labelEn: 'Other' },
]

function getFileIcon(type: MockFile['type']) {
  switch (type) {
    case 'pdf': return <FileText size={20} className="text-red-500" />
    case 'image': return <Image size={20} className="text-emerald-500" />
    case 'doc': return <FileText size={20} className="text-[#2580eb]" />
    case 'archive': return <Archive size={20} className="text-amber-500" />
  }
}

function getFileTypeBadge(type: MockFile['type']) {
  const map: Record<MockFile['type'], { label: string; variant: 'danger' | 'success' | 'primary' | 'warning' }> = {
    pdf: { label: 'PDF', variant: 'danger' },
    image: { label: 'صورة', variant: 'success' },
    doc: { label: 'مستند', variant: 'primary' },
    archive: { label: 'أرشيف', variant: 'warning' },
  }
  return map[type]
}

function getFilterType(type: MockFile['type']): FileType {
  if (type === 'pdf' || type === 'doc') return 'document'
  if (type === 'image') return 'image'
  return 'other'
}

export default function FilesPage() {
  const [files, setFiles] = useState<MockFile[]>(mockFiles)
  const [activeTab, setActiveTab] = useState<FileType>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredFiles = files.filter((f) => {
    const matchesTab = activeTab === 'all' || getFilterType(f.type) === activeTab
    const matchesSearch = !search || f.name.includes(search)
    return matchesTab && matchesSearch
  })

  const simulateUpload = () => {
    setUploading(true)
    setUploadProgress(0)
    setUploadSuccess(false)
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20 + 5
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setUploadProgress(100)
        setUploadSuccess(true)
        const newFile: MockFile = {
          id: String(Date.now()),
          name: 'ملف-جديد.pdf',
          type: 'pdf',
          size: '1.2 MB',
          date: 'اليوم',
          dateEn: 'Today',
        }
        setFiles((prev) => [newFile, ...prev])
        setTimeout(() => {
          setUploading(false)
          setUploadSuccess(false)
        }, 2000)
      }
      setUploadProgress(Math.min(progress, 100))
    }, 300)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    simulateUpload()
  }

  const deleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
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
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
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
          onChange={simulateUpload}
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
            <p className="text-xs text-slate-400">PDF, PNG, JPG, DOCX — حتى 50 ميجابايت</p>
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
              <span className="ms-1.5 text-xs opacity-70">
                ({tab.id === 'all' ? files.length : files.filter((f) => getFilterType(f.type) === tab.id).length})
              </span>
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
      {filteredFiles.length === 0 ? (
        <Card padding="lg">
          <div className="py-16 text-center">
            <FolderOpen size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">لا توجد ملفات</p>
          </div>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredFiles.map((file, i) => {
              const badge = getFileTypeBadge(file.type)
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
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                          {getFileIcon(file.type)}
                        </div>
                        <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
                      </div>
                      <h4 className="text-sm font-medium text-slate-900 truncate mb-1">{file.name}</h4>
                      <p className="text-xs text-slate-400">{file.size} · {file.date}</p>
                    </div>
                    <div className="flex border-t border-slate-100">
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-[#2580eb] hover:bg-[#2580eb]/5 transition-colors">
                        <Download size={14} />
                        تحميل
                      </button>
                      <div className="w-px bg-slate-100" />
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                        حذف
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
                {filteredFiles.map((file, i) => {
                  const badge = getFileTypeBadge(file.type)
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
                          {getFileIcon(file.type)}
                          <span className="text-sm font-medium text-slate-900">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 hidden sm:table-cell">
                        <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-500 hidden md:table-cell">{file.size}</td>
                      <td className="px-6 py-3 text-sm text-slate-500 hidden md:table-cell">{file.date}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-1.5 rounded-lg hover:bg-[#2580eb]/10 text-[#2580eb] transition-colors"
                          >
                            <Download size={15} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteFile(file.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          >
                            <Trash2 size={15} />
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
    </div>
  )
}
