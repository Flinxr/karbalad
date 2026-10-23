import React, { useState } from 'react';
import type { User } from '../types';
import { Star, Phone, MessageSquare, ChevronDown, ChevronUp, Image, CheckCircle2 } from 'lucide-react';

interface WorkerCardProps {
  worker: User;
  currentUser: User | null;
  onOpenChat: (worker: User) => void;
  onRequireAuth: () => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  currentUser,
  onOpenChat,
  onRequireAuth,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const formatRate = (rate?: number) => {
    if (!rate || rate <= 0) return 'توافقی';
    return `${rate.toLocaleString('fa-IR')} ت/روز`;
  };

  const handleCall = () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    window.location.href = `tel:${worker.mobile}`;
  };

  const handleChat = () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    onOpenChat(worker);
  };

  return (
    <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2.5">
      {/* Top Header Row */}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center shrink-0">
          {worker.name.slice(0, 1)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
              {worker.name}
            </h3>
            {worker.isVerified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 fill-emerald-50" />
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5 truncate">
            <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
              {worker.specialty || 'کارگر ماهر'}
            </span>
            <span>·</span>
            <span>{worker.city}</span>
            <span>·</span>
            <span>{worker.ethnicity}</span>
          </div>
        </div>

        {/* Rating badge - Perfectly centered and aligned */}
        <div className="shrink-0 flex flex-col items-center justify-center text-center px-2.5 py-1 bg-amber-50 rounded-xl border border-amber-200/70 min-w-[50px]">
          <div className="inline-flex items-center justify-center gap-1 text-amber-800 font-black text-xs leading-none">
            <span>{worker.rating > 0 ? worker.rating.toFixed(1) : '۵.۰'}</span>
            <Star className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
          </div>
          <span className="text-[9px] text-amber-900/80 font-bold mt-1 text-center block leading-none whitespace-nowrap">
            {worker.reviewCount || 0} نظر
          </span>
        </div>
      </div>

      {/* Experience & Daily Rate strip */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 rounded-xl text-[11px] text-slate-700 font-medium">
        <span>سابقه کار: <strong className="text-slate-900">{worker.experienceYears || 5} سال</strong></span>
        <span>دستمزد: <strong className="text-emerald-800 font-bold">{formatRate(worker.dailyRate)}</strong></span>
      </div>

      {/* Bio excerpt */}
      {worker.bio && (
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
          {worker.bio}
        </p>
      )}

      {/* Portfolio Samples Button */}
      {worker.portfolio && worker.portfolio.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 hover:underline"
          >
            <Image className="w-3.5 h-3.5" />
            <span>نمونه کارها ({worker.portfolio.length} تصویر)</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {expanded && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {worker.portfolio.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setActivePhoto(item.image)}
                  className="rounded-xl overflow-hidden border border-slate-200 cursor-pointer aspect-video bg-slate-100 relative"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                    <span className="text-[9px] text-white font-bold truncate">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons: 2 Equal Columns - Immune to Overflow */}
      <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
        <button
          onClick={handleCall}
          className="h-9 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-700" />
          <span>تماس مستقیم</span>
        </button>

        <button
          onClick={handleChat}
          className="h-9 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>چت درون‌برنامه</span>
        </button>
      </div>

      {/* Full Photo Viewer Modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div className="relative max-w-md w-full rounded-2xl overflow-hidden bg-black">
            <img src={activePhoto} alt="نمونه کار" className="w-full h-auto object-contain max-h-[75vh]" />
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-3 left-3 w-7 h-7 rounded-full bg-white/30 text-white font-bold flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
