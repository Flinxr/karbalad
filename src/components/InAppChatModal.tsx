import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage, User } from '../types';
import { Send, Phone, Lock, ShieldCheck, Image, Paperclip, X, CheckCheck } from 'lucide-react';

interface InAppChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  recipientId: string;
  recipientName: string;
  jobId?: string;
  jobTitle?: string;
}

export const InAppChatModal: React.FC<InAppChatModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  recipientId,
  recipientName,
  jobId,
  jobTitle,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneShared, setPhoneShared] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Consistent conversationId between two users
  const conversationId = [currentUser.id, recipientId].sort().join('_');

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        const hasShared = data.some((m: ChatMessage) => m.senderId === currentUser.id && m.isPhoneShared);
        if (hasShared) setPhoneShared(true);
      }
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [isOpen, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          jobId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          receiverId: recipientId,
          text: textToSend,
        }),
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleSharePhone = async () => {
    const confirmed = window.confirm(`آیا تمایل دارید شماره تلفن شما (${currentUser.mobile}) برای ${recipientName} ارسال شود؟`);
    if (!confirmed) return;

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          jobId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          receiverId: recipientId,
          text: `شماره تماس مستقیم من: ${currentUser.mobile}`,
          isPhoneShared: true,
        }),
      });
      if (res.ok) {
        setPhoneShared(true);
        fetchMessages();
      }
    } catch (err) {
      console.error('Failed to share phone:', err);
    }
  };

  const handleQuickImage = async () => {
    const imageUrl = window.prompt('آدرس اینترنتی تصویر نمونه کار یا محل پروژه را وارد کنید:');
    if (!imageUrl) return;

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          jobId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          receiverId: recipientId,
          text: 'ارسال تصویر ضمیمه پروژه',
          attachmentUrl: imageUrl,
        }),
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch (err) {
      console.error('Failed to attach photo:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-3">
      <div className="w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col h-[85vh] sm:h-[75vh] overflow-hidden border border-slate-100">
        {/* Top Header */}
        <div className="p-3 bg-emerald-700 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 font-bold text-sm flex items-center justify-center border border-white/20">
              {recipientName.slice(0, 1)}
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm leading-tight">{recipientName}</h3>
              {jobTitle ? (
                <p className="text-[10px] text-emerald-100 truncate max-w-[180px] mt-0.5">
                  پروژه: {jobTitle}
                </p>
              ) : (
                <p className="text-[10px] text-emerald-100 mt-0.5">گفتگوی مستقیم امن</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Privacy Shield Banner */}
        <div className="bg-slate-100 px-4 py-2 border-b border-slate-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium text-[11px] sm:text-xs">
              حریم خصوصی فعال است (شماره تماس مخفی است)
            </span>
          </div>

          {!phoneShared ? (
            <button
              onClick={handleSharePhone}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hover:bg-emerald-50 active:scale-95 transition-all"
            >
              اشتراک‌گذاری شماره تلفنم
            </button>
          ) : (
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              شماره شما به اشتراک گذاشته شد
            </span>
          )}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
              <Lock className="w-8 h-8 text-emerald-600/40" />
              <p className="text-xs font-bold text-slate-600">مکالمه امن و مستقیم</p>
              <p className="text-[11px] text-slate-500 max-w-xs">
                می‌توانید درباره دستمزد، زمان شروع کار، شرایط پروژه و آدرس با یکدیگر گفتگو کنید.
              </p>
            </div>
          ) : (
            messages.map(msg => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm shadow-2xs ${
                      isMe
                        ? 'bg-emerald-700 text-white rounded-br-none'
                        : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/80'
                    }`}
                  >
                    {!isMe && (
                      <p className="text-[10px] font-bold text-emerald-700 mb-1">
                        {msg.senderName}
                      </p>
                    )}

                    {msg.isPhoneShared && (
                      <div className="mb-1.5 p-2 rounded-xl bg-black/10 border border-white/20 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-bold text-xs">اشتراک‌گذاری شماره تماس رسمی</span>
                      </div>
                    )}

                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                    {msg.attachmentUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-black/10">
                        <img
                          src={msg.attachmentUrl}
                          alt="پیوست پروژه"
                          className="w-full max-h-48 object-cover"
                        />
                      </div>
                    )}

                    <div
                      className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 ${
                        isMe ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-emerald-200" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={handleQuickImage}
            className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 flex items-center justify-center shrink-0"
            title="ارسال عکس نمونه‌کار یا پروژه"
          >
            <Image className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="پیام خود را بنویسید..."
            className="flex-1 h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-12 h-12 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-all shadow-sm shadow-emerald-700/20"
          >
            <Send className="w-5 h-5 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
