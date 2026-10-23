import React, { useState } from 'react';
import type { JobRequest, User } from '../types';
import { MapPin, Phone, MessageSquare, CheckCircle, XCircle, Clock, AlertTriangle, ChevronDown, ChevronUp, Star } from 'lucide-react';

interface JobCardProps {
  job: JobRequest;
  currentUser: User | null;
  onAccept: (jobId: string) => void;
  onCancel: (jobId: string, reason: string) => void;
  onComplete: (jobId: string) => void;
  onOpenChat: (job: JobRequest, otherUserId: string, otherUserName: string) => void;
  onOpenReview: (jobId: string, toUserId: string, toUserName: string) => void;
  onRequireAuth: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  currentUser,
  onAccept,
  onCancel,
  onComplete,
  onOpenChat,
  onOpenReview,
  onRequireAuth,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const isEmployer = currentUser?.id === job.employerId;
  const isAssignedWorker = currentUser?.id === job.assignedWorkerId;
  const isWorkerUser = currentUser?.role === 'worker' || currentUser?.role === 'both';

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('fa-IR') + ' تومان';
  };

  const getStatusBadge = () => {
    switch (job.status) {
      case 'open':
        return (
          <span className="inline-flex items-center justify-center text-center whitespace-nowrap gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            منتظر کارگر
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center justify-center text-center whitespace-nowrap gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" />
            واگذار شده
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center justify-center text-center whitespace-nowrap gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <CheckCircle className="w-3 h-3" />
            تکمیل شده
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center justify-center text-center whitespace-nowrap gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3" />
            لغو شده
          </span>
        );
    }
  };

  const handleCall = () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    const targetPhone = isEmployer ? job.assignedWorkerPhone : job.employerPhone;
    if (targetPhone) {
      window.location.href = `tel:${targetPhone}`;
    }
  };

  const handleChat = () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    const otherId = isEmployer ? (job.assignedWorkerId || 'unknown') : job.employerId;
    const otherName = isEmployer ? (job.assignedWorkerName || 'کارگر') : job.employerName;
    onOpenChat(job, otherId, otherName);
  };

  const submitCancel = () => {
    onCancel(job.id, cancelReason.trim() || 'لغو توافقی');
    setShowCancelPrompt(false);
  };

  return (
    <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2.5">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              {job.category}
            </span>
            <span className="text-[10px] text-slate-400">· {job.createdAt}</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-1 leading-snug line-clamp-2">
            {job.title}
          </h3>
        </div>
        <div className="shrink-0">{getStatusBadge()}</div>
      </div>

      {/* Wage & Location Row */}
      <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-xl text-xs">
        <div className="truncate">
          <span className="text-[10px] text-slate-500 block">محل کار:</span>
          <span className="font-bold text-slate-800 text-[11px] truncate block flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
            {job.city} {job.address ? `(${job.address})` : ''}
          </span>
        </div>

        <div className="text-left shrink-0">
          <span className="text-[10px] text-slate-500 block">دستمزد ({job.wageType}):</span>
          <span className="font-black text-emerald-800 text-xs">
            {job.budget > 0 ? formatMoney(job.budget) : 'توافقی'}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="text-xs text-slate-600 leading-relaxed">
        <p className={expanded ? '' : 'line-clamp-2'}>{job.description}</p>
        {job.description.length > 70 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] text-emerald-700 font-bold mt-0.5 inline-flex items-center gap-0.5 hover:underline"
          >
            {expanded ? (
              <>کمتر <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>بیشتر <ChevronDown className="w-3 h-3" /></>
            )}
          </button>
        )}
      </div>

      {/* Cancel Reason notice */}
      {job.status === 'cancelled' && job.cancelReason && (
        <div className="p-2 bg-rose-50 rounded-lg text-rose-700 text-[11px] flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>علت لغو: {job.cancelReason}</span>
        </div>
      )}

      {/* Action Buttons Grid - Never breaks on small mobile widths */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        {/* Row 1: Contact & Chat */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCall}
            className="h-9 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-700" />
            <span>تماس تلفنی</span>
          </button>

          <button
            onClick={handleChat}
            className="h-9 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>چت امن</span>
          </button>
        </div>

        {/* Row 2: Status State Action Buttons */}
        {job.status === 'open' && isWorkerUser && !isEmployer && (
          <button
            onClick={() => onAccept(job.id)}
            className="w-full h-9 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>قبول انجام این کار</span>
          </button>
        )}

        {job.status === 'accepted' && (isEmployer || isAssignedWorker) && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onComplete(job.id)}
              className="h-9 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>پایان پروژه</span>
            </button>

            <button
              onClick={() => setShowCancelPrompt(true)}
              className="h-9 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1 transition-all"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>لغو کار</span>
            </button>
          </div>
        )}

        {job.status === 'completed' && (isEmployer || isAssignedWorker) && (
          <button
            onClick={() => {
              const targetId = isEmployer ? job.assignedWorkerId! : job.employerId;
              const targetName = isEmployer ? job.assignedWorkerName! : job.employerName;
              onOpenReview(job.id, targetId, targetName);
            }}
            className="w-full h-9 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Star className="w-3.5 h-3.5 fill-white" />
            <span>ثبت نظر و امتیاز</span>
          </button>
        )}

        {job.status === 'open' && isEmployer && (
          <button
            onClick={() => setShowCancelPrompt(true)}
            className="w-full h-8 text-[11px] text-rose-600 hover:bg-rose-50 rounded-lg font-bold flex items-center justify-center gap-1"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>لغو این نیازمندی</span>
          </button>
        )}
      </div>

      {/* Cancel Prompt Drawer */}
      {showCancelPrompt && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs">
          <p className="font-bold text-rose-800 text-[11px]">علت لغو نیازمندی:</p>
          <input
            type="text"
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
            placeholder="مثال: تغییر تصمیم کارفرما"
            className="w-full h-8 px-2.5 rounded-lg bg-white border border-rose-300 text-xs"
          />
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setShowCancelPrompt(false)}
              className="px-2.5 py-1 text-xs text-slate-600 rounded-md"
            >
              انصراف
            </button>
            <button
              onClick={submitCancel}
              className="px-3 py-1 text-xs font-bold text-white bg-rose-600 rounded-md"
            >
              تایید لغو
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
