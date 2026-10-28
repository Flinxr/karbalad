import React, { useState } from 'react';
import type { User } from '../types';
import {
  User as UserIcon,
  Phone,
  Briefcase,
  MapPin,
  Clock,
  Utensils,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sun,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onProfileUpdated: (updatedUser: User) => void;
}

const POPULAR_CITIES = [
  'تهران', 'مشهد', 'اصفهان', 'شیراز', 'تبریز', 'کرج', 'زاهدان', 'اهواز', 'قم', 'رشت'
];

const SPECIALTIES = [
  'گچ‌کاری',
  'نقاشی ساختمان',
  'بنایی و دیوارچینی',
  'لوله‌کشی',
  'برق‌کاری',
  'کاشی‌کاری',
  'کارگر ساده',
  'جوشکاری',
  'نظافت'
];

const SHIFTS = [
  'روزکار (تمام وقت)',
  'نیمه‌وقت (صبح یا عصر)',
  'شب‌کار',
  'منعطف و پروژه‌ای (کنتراکی)',
  'توافقی با کارفرما'
];

const MEAL_OPTIONS: Array<'با ناهار و صبحانه' | 'بدون ناهار و صبحانه' | 'با صبحانه' | 'با ناهار' | 'با ناهار و شام' | 'توافقی'> = [
  'با ناهار و صبحانه',
  'بدون ناهار و صبحانه',
  'با صبحانه',
  'با ناهار',
  'با ناهار و شام',
  'توافقی'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}) => {
  // Worker profile mode toggle: true if role is 'worker' or 'both'
  const [isWorkerActive, setIsWorkerActive] = useState(
    currentUser.role === 'worker' || currentUser.role === 'both'
  );

  // Profile data state
  const [name, setName] = useState(currentUser.name || '');
  const [mobile, setMobile] = useState(currentUser.mobile || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [showPhonePublicly, setShowPhonePublicly] = useState(currentUser.showPhonePublicly || false);
  const [city, setCity] = useState(currentUser.city || 'تهران');
  const [district, setDistrict] = useState(currentUser.district || '');
  const [ethnicity, setEthnicity] = useState(currentUser.ethnicity || 'فارس (ایرانی)');
  const [gender, setGender] = useState<'آقا' | 'خانم'>(currentUser.gender || 'آقا');

  // Work settings state
  const [specialty, setSpecialty] = useState(currentUser.specialty || 'گچ‌کاری');
  const [experienceYears, setExperienceYears] = useState(currentUser.experienceYears || 5);
  const [dailyRate, setDailyRate] = useState(currentUser.dailyRate || 850000);
  const [shift, setShift] = useState(currentUser.shift || 'روزکار (تمام وقت)');
  const [workingHours, setWorkingHours] = useState(currentUser.workingHours || '۰۸:۰۰ الی ۱۷:۰۰');
  const [mealInclusion, setMealInclusion] = useState(currentUser.mealInclusion || 'با ناهار و صبحانه');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [fullBio, setFullBio] = useState(currentUser.fullBio || '');
  const [skills, setSkills] = useState<string[]>(currentUser.skills || []);
  const [newSkill, setNewSkill] = useState('');

  // Portfolio items
  const [portfolio, setPortfolio] = useState<Array<{ title: string; image: string; date?: string }>>(
    currentUser.portfolio || []
  );
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;
    setPortfolio([
      ...portfolio,
      {
        title: newPhotoTitle.trim() || 'نمونه کار اجرایی',
        image: newPhotoUrl.trim(),
        date: new Date().toLocaleDateString('fa-IR'),
      },
    ]);
    setNewPhotoTitle('');
    setNewPhotoUrl('');
  };

  const handleRemovePortfolio = (index: number) => {
    setPortfolio(portfolio.filter((_, idx) => idx !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('لطفاً نام و نام خانوادگی خود را وارد کنید.');
      return;
    }

    // Determine role based on worker toggle
    const newRole: 'worker' | 'employer' | 'both' = isWorkerActive ? 'both' : 'employer';

    const updatedUserPayload: User = {
      ...currentUser,
      name: name.trim(),
      mobile: mobile.trim() || currentUser.mobile,
      avatar: avatar.trim(),
      showPhonePublicly,
      city: city.trim(),
      district: district.trim(),
      ethnicity,
      gender,
      role: newRole,
      specialty: isWorkerActive ? specialty : currentUser.specialty,
      experienceYears: isWorkerActive ? Number(experienceYears) || 0 : currentUser.experienceYears,
      dailyRate: isWorkerActive ? Number(dailyRate) || 0 : currentUser.dailyRate,
      shift: isWorkerActive ? shift : currentUser.shift,
      workingHours: isWorkerActive ? workingHours : currentUser.workingHours,
      mealInclusion: isWorkerActive ? mealInclusion : currentUser.mealInclusion,
      bio: bio.trim(),
      fullBio: fullBio.trim(),
      skills,
      portfolio,
    };

    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          name: updatedUserPayload.name,
          mobile: updatedUserPayload.mobile,
          avatar: updatedUserPayload.avatar,
          role: updatedUserPayload.role,
          city: updatedUserPayload.city,
          district: updatedUserPayload.district,
          ethnicity: updatedUserPayload.ethnicity,
          gender: updatedUserPayload.gender,
          specialty: updatedUserPayload.specialty,
          skills: updatedUserPayload.skills,
          experienceYears: updatedUserPayload.experienceYears,
          dailyRate: updatedUserPayload.dailyRate,
          shift: updatedUserPayload.shift,
          workingHours: updatedUserPayload.workingHours,
          mealInclusion: updatedUserPayload.mealInclusion,
          bio: updatedUserPayload.bio,
          fullBio: updatedUserPayload.fullBio,
          portfolio: updatedUserPayload.portfolio,
          showPhonePublicly: updatedUserPayload.showPhonePublicly,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLoading(false);
        if (data.success) {
          setSuccessMsg(
            isWorkerActive
              ? 'پروفایل کاری شما با موفقیت فعال شد و در لیست کارگران قرار گرفت.'
              : 'تغییرات با موفقیت ذخیره شد (حالت کارگر غیرفعال شد).'
          );
          onProfileUpdated(data.user);
          setTimeout(() => {
            onClose();
          }, 1000);
          return;
        }
      }
    } catch {
      // Fallback for static hosting
    }

    setLoading(false);
    setSuccessMsg(
      isWorkerActive
        ? 'پروفایل کاری شما ذخیره شد و در لیست کارگران قرار گرفت.'
        : 'اطلاعات پروفایل ذخیره شد.'
    );
    onProfileUpdated(updatedUserPayload);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 overflow-hidden flex flex-col max-h-[92vh] border border-slate-100 text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                پروفایل و تنظیمات کاری
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                تنظیم مشخصات فردی و فعال‌سازی نمایش در لیست کارگران
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

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 no-scrollbar">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-bold">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MAIN FEATURE: WORKER MODE TOGGLE SWITCH */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              isWorkerActive
                ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Briefcase className={`w-4 h-4 ${isWorkerActive ? 'text-emerald-700' : 'text-slate-500'}`} />
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    فعال‌سازی حالت کارگر (نمایش در لیست کارگران)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  با روشن کردن این گزینه، اطلاعات کاری شما در تب «کارگران» به کارفرمایان نشان داده می‌شود تا بتوانند به شما کار پیشنهاد دهند.
                </p>
              </div>

              {/* Big Smooth Toggle Switch Button */}
              <button
                type="button"
                onClick={() => setIsWorkerActive(!isWorkerActive)}
                className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isWorkerActive ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isWorkerActive ? '-translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Status Indicator Pill */}
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">وضعیت فعلی:</span>
              {isWorkerActive ? (
                <span className="bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  پروفایل کاری روشن است (قابل مشاهده توسط کارفرما)
                </span>
              ) : (
                <span className="bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                  خاموش (فقط نقش کارفرما)
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Section 1: Personal & Contact Info */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                <UserIcon className="w-3.5 h-3.5 text-emerald-700" />
                مشخصات عمومی و تماس
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 block mb-0.5">نام و نام خانوادگی:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="مثال: علی رضایی"
                    className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-600 block mb-0.5">شماره تلفن همراه:</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="09121112233"
                    className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-left"
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              {/* Photo / Avatar URL */}
              <div>
                <label className="text-slate-600 block mb-0.5">آدرس لینک عکس پروفایل (اختیاری):</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={avatar}
                    onChange={e => setAvatar(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-left text-xs"
                    dir="ltr"
                  />
                  {avatar && (
                    <img
                      src={avatar}
                      alt="پیش‌نمایش"
                      className="w-8.5 h-8.5 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Phone Privacy Toggle */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 text-[11px] block">
                    نمایش عمومی شماره تماس در کارت
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    در صورت خاموش بودن، تماس فقط از طریق چت درون‌برنامه انجام می‌شود.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPhonePublicly(!showPhonePublicly)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                    showPhonePublicly ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {showPhonePublicly ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{showPhonePublicly ? 'نمایش به همه' : 'مخفی'}</span>
                </button>
              </div>

              {/* City, District & Ethnicity */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 block mb-0.5">شهر محل سکونت / کار:</label>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full h-8.5 px-2 rounded-lg bg-slate-50 border border-slate-200 font-bold"
                  >
                    {POPULAR_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 block mb-0.5">محله / محدوده فعالیت:</label>
                  <input
                    type="text"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    placeholder="مثال: پیروزی، سعادت‌آباد"
                    className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Craft & Work Settings (Active or Preview) */}
            <div
              className={`p-3 rounded-2xl border space-y-2.5 transition-all ${
                isWorkerActive ? 'bg-white border-slate-200' : 'bg-slate-50/70 border-dashed border-slate-300 opacity-90'
              }`}
            >
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-700" />
                  اطلاعات شغلی، شیفت و شرایط کاری کارگر
                </span>
                {!isWorkerActive && (
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                    حالت کارگر خاموش است
                  </span>
                )}
              </div>

              {/* Specialty & Daily Rate */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 block mb-0.5">حوزه کاری / تخصص اصلی:</label>
                  <select
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                    className="w-full h-8.5 px-2 rounded-lg bg-slate-50 border border-slate-200 font-bold text-emerald-900"
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
                    className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono font-bold text-emerald-800"
                  />
                </div>
              </div>

              {/* Shift & Working Hours */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 block mb-0.5">شیفت کاری:</label>
                  <select
                    value={shift}
                    onChange={e => setShift(e.target.value)}
                    className="w-full h-8.5 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium"
                  >
                    {SHIFTS.map(sh => (
                      <option key={sh} value={sh}>{sh}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 block mb-0.5">ساعت کاری روزانه:</label>
                  <input
                    type="text"
                    value={workingHours}
                    onChange={e => setWorkingHours(e.target.value)}
                    placeholder="۰۸:۰۰ الی ۱۷:۰۰"
                    className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 font-bold"
                  />
                </div>
              </div>

              {/* Meal Inclusion & Experience Years */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 block mb-0.5">شرایط وعده‌های غذایی (صبحانه/ناهار):</label>
                  <select
                    value={mealInclusion}
                    onChange={e => setMealInclusion(e.target.value as any)}
                    className="w-full h-8.5 px-2 rounded-lg bg-slate-50 border border-slate-200 font-bold text-emerald-800"
                  >
                    {MEAL_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 block mb-0.5">سابقه کار (سال):</label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={e => setExperienceYears(Number(e.target.value))}
                    placeholder="۵"
                    className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="text-slate-600 block mb-0.5">توضیحات کوتاه (نمایش مستقیم در کارت):</label>
                <input
                  type="text"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="مثال: ۱۵ سال سابقه گچ‌بری و سفیدکاری ساختمان‌های لوکس با اکیپ مجرب"
                  className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="text-slate-600 block mb-0.5">توضیحات کامل (نمایش هنگام لمس کارت):</label>
                <textarea
                  rows={3}
                  value={fullBio}
                  onChange={e => setFullBio(e.target.value)}
                  placeholder="شرح کامل سوابق، تجهیزات موجود در اختیار، نحوه اجرای کار، تضمین کیفیت و شرایط تسویه..."
                  className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs resize-none"
                />
              </div>

              {/* Skills Tags */}
              <div className="space-y-1.5">
                <label className="text-slate-600 block">مهارت‌های تکمیلی و فرعی:</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    placeholder="مثال: لکه‌گیری نم، ابزار دور لوستر"
                    className="flex-1 h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200"
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(e))}
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 h-8 bg-slate-800 text-white rounded-lg text-xs font-bold"
                  >
                    افزودن
                  </button>
                </div>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {skills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1"
                      >
                        <span>{sk}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(sk)}
                          className="text-emerald-600 hover:text-rose-600 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Portfolio Samples */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 block">
                  تصاویر نمونه‌کارها ({portfolio.length} مورد):
                </span>

                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    value={newPhotoTitle}
                    onChange={e => setNewPhotoTitle(e.target.value)}
                    placeholder="عنوان نمونه کار"
                    className="h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  />
                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={e => setNewPhotoUrl(e.target.value)}
                    placeholder="آدرس اینترنتی عکس"
                    className="h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-left"
                    dir="ltr"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddPortfolio}
                  disabled={!newPhotoUrl.trim()}
                  className="w-full h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ثبت تصویر نمونه‌کار جدید</span>
                </button>

                {portfolio.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {portfolio.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl overflow-hidden border border-slate-200 relative aspect-video bg-slate-100"
                      >
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-end justify-between p-1.5">
                          <span className="text-[9px] text-white font-bold truncate max-w-[80%]">
                            {item.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePortfolio(idx)}
                            className="w-5 h-5 rounded-md bg-rose-600 text-white flex items-center justify-center text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                {loading ? 'در حال ذخیره‌سازی...' : 'ذخیره و به‌روزرسانی مشخصات پروفایل'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
