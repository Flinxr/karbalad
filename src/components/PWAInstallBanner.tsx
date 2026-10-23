import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already running inside installed standalone PWA or user dismissed, don't show
  if (isInstalled || dismissed) {
    return null;
  }

  // Show Android / Chrome / Desktop install banner if installable
  if (isInstallable) {
    return (
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white px-4 py-3 shadow-md relative z-40">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">نصب اپلیکیشن کاربلد</p>
              <p className="text-xs text-emerald-100 mt-0.5">اجرای سریع و بدون فیلتر روی صفحه اصلی</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={install}
              className="px-4 py-2 bg-white text-emerald-800 font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-50 active:scale-95 transition-all"
            >
              نصب برنامه
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
              aria-label="بستن"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show iOS Safari guidance banner
  if (isIOS) {
    return (
      <>
        <div className="bg-slate-900 text-white px-4 py-3 shadow-md relative z-40 border-b border-emerald-500/30">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Share2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">نصب کاربلد در آیفون (سافاری)</p>
                <p className="text-xs text-slate-300 mt-0.5">افزودن به صفحه اصلی بدون نیاز به اپ‌استور</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowIOSModal(true)}
                className="px-3.5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-500 active:scale-95 transition-all"
              >
                راهنمای نصب
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                aria-label="بستن"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* iOS Step-by-Step Guidance Modal */}
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-slate-900 border border-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">نصب کاربلد در آیفون / آیپد</h3>
                </div>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-sm text-slate-700">
                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    ۱
                  </span>
                  <p className="leading-relaxed text-xs sm:text-sm">
                    در نوار پایین مرورگر سافاری، روی دکمه <strong className="text-emerald-700 font-bold">اشتراک‌گذاری (Share <Share2 className="w-3.5 h-3.5 inline text-slate-600" />)</strong> ضربه بزنید.
                  </p>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    ۲
                  </span>
                  <p className="leading-relaxed text-xs sm:text-sm">
                    منو را به پایین اسکرول کرده و گزینه <strong className="text-emerald-700 font-bold">Add to Home Screen (<PlusSquare className="w-3.5 h-3.5 inline text-slate-600" /> افزودن به صفحه اصلی)</strong> را لمس کنید.
                  </p>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    ۳
                  </span>
                  <p className="leading-relaxed text-xs sm:text-sm">
                    در بالای صفحه روی <strong className="text-emerald-700 font-bold">Add (افزودن)</strong> بزنید تا آیکون کاربلد مانند برنامه‌های گوشی به صفحه شما اضافه شود.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="mt-5 w-full h-12 rounded-2xl bg-emerald-700 text-white font-bold text-sm shadow-md hover:bg-emerald-800 active:scale-95 transition-all"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
