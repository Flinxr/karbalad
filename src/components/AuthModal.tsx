import React, { useState } from 'react';
import type { User } from '../types';
import { Smartphone, Lock, User as UserIcon, ArrowRight, Check, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

const POPULAR_CITIES = [
  'تهران', 'مشهد', 'اصفهان', 'شیراز', 'تبریز', 'کرج', 'زاهدان', 'اهواز', 'قم', 'رشت'
];

const ETHNICITIES = [
  'فارس (ایرانی)',
  'بلوچ (ایرانی)',
  'افغان',
  'ترک / آذری',
  'کرد',
  'لر و بختیاری',
  'سایر اقوام'
];

const SPECIALTIES = [
  'گچ‌کاری',
  'نقاشی ساختمان',
  'بنایی و دیوارچینی',
  'لوله‌کشی',
  'برق‌کاری',
  'کاشی‌کاری',
  'کارگر ساده',
  'جوشکاری'
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [step, setStep] = useState<'mobile' | 'login' | 'register'>('mobile');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [existingUserName, setExistingUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Register Fields
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'آقا' | 'خانم'>('آقا');
  const [city, setCity] = useState('تهران');
  const [district, setDistrict] = useState('');
  const [ethnicity, setEthnicity] = useState('فارس (ایرانی)');
  const [role, setRole] = useState<'worker' | 'employer'>('worker');
  const [specialty, setSpecialty] = useState('گچ‌کاری');
  const [experienceYears, setExperienceYears] = useState(5);

  if (!isOpen) return null;

  const handleCheckMobile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanMobile = mobile.trim();
    if (!cleanMobile || cleanMobile.length < 10) {
      setError('لطفاً شماره موبایل معتبر (مثال: 09121112233) وارد کنید.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/check-mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: cleanMobile }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.exists) {
        setExistingUserName(data.name || 'کاربر گرامی');
        setStep('login');
      } else {
        setStep('register');
      }
    } catch (err) {
      setLoading(false);
      setError('خطا در ارتباط با سرور.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password) {
      setError('لطفاً رمز عبور را وارد کنید.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobile.trim(), password }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'رمز عبور نادرست است.');
      }
    } catch (err) {
      setLoading(false);
      setError('خطا در ورود.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('لطفاً نام و نام خانوادگی را وارد کنید.');
      return;
    }
    if (!password) {
      setError('لطفاً یک رمز عبور تعیین کنید.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          mobile: mobile.trim(),
          password,
          gender,
          city,
          district: district.trim(),
          ethnicity,
          role,
          specialty: role === 'worker' ? specialty : undefined,
          experienceYears: Number(experienceYears) || 1,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'خطا در ثبت‌نام.');
      }
    } catch (err) {
      setLoading(false);
      setError('خطا در ارتباط با سرور.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-3">
      <div className="w-full max-w-xs sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-4 overflow-y-auto max-h-[90vh] border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
              ک
            </span>
            <h3 className="font-bold text-slate-900 text-sm">
              {step === 'mobile' && 'ورود یا ثبت‌نام'}
              {step === 'login' && 'ورود به حساب'}
              {step === 'register' && 'مشخصات حساب'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-2.5 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Mobile Input */}
        {step === 'mobile' && (
          <form onSubmit={handleCheckMobile} className="mt-3 space-y-3 text-xs">
            <p className="text-slate-600 text-xs">
              شماره تلفن همراه خود را وارد کنید:
            </p>

            <div className="relative">
              <Smartphone className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder="09121112233"
                dir="ltr"
                className="w-full h-10 pr-9 pl-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold tracking-wider focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-left"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              {loading ? 'در حال بررسی...' : 'مرحله بعد'}
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>

            {/* Quick Admin Shortcut */}
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setMobile('09334237673');
                  setPassword('i1l3i8a5');
                  setExistingUserName('مدیریت کل سیستم (کاربلد)');
                  setStep('login');
                }}
                className="w-full py-1.5 px-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-amber-900 text-[11px] font-bold transition-all"
              >
                ورود سریع مدیر سیستم (09334237673)
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Login */}
        {step === 'login' && (
          <form onSubmit={handleLogin} className="mt-3 space-y-3 text-xs">
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-xs">{existingUserName}</p>
                <p className="text-[10px] text-slate-500 font-mono" dir="ltr">{mobile}</p>
              </div>
              <button
                type="button"
                onClick={() => setStep('mobile')}
                className="text-[10px] text-emerald-700 font-bold hover:underline"
              >
                تغییر
              </button>
            </div>

            <div>
              <label className="text-slate-600 block mb-1">رمز عبور:</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="رمز عبور"
                  className="w-full h-10 pr-9 pl-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all disabled:opacity-50"
            >
              {loading ? 'در حال ورود...' : 'ورود به حساب'}
            </button>
          </form>
        )}

        {/* Step 3: Register */}
        {step === 'register' && (
          <form onSubmit={handleRegister} className="mt-3 space-y-2.5 text-xs">
            {/* Role Buttons */}
            <div>
              <label className="text-slate-600 block mb-1">نقش شما:</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setRole('worker')}
                  className={`h-8 rounded-lg font-bold text-[11px] border transition-colors ${
                    role === 'worker' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  کارگر / اوستاکار
                </button>
                <button
                  type="button"
                  onClick={() => setRole('employer')}
                  className={`h-8 rounded-lg font-bold text-[11px] border transition-colors ${
                    role === 'employer' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  کارفرما (دنبال کارگر)
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-slate-600 block mb-0.5">نام و نام خانوادگی:</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="علی اکبری"
                className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold"
                required
              />
            </div>

            {/* City & Ethnicity */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-600 block mb-0.5">شهر:</label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full h-8.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  {POPULAR_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-0.5">قومیت:</label>
                <select
                  value={ethnicity}
                  onChange={e => setEthnicity(e.target.value)}
                  className="w-full h-8.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  {ETHNICITIES.map(eth => (
                    <option key={eth} value={eth}>{eth}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* If Worker: Specialty */}
            {role === 'worker' && (
              <div>
                <label className="text-slate-600 block mb-0.5">تخصص اصلی:</label>
                <select
                  value={specialty}
                  onChange={e => setSpecialty(e.target.value)}
                  className="w-full h-8.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold"
                >
                  {SPECIALTIES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="text-slate-600 block mb-0.5">رمز عبور:</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="رمز عبور دلخواه"
                className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center transition-all disabled:opacity-50 mt-1"
            >
              {loading ? 'در حال ثبت...' : 'ثبت‌نام و ورود'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
