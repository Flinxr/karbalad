import React, { useState } from 'react';
import type { User } from '../types';
import { Star, X, CheckCircle, AlertCircle } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  jobId: string;
  toUserId: string;
  toUserName: string;
  onReviewSubmitted: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  jobId,
  toUserId,
  toUserName,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const RATING_LABELS: Record<number, string> = {
    1: 'خیلی ضعیف و ناراضی',
    2: 'ضعیف - دارای کاستی',
    3: 'متوسط و قابل قبول',
    4: 'خیلی خوب و منظم',
    5: 'عالی، خوش‌قول و فوق‌العاده',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!comment.trim()) {
      setError('لطفاً چند کلمه نظر خود را درباره کیفیت همکاری بنویسید.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          fromUserId: currentUser.id,
          fromUserName: currentUser.name,
          toUserId,
          toUserName,
          rating,
          comment: comment.trim(),
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        onReviewSubmitted();
        onClose();
      } else {
        setError(data.error || 'خطا در ثبت نظر.');
      }
    } catch (err) {
      setLoading(false);
      setError('خطا در برقراری ارتباط با سرور.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-3">
      <div className="w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-4 border border-slate-100">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h3 className="font-bold text-slate-900 text-sm">
              ثبت نظر برای {toUserName}
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
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Star Selection */}
          <div className="text-center py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-600 mb-2 font-bold">میزان رضایت خود را انتخاب کنید:</p>
            <div className="flex items-center justify-center gap-2.5">
              {[1, 2, 3, 4, 5].map(star => {
                const current = hoverRating || rating;
                const isFilled = star <= current;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1.5 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        isFilled ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-black text-amber-800 mt-2">
              {RATING_LABELS[hoverRating || rating]}
            </p>
          </div>

          {/* Comment Area */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              توضیحات و دیدگاه شما (کیفیت کار، خوش‌قولی، تسویه‌حساب):
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="مثال: کار رو سر وقت و با کیفیت عالی تحویل داد، کاملاً منصف و وقت‌شناس بود..."
              className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? 'در حال ثبت...' : 'ثبت قطعی نظر و امتیاز'}
          </button>
        </form>
      </div>
    </div>
  );
};
