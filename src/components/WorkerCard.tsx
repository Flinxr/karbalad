import React, { useState } from 'react';
import type { User } from '../types';
import { Star, Phone, MessageSquare, ChevronDown, ChevronUp, Image, CheckCircle2, Clock, Utensils, UserCheck, FileText, Info } from 'lucide-react';

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
  const [expandedPortfolio, setExpandedPortfolio] = useState(false);
  const [showFullProfileModal, setShowFullProfileModal] = useState(false);
  const [showWageMealModal, setShowWageMealModal] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const formatRate = (rate?: number) => {
    if (!rate || rate <= 0) return 'توافقی';
    return `${rate.toLocaleString('fa-IR')} تومان/روز`;
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    window.location.href = `tel:${worker.mobile}`;
  };

  const handleChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    onOpenChat(worker);
  };

  const workingHoursDisplay = worker.workingHours || '۰۸:۰۰ الی ۱۷:۰۰';
  const mealDisplay = worker.mealInclusion || 'با ناهار و صبحانه';

  return (
    <>
      <div
        onClick={() => setShowFullProfileModal(true)}
        className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2.5 cursor-pointer hover:border-emerald-300 transition-all active:scale-[0.995]"
      >
        {/* Top Header Row */}
        <div className="flex items-center gap-2.5">
          {worker.avatar ? (
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-11 h-11 rounded-xl object-cover shrink-0 shadow-2xs border border-slate-200"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
              {worker.name.slice(0, 1)}
            </div>
          )}

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

          {/* Rating badge - Centered */}
          <div className="shrink-0 flex flex-col items-center justify-center text-center px-2.5 py-1 bg-amber-50 rounded-xl border border-amber-200/70 min-w-[52px]">
            <div className="inline-flex items-center justify-center gap-1 text-amber-800 font-black text-xs leading-none">
              <span>{worker.rating > 0 ? worker.rating.toFixed(1) : '۵.۰'}</span>
              <Star className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
            </div>
            <span className="text-[9px] text-amber-900/80 font-bold mt-1 text-center block leading-none whitespace-nowrap">
              {worker.reviewCount || 0} نظر
            </span>
          </div>
        </div>

        {/* Working Hours & Daily Wage Strip */}
        <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700">
          <div className="flex items-center gap-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">ساعت کاری: <strong className="text-slate-900">{workingHoursDisplay}</strong></span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowWageMealModal(true);
            }}
            className="flex items-center justify-between gap-1 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-xl border border-emerald-200/60 text-emerald-900 transition-colors text-right"
            title="مشاهده جزئیات دستمزد و وعده‌های غذایی"
          >
            <div className="flex items-center gap-1 truncate">
              <Utensils className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="truncate font-bold text-[10px] sm:text-[11px]">{formatRate(worker.dailyRate)}</span>
            </div>
            <span className="text-[9px] bg-emerald-700 text-white px-1.5 py-0.5 rounded-md font-bold whitespace-nowrap shrink-0">
              {mealDisplay}
            </span>
          </button>
        </div>

        {/* Short Bio */}
        {worker.bio && (
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 bg-slate-50/50 p-2 rounded-xl">
            {worker.bio}
          </p>
        )}

        {/* Trigger for Full Description */}
        <div className="flex items-center justify-between pt-0.5 text-[11px] text-emerald-800 font-bold">
          <span className="flex items-center gap-1 hover:underline">
            <FileText className="w-3.5 h-3.5" />
            <span>توضیحات کامل و سوابق کارگر</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium">کلیک جهت مشاهده کامل ➔</span>
        </div>

        {/* Portfolio Samples Button */}
        {worker.portfolio && worker.portfolio.length > 0 && (
          <div onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setExpandedPortfolio(!expandedPortfolio)}
              className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 hover:underline pt-1"
            >
              <Image className="w-3.5 h-3.5" />
              <span>نمونه کارها ({worker.portfolio.length} تصویر)</span>
              {expandedPortfolio ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {expandedPortfolio && (
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

        {/* Action Buttons: 2 Equal Columns */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
          <button
            onClick={handleCall}
            className="h-9 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-700" />
            <span>تماس مستقیم</span>
          </button>

          <button
            onClick={handleChat}
            className="h-9 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>چت درون‌برنامه</span>
          </button>
        </div>
      </div>

      {/* 1. Full Worker Profile & Description Modal */}
      {showFullProfileModal && (
        <div
          onClick={() => setShowFullProfileModal(false)}
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-4 max-h-[88vh] overflow-y-auto space-y-3.5 border border-slate-100"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm">پروفایل و توضیحات کامل کارگر</h3>
              </div>
              <button
                onClick={() => setShowFullProfileModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Worker Header Info */}
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
              {worker.avatar ? (
                <img
                  src={worker.avatar}
                  alt={worker.name}
                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white font-black text-base flex items-center justify-center shrink-0">
                  {worker.name.slice(0, 1)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-sm truncate">{worker.name}</h4>
                <div className="flex items-center gap-1 text-xs text-slate-600 mt-0.5">
                  <span className="font-bold text-emerald-800">{worker.specialty || 'اوستاکار'}</span>
                  <span>·</span>
                  <span>{worker.city} ({worker.ethnicity})</span>
                </div>
              </div>
            </div>

            {/* Wage & Hours Card */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 space-y-2 text-xs text-emerald-950">
              <div className="flex items-center justify-between font-bold">
                <span>دستمزد روزانه:</span>
                <span className="text-sm font-black text-emerald-800">{formatRate(worker.dailyRate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>شرایط وعده‌های غذایی:</span>
                <span className="bg-emerald-700 text-white px-2 py-0.5 rounded-md font-bold text-[11px]">
                  {mealDisplay}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>ساعت کاری روزانه:</span>
                <span className="font-bold">{workingHoursDisplay}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>سابقه کار:</span>
                <span className="font-bold">{worker.experienceYears || 5} سال سابقه تخصصی</span>
              </div>
            </div>

            {/* Short Description */}
            {worker.bio && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 block">توضیحات خلاصه:</span>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl">
                  {worker.bio}
                </p>
              </div>
            )}

            {/* Full Description */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 block">توضیحات کامل و سوابق:</span>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl whitespace-pre-line border border-slate-100">
                {worker.fullBio ||
                  `${worker.bio || ''}\n\nدارای ${worker.experienceYears || 5} سال تجربه کاری حرفه‌ای در زمینه ${worker.specialty || 'کارهای ساختمانی'} در شهر ${worker.city}. آماده پذیرش پروژه‌های روزمزد و کنتراکی با تضمین کیفیت عالی و تحویل به موقع.`}
              </p>
            </div>

            {/* Skills */}
            {worker.skills && worker.skills.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 block">مهارت‌های تخصصی:</span>
                <div className="flex flex-wrap gap-1">
                  {worker.skills.map((sk, idx) => (
                    <span key={idx} className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {worker.portfolio && worker.portfolio.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">تصاویر نمونه‌کارها:</span>
                <div className="grid grid-cols-2 gap-2">
                  {worker.portfolio.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActivePhoto(item.image)}
                      className="rounded-xl overflow-hidden border border-slate-200 cursor-pointer aspect-video bg-slate-100 relative"
                    >
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                        <span className="text-[9px] text-white font-bold truncate">{item.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={handleCall}
                className="h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone className="w-4 h-4 text-emerald-700" />
                <span>تماس تلفنی</span>
              </button>

              <button
                onClick={(e) => {
                  setShowFullProfileModal(false);
                  handleChat(e);
                }}
                className="h-10 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>چت در برنامه</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Wage & Meal Breakdown Modal */}
      {showWageMealModal && (
        <div
          onClick={() => setShowWageMealModal(false)}
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs bg-white rounded-2xl shadow-2xl p-4 space-y-3 border border-slate-100 text-right"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-xs">جزئیات دستمزد و وعده‌های غذایی</h3>
              </div>
              <button
                onClick={() => setShowWageMealModal(false)}
                className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">کارگر:</span>
                <span className="font-bold text-slate-900">{worker.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">مبلغ دستمزد روزانه:</span>
                <span className="font-black text-emerald-800 text-sm">{formatRate(worker.dailyRate)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/80 pt-2">
                <span className="text-slate-600">شرایط وعده غذایی:</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {mealDisplay}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">ساعت کاری:</span>
                <span className="font-bold text-slate-900">{workingHoursDisplay}</span>
              </div>
            </div>

            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/70 text-[11px] text-amber-900 flex items-start gap-1.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                {mealDisplay.includes('با ناهار') || mealDisplay.includes('با ناهار و صبحانه')
                  ? 'این دستمزد شامل وعده غذایی (ناهار/صبحانه) توسط کارفرما می‌باشد.'
                  : 'این دستمزد بدون ناهار و صبحانه است و کارگر وعده غذایی را همراه خود می‌آورد.'}
              </span>
            </div>

            <button
              onClick={() => setShowWageMealModal(false)}
              className="w-full h-9 bg-emerald-700 text-white text-xs font-bold rounded-xl"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}

      {/* 3. High-Res Photo Modal */}
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
    </>
  );
};
