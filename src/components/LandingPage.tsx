import React from 'react';
import { ArrowLeft, PhoneCall, ShieldCheck, Zap } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Bar */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-slate-200/80 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm">
            ک
          </div>
          <span className="text-base font-bold text-slate-900">کاربلد</span>
        </div>

        <button
          onClick={onStart}
          className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold rounded-lg transition-colors"
        >
          ورود / ثبت‌نام
        </button>
      </header>

      {/* Main Content - Minimal, Compact & Clean */}
      <main className="flex-1 flex flex-col justify-center px-4 py-6 max-w-sm mx-auto w-full text-center">
        <div className="space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            کاریابی مستقیم کارگران و کارفرمایان
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            دنبال کارگری یا دنبال کار؟ <br />
            <span className="text-emerald-700">با یک تماس کارت رو راه بنداز</span>
          </h2>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed px-1">
            ساده و بدون واسطه؛ اوستاکار ماهر (گچ‌کار، نقاش، لوله‌کش، بنا، کارگر ساده) پیدا کنید یا سفارش‌های روز را تحویل بگیرید.
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-6 space-y-2">
          <button
            onClick={onStart}
            className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <span>ورود و شروع به کار</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <p className="text-[11px] text-slate-500">
            ورود سریع با شماره تلفن همراه
          </p>
        </div>

        {/* 3 Compact Trust Bullets */}
        <div className="mt-8 space-y-2 text-right">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80">
            <PhoneCall className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="text-xs text-slate-700 font-medium">تماس و چت مستقیم و بدون واسطه</span>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="text-xs text-slate-700 font-medium">امتیازدهی و نظرات واقعی بعد از هر پروژه</span>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80">
            <Zap className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="text-xs text-slate-700 font-medium">ثبت نیازمندی و قبول کار در چند ثانیه</span>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-3 px-4 text-center text-[11px] text-slate-500 border-t border-slate-200 bg-white flex items-center justify-between max-w-sm mx-auto w-full">
        <span>کاربلد © ۱۴۰۴</span>
        <button
          onClick={onStart}
          className="text-[11px] font-bold text-slate-500 hover:text-emerald-700"
        >
          ورود مدیریت (Admin)
        </button>
      </footer>
    </div>
  );
};
