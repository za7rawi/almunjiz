'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  Phone,
  MoreVertical,
  CheckCheck,
  Check,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'

interface Message {
  id: string
  text: string
  sent: boolean
  time: string
  read: boolean
  attachment?: { type: 'image' | 'file'; name: string; url: string }
}

const initialMessages: Message[] = [
  { id: '1', text: 'مرحباً! كيف يمكنني مساعدتك اليوم؟', sent: false, time: '10:00 ص', read: true },
  { id: '2', text: 'أحتاج مساعدة في تتبع طلبي رقم #ORD-2024', sent: true, time: '10:02 ص', read: true },
  { id: '3', text: 'بالتأكيد، دعني أتحقق من حالة طلبك...', sent: false, time: '10:03 ص', read: true },
  { id: '4', text: 'طلبك حالياً في مرحلة التنفيذ وسيتم تسليمه خلال 24 ساعة', sent: false, time: '10:04 ص', read: true },
  { id: '5', text: 'ممتاز، هل يمكنني تغيير بعض التفاصيل؟', sent: true, time: '10:05 ص', read: true },
  { id: '6', text: 'نعم بالتأكيد! أرسل لي التفاصيل وسأقوم بالتحديث', sent: false, time: '10:06 ص', read: true },
  { id: '7', text: 'هذا الملف يحتوي على التعديلات المطلوبة', sent: true, time: '10:08 ص', read: true, attachment: { type: 'file', name: 'التعديلات-المطلوبة.pdf', url: '#' } },
  { id: '8', text: 'تم استلام الملف، سنقوم بمراجعته ونرد عليك قريباً. شكراً لصبرك!', sent: false, time: '10:10 ص', read: false },
]

const agent = {
  name: 'محمد - فريق الدعم',
  nameEn: 'Mohammed - Support Team',
  avatar: null,
  online: true,
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = () => {
    if (!input.trim()) return
    const newMsg: Message = {
      id: String(Date.now()),
      text: input,
      sent: true,
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    }
    setMessages((prev) => [...prev, newMsg])
    setInput('')

    setTimeout(() => {
      const reply: Message = {
        id: String(Date.now() + 1),
        text: 'شكراً رسالتك! سنرد عليك في أقرب وقت ممكن.',
        sent: false,
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        read: false,
      }
      setMessages((prev) => [...prev, reply])
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="المحادثات"
        subtitle="تواصل مع فريق الدعم"
        breadcrumbs={[
          { label: 'لوحة التحكم', href: '/dashboard' },
          { label: 'المحادثات' },
        ]}
        gradient
      />

      <Card padding="none" className="overflow-hidden h-[calc(100vh-280px)] min-h-[500px] flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] flex items-center justify-center text-white text-sm font-bold">
                م
              </div>
              {agent.online && (
                <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{agent.name}</h3>
              <p className="text-xs text-emerald-500">{agent.online ? 'متصل' : 'غير متصل'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <Phone size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <MoreVertical size={18} />
            </motion.button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gradient-to-b from-slate-50/50 to-white">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] sm:max-w-[65%]`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sent
                        ? 'bg-gradient-to-br from-[#2580eb] to-[#2580eb]/90 text-white rounded-br-md'
                        : 'bg-white border border-slate-100 text-slate-800 rounded-bl-md shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.attachment && (
                    <div className={`mt-1.5 flex items-center gap-2 px-3 py-2 rounded-xl border ${
                      msg.sent
                        ? 'bg-white/10 border-white/20 text-white'
                        : 'bg-slate-50 border-slate-100 text-slate-700'
                    }`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        msg.sent ? 'bg-white/20' : 'bg-[#2580eb]/10'
                      }`}>
                        {msg.attachment.type === 'image' ? (
                          <ImageIcon size={14} />
                        ) : (
                          <Paperclip size={14} />
                        )}
                      </div>
                      <span className="text-xs truncate flex-1">{msg.attachment.name}</span>
                    </div>
                  )}
                  <div className={`flex items-center gap-1 mt-1 ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] text-slate-400">{msg.time}</span>
                    {msg.sent && (
                      msg.read ? (
                        <CheckCheck size={12} className="text-[#2580eb]" />
                      ) : (
                        <Check size={12} className="text-slate-400" />
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-100 bg-white p-3 sm:p-4">
          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors shrink-0"
            >
              <Paperclip size={18} />
            </motion.button>
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب رسالتك..."
                rows={1}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:border-[#2580eb] focus:ring-2 focus:ring-[#2580eb]/20 transition-all max-h-24"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-br from-[#2580eb] to-[#14b8a6] text-white shadow-lg shadow-[#2580eb]/25 disabled:opacity-50 disabled:shadow-none transition-all shrink-0"
            >
              <Send size={18} className="rotate-180" />
            </motion.button>
          </div>
        </div>
      </Card>
    </div>
  )
}
