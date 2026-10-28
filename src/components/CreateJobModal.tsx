import React, { useState } from 'react';
import type { User, WageType } from '../types';
import { PlusCircle, AlertCircle } from 'lucide-react';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onJobCreated: () => void;
}

const CATEGORIES = [
  'گچ‌کاری',
  'نقاشی',
  'بنایی',
  'لوله‌کشی',
  'کارگر ساده',
  'برق‌کاری',
  'کاشی‌کاری',
  'جوشکاری',
  'نظافت'
];

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onJobCreated,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('گچ‌کاری');
  const [city, setCity] = useState(currentUser.city || 'تهران');
  const [address, setAddress] = useState(currentUser.district || '');
  const [wageType, setWageType] = useState<WageType>('کنتراکی (پروژه‌ای)');
  const [budget, setBudget] = useState('');
  const [phone, setPhone] = useState(currentUser.mobile);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('لطفاً عنوان و شرح کار را بنویسید.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employerId: currentUser.id,
          employerName: currentUser.name,
          employerPhone: phone.trim() || currentUser.mobile,
          title: title.trim(),
          category,
          requiredSkills: [],
          city: city.trim(),
          address: address.trim(),
          budget: Number(budget.replace(/\D/g, '')) || 0,
          wageType,
          description: description.trim(),
          createdAt: `${new Date().toLocaleDateString('fa-IR')} - ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        onJobCreated();
        onClose();
      } else {
        setError(data.error || 'خطا در ثبت نیازمندی.');
      }
    } catch (err) {
      setLoading(false);
      setError('خطا در اتصال به سرور.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-3">
      <div className="w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-4 overflow-y-auto max-h-[90vh] border border-slate-100">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              ثبت نیازمندی جدید
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

        <form onSubmit={handleSubmit} className="mt-3 space-y-2.5 text-xs">
          {/* Title */}
          <div>
            <label className="text-slate-600 block mb-0.5">عنوان کار:</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: سفیدکاری سقف آپارتمان ۱۰۰ متری"
              className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 font-bold"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-slate-600 block mb-1">رسته کار:</label>
            <div className="grid grid-cols-3 gap-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`h-7.5 text-[11px] font-bold rounded-lg border transition-colors ${
                    category === cat
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-600 block mb-0.5">شهر:</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200"
                required
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-0.5">محله:</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="سعادت‌آباد"
                className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200"
              />
            </div>
          </div>

          {/* Wage Type & Budget */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-600 block mb-0.5">نوع دستمزد:</label>
              <select
                value={wageType}
                onChange={e => setWageType(e.target.value as WageType)}
                className="w-full h-8.5 px-2 rounded-lg bg-slate-50 border border-slate-200"
              >
                <option value="کنتراکی (پروژه‌ای)">پروژه‌ای (کنتراکی)</option>
                <option value="روزمزد">روزمزد</option>
                <option value="توافقی">توافقی</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 block mb-0.5">مبلغ پیشنهادی (تومان):</label>
              <input
                type="number"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="۳,۰۰۰,۰۰۰"
                className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono"
              />
            </div>
          </div>

          {/* Contact Phone */}
          <div>
            <label className="text-slate-600 block mb-0.5">شماره تماس هماهنگی:</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full h-8.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono"
              dir="ltr"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-slate-700 font-bold block mb-0.5">شرح کار کامل و واضح:</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="شرح کار کامل و واضح (شامل متراژ، نوع مصالح، تجهیزات کارگاه و شرایط تسویه‌حساب...)"
              className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs resize-none font-medium focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Date & Time Timestamp Display and Submit */}
          <div className="pt-1.5 space-y-1.5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600 bg-slate-100/80 p-2 rounded-xl border border-slate-200/80 font-bold">
              <span>تاریخ و ساعت ثبت:</span>
              <span className="text-emerald-800 font-mono font-bold" dir="ltr">
                {new Date().toLocaleDateString('fa-IR')} - {new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              {loading ? 'در حال انتشار...' : 'انتشار نیازمندی'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
