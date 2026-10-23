import React, { useState, useEffect } from 'react';
import type { User, WalletTransaction } from '../types';
import { CreditCard, ArrowUpRight, Plus, CheckCircle, Clock, X } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onBalanceUpdated: (newBalance: number) => void;
}

const QUICK_AMOUNTS = [
  50000,
  100000,
  200000,
  500000,
  1000000
];

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onBalanceUpdated,
}) => {
  const [balance, setBalance] = useState(currentUser.balance || 0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<number>(100000);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchWallet = async () => {
    try {
      const res = await fetch(`/api/wallet/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error('Failed to fetch wallet:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWallet();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCharge = async () => {
    const amountToCharge = customAmount ? Number(customAmount.replace(/\D/g, '')) : selectedAmount;
    if (!amountToCharge || amountToCharge < 10000) {
      alert('حداقل مبلغ شارژ ۱۰,۰۰۰ تومان می‌باشد.');
      return;
    }

    setLoading(true);
    setSuccessMsg('');
    try {
      const res = await fetch('/api/wallet/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          amount: amountToCharge,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        setBalance(data.newBalance);
        onBalanceUpdated(data.newBalance);
        setSuccessMsg(`حساب کاربری شما با موفقیت به مبلغ ${amountToCharge.toLocaleString('fa-IR')} تومان شارژ شد.`);
        fetchWallet();
        setCustomAmount('');
      }
    } catch (err) {
      setLoading(false);
      alert('خطا در شارژ حساب.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-3">
      <div className="w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-4 overflow-y-auto max-h-[90vh] border border-slate-100">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              کیف پول و شارژ حساب
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* Balance Card */}
        <div className="mt-4 p-5 rounded-3xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white shadow-lg shadow-emerald-900/20 relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-xs text-emerald-200 font-medium">موجودی در دسترس:</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-3xl font-black tracking-tight">{balance.toLocaleString('fa-IR')}</span>
              <span className="text-xs text-emerald-200 font-bold">تومان</span>
            </div>
            <p className="text-[11px] text-emerald-200/80 mt-2">
              مالک حساب: {currentUser.name}
            </p>
          </div>
          <div className="absolute -left-6 -bottom-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
        </div>

        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Quick Recharge Section */}
        <div className="mt-5 space-y-3">
          <label className="text-xs font-bold text-slate-700 block">
            انتخاب مبلغ شارژ سریع (تومان):
          </label>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_AMOUNTS.map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setSelectedAmount(amt);
                  setCustomAmount('');
                }}
                className={`h-11 rounded-xl text-xs font-bold border transition-all ${
                  selectedAmount === amt && !customAmount
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {amt.toLocaleString('fa-IR')}
              </button>
            ))}
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">
              یا مبلغ دلخواه خود را بنویسید (تومان):
            </label>
            <input
              type="number"
              value={customAmount}
              onChange={e => setCustomAmount(e.target.value)}
              placeholder="مثال: ۳۵۰,۰۰۰"
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <button
            onClick={handleCharge}
            disabled={loading}
            className="w-full h-13 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {loading ? 'در حال اتصال به درگاه...' : 'شارژ فوری حساب (درگاه آزمایشی)'}
          </button>
        </div>

        {/* Transactions History */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-700" />
            تاریخچه تراکنش‌های اخیر:
          </h4>

          {transactions.length === 0 ? (
            <p className="text-center py-4 text-xs text-slate-400">تراکنشی یافت نشد.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {transactions.map(tx => (
                <div
                  key={tx.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-800 text-[11px]">{tx.description}</p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{tx.timestamp}</span>
                  </div>
                  <div className="text-left font-black text-emerald-700">
                    +{tx.amount.toLocaleString('fa-IR')} ت
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
