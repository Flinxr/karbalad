import React, { useState } from 'react';
import type { User } from '../types';
import { Smartphone, Lock, User as UserIcon, ArrowRight, Check, AlertCircle, ShieldCheck } from 'lucide-react';

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

// Direct Admin Profile for Cloudflare Static Testing & Fast Login
export const DIRECT_ADMIN_USER: User = {
  id: 'usr_admin_09334237673',
  name: 'مدیریت کل سیستم (کاربلد)',
  mobile: '09334237673',
  gender: 'آقا',
  city: 'تهران',
  district: 'مرکزی',
  ethnicity: 'فارس (ایرانی)',
  role: 'both',
  isAdmin: true,
  balance: 10000000,
  rating: 5.0,
  reviewCount: 12,
  isVerified: true,
  showPhonePublicly: true,
  createdAt: '1404-01-01',
};

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
  const [dailyRate, setDailyRate] = useState(850000);
  const [workingHours, setWorkingHours] = useState('۰۸:۰۰ الی ۱۷:۰۰');
  const [mealInclusion, setMealInclusion] = useState<'با ناهار و صبحانه' | 'بدون ناهار و صبحانه' | 'با صبحانه' | 'با ناهار' | 'با ناهار و شام' | 'توافقی'>('با ناهار و صبحانه');
  const [bio, setBio] = useState('');
  const [fullBio, setFullBio] = useState('');

  if (!isOpen) return null;

  const handleDirectAdminLogin = () => {
    // Instant Admin Login without password requirement (optimized for Cloudflare Pages static testing)
    onLoginSuccess(DIRECT_ADMIN_USER);
    onClose();
  };

  const handleCheckMobile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanMobile = mobile.trim();
    if (cleanMobile === '09334237673') {
      handleDirectAdminLogin();
      return;
    }

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
      if (res.ok) {
        const data = await res.json();
        setLoading(false);

        if (data.exists) {
          setExistingUserName(data.name || 'کاربر گرامی');
          setStep('login');
        } else {
          setStep('register');
        }
      } else {
        // Fallback for static hosts
        setLoading(false);
        setStep('register');
      }
    } catch (err) {
      // Static host fallback
      setLoading(false);
      setStep('register');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mobile.trim() === '09334237673') {
      handleDirectAdminLogin();
      return;
    }

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
      if (res.ok) {
        const data = await res.json();
        setLoading(false);
        if (data.success) {
          onLoginSuccess(data.user);
          onClose();
        } else {
          setError(data.error || 'رمز عبور نادرست است.');
        }
      } else {
        // Static host direct login fallback
        setLoading(false);
        const fallbackUser: User = {
          id: `usr_${Date.now()}`,
          name: existingUserName || 'کاربر کاربلد',
          mobile: mobile.trim(),
          gender: 'آقا',
          city: 'تهران',
          ethnicity: 'فارس (ایرانی)',
          role: 'both',
          balance: 100000,
          rating: 5.0,
          reviewCount: 0,
          isVerified: true,
          showPhonePublicly: false,
          createdAt: '1404-01-01',
        };
        onLoginSuccess(fallbackUser);
        onClose();
      }
    } catch (err) {
      setLoading(false);
      // Static fallback
      const fallbackUser: User = {
        id: `usr_${Date.now()}`,
        name: existingUserName || 'کاربر کاربلد',
        mobile: mobile.trim(),
        gender: 'آقا',
        city: 'تهران',
        ethnicity: 'فارس (ایرانی)',
        role: 'both',
        balance: 100000,
        rating: 5.0,
        reviewCount: 0,
        isVerified: true,
        showPhonePublicly: false,
        createdAt: '1404-01-01',
      };
      onLoginSuccess(fallbackUser);
      onClose();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('لطفاً نام و نام خانوادگی را وارد کنید.');
      return;
    }

    const newRegisteredUser: User = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      mobile: mobile.trim() || '09120000000',
      gender,
      city,
      district: district.trim(),
      ethnicity,
      role,
      specialty: role === 'worker' ? specialty : undefined,
      experienceYears: Number(experienceYears) || 1,
      dailyRate: role === 'worker' ? Number(dailyRate) || 850000 : 0,
      workingHours: role === 'worker' ? workingHours : undefined,
      mealInclusion: role === 'worker' ? mealInclusion : undefined,
      bio: bio.trim(),
      fullBio: fullBio.trim(),
      balance: 50000,
      rating: 5.0,
      reviewCount: 0,
      isVerified: true,
      showPhonePublicly: false,
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          mobile: mobile.trim(),
          password: password || '123',
          gender,
          city,
          district: district.trim(),
          ethnicity,
          role,
          specialty: role === 'worker' ? specialty : undefined,
          experienceYears: Number(experienceYears) || 1,
          dailyRate: role === 'worker' ? Number(dailyRate) || 850000 : 0,
          workingHours: role === 'worker' ? workingHours : undefined,
          mealInclusion: role === 'worker' ? mealInclusion : undefined,
          bio: bio.trim(),
          fullBio: fullBio.trim(),
        }),
      });
      setLoading(false);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          onLoginSuccess(data.user);
          onClose();
          return;
        }
      }
    } catch {
      setLoading(false);
    }

    // Direct static fallback login
    onLoginSuccess(newRegisteredUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 w-full h-full min-h-screen overflow-y-auto flex flex-col justify-between">
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col justify-between p-4 sm:p-6 bg-white shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm shadow-xs">
              ک
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {step === 'mobile' && 'ورود یا ثبت‌نام در کاربلد'}
                {step === 'login' && 'ورود به حساب کاربری'}
                {step === 'register' && 'تکمیل مشخصات حساب'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                سامانه کاریابی و ثبت نیازمندی
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
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

            {/* Direct Admin Login Button - Instant ohne Password */}
            <div className="pt-2.5 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={handleDirectAdminLogin}
                className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <ShieldCheck className="w-4 h-4 fill-white" />
                <span>ورود مستقیم و بدون کلمه عبور مدیر سیستم (Admin)</span>
              </button>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">
                ویژه تست استاتیک روی کلاودفلر (شماره: ۰۹۳۳۴۲۳۷۶۷۳)
              </p>
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

            <button
              type="button"
              onClick={handleDirectAdminLogin}
              className="w-full text-center text-[11px] text-amber-700 font-bold hover:underline"
            >
              ورود مستقیم بدون رمز عبور به عنوان مدیر
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

            {/* If Worker: Specialty & Wage details */}
            {role === 'worker' && (
              <>
                <div className="grid grid-cols-2 gap-2">
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

                  <div>
                    <label className="text-slate-600 block mb-0.5">دستمزد روزانه (تومان):</label>
                    <input
                      type="number"
                      value={dailyRate}
                      onChange={e => setDailyRate(Number(e.target.value))}
                      placeholder="۸۵۰,۰۰۰"
                      className="w-full h-8.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 block mb-0.5">ساعت کاری روزانه:</label>
                    <input
                      type="text"
                      value={workingHours}
                      onChange={e => setWorkingHours(e.target.value)}
                      placeholder="۰۸:۰۰ الی ۱۷:۰۰"
                      className="w-full h-8.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-0.5">وعده‌های غذایی:</label>
                    <select
                      value={mealInclusion}
                      onChange={e => setMealInclusion(e.target.value as any)}
                      className="w-full h-8.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-emerald-800"
                    >
                      <option value="با ناهار و صبحانه">با ناهار و صبحانه</option>
                      <option value="بدون ناهار و صبحانه">بدون ناهار و صبحانه</option>
                      <option value="با صبحانه">با صبحانه</option>
                      <option value="با ناهار">با ناهار</option>
                      <option value="با ناهار و شام">با ناهار و شام</option>
                      <option value="توافقی">توافقی</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 block mb-0.5">توضیحات کوتاه:</label>
                  <input
                    type="text"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="مثال: ۱۵ سال سابقه سفیدکاری و ابزار زنی در مناطق مختلف"
                    className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-600 block mb-0.5">توضیحات کامل و سوابق کاری:</label>
                  <textarea
                    rows={2}
                    value={fullBio}
                    onChange={e => setFullBio(e.target.value)}
                    placeholder="جزئیات کامل مهارت‌ها، سوابق پروژه‌ای، ابزارآلات شخصی، نحوه تحویل کار و ..."
                    className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs resize-none"
                  />
                </div>
              </>
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
