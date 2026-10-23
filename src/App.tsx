import React, { useState, useEffect } from 'react';
import type { User, JobRequest } from './types';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { JobCard } from './components/JobCard';
import { WorkerCard } from './components/WorkerCard';
import { CreateJobModal } from './components/CreateJobModal';
import { InAppChatModal } from './components/InAppChatModal';
import { ReviewModal } from './components/ReviewModal';
import { WalletModal } from './components/WalletModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import {
  Search,
  Plus,
  Briefcase,
  Users,
  Clock,
  CreditCard,
  Shield,
  LogOut,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';

const CATEGORIES = [
  'همه',
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

const POPULAR_CITIES = [
  'همه',
  'تهران',
  'مشهد',
  'اصفهان',
  'شیراز',
  'تبریز',
  'کرج',
  'زاهدان'
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('karbalad_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Tab mode: 'employer' (دنبال کارگرم) | 'worker' (دنبال کارم) | 'history' (کارهای من)
  const [activeTab, setActiveTab] = useState<'employer' | 'worker' | 'history'>('employer');
  const [showLanding, setShowLanding] = useState<boolean>(() => !localStorage.getItem('karbalad_user'));

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Active chat
  const [activeChat, setActiveChat] = useState<{
    recipientId: string;
    recipientName: string;
    jobId?: string;
    jobTitle?: string;
  } | null>(null);

  // Active review
  const [activeReview, setActiveReview] = useState<{
    jobId: string;
    toUserId: string;
    toUserName: string;
  } | null>(null);

  // Data
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('همه');
  const [selectedCity, setSelectedCity] = useState('همه');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minBudget, setMinBudget] = useState('');
  const [selectedEthnicity, setSelectedEthnicity] = useState('همه');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'همه') params.append('category', selectedCategory);
      if (selectedCity !== 'همه') params.append('city', selectedCity);
      if (minBudget) params.append('minBudget', minBudget);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (res.ok) setJobs(await res.json());
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'همه') params.append('category', selectedCategory);
      if (selectedCity !== 'همه') params.append('city', selectedCity);
      if (selectedEthnicity !== 'همه') params.append('ethnicity', selectedEthnicity);

      const res = await fetch(`/api/workers?${params.toString()}`);
      if (res.ok) setWorkers(await res.json());
    } catch (err) {
      console.error('Failed to load workers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'employer') {
      fetchWorkers();
    } else {
      fetchJobs();
    }
  }, [activeTab, selectedCategory, selectedCity, selectedEthnicity]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('karbalad_user', JSON.stringify(user));
    setShowLanding(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('karbalad_user');
    setShowLanding(true);
  };

  const handleAcceptJob = async (jobId: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    try {
      const res = await fetch(`/api/jobs/${jobId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: currentUser.id,
          workerName: currentUser.name,
          workerPhone: currentUser.mobile,
        }),
      });
      if (res.ok) fetchJobs();
    } catch (err) {
      console.error('Error accepting job:', err);
    }
  };

  const handleCancelJob = async (jobId: string, reason: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          userName: currentUser?.name,
          reason,
        }),
      });
      if (res.ok) fetchJobs();
    } catch (err) {
      console.error('Error cancelling job:', err);
    }
  };

  const handleCompleteJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          userName: currentUser?.name,
        }),
      });
      if (res.ok) fetchJobs();
    } catch (err) {
      console.error('Error completing job:', err);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('همه');
    setSelectedCity('همه');
    setSelectedEthnicity('همه');
    setMinBudget('');
    if (activeTab === 'employer') fetchWorkers();
    else fetchJobs();
  };

  if (showLanding && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <PWAInstallBanner />
        <LandingPage onStart={() => setIsAuthOpen(true)} />
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  const myCreatedJobs = jobs.filter(j => j.employerId === currentUser?.id);
  const myAcceptedJobs = jobs.filter(j => j.assignedWorkerId === currentUser?.id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col pb-20">
      <PWAInstallBanner />

      {/* Slim & Crisp Mobile Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-md mx-auto px-3.5 h-13 flex items-center justify-between gap-2">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
              ک
            </div>
            <span className="text-sm font-bold text-slate-900">کاربلد</span>
          </div>

          {/* User Status Bar */}
          <div className="flex items-center gap-1.5">
            {currentUser ? (
              <>
                {/* Wallet Balance Pill */}
                <button
                  onClick={() => setIsWalletOpen(true)}
                  className="h-8 px-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-100 transition-colors"
                  title="کیف پول"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{currentUser.balance?.toLocaleString('fa-IR') || '۰'} ت</span>
                </button>

                {/* Admin Button - ONLY if Admin */}
                {(currentUser.isAdmin || currentUser.mobile === '09334237673') && (
                  <button
                    onClick={() => setIsAdminOpen(true)}
                    className="h-8 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                    title="پنل مدیریت"
                  >
                    <Shield className="w-3.5 h-3.5 fill-white" />
                    <span>مدیریت</span>
                  </button>
                )}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
                  title="خروج"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="h-8 px-3 rounded-lg bg-emerald-700 text-white text-xs font-bold"
              >
                ورود
              </button>
            )}
          </div>
        </div>

        {/* Clean Segmented Tab Control */}
        <div className="max-w-md mx-auto px-3.5 pb-2">
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('employer')}
              className={`h-8 rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'employer' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>کارگران</span>
            </button>

            <button
              onClick={() => setActiveTab('worker')}
              className={`h-8 rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'worker' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>نیازمندی‌ها</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`h-8 rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'history' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>کارهای من</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container - Scaled for Mobile */}
      <main className="max-w-md mx-auto w-full px-3.5 pt-3 flex-1 space-y-3">
        {/* Search & Category Filter Section (Hidden in History tab) */}
        {activeTab !== 'history' && (
          <div className="space-y-2">
            {/* Search Input Box */}
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (activeTab === 'employer' ? fetchWorkers() : fetchJobs())}
                  placeholder={
                    activeTab === 'employer'
                      ? 'جستجوی کارگر (گچ‌کار، نقاش، لوله‌کش)...'
                      : 'جستجو در نیازمندی‌ها...'
                  }
                  className="w-full h-9.5 pr-9 pl-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`w-9.5 h-9.5 rounded-xl border flex items-center justify-center shrink-0 text-slate-600 transition-colors ${
                  showAdvancedFilters ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200'
                }`}
                title="فیلتر"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quiet Category Pills Scroller */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs no-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Compact Filters Drawer */}
            {showAdvancedFilters && (
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">شهر:</label>
                    <select
                      value={selectedCity}
                      onChange={e => setSelectedCity(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                    >
                      {POPULAR_CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {activeTab === 'employer' ? (
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-0.5">قومیت:</label>
                      <select
                        value={selectedEthnicity}
                        onChange={e => setSelectedEthnicity(e.target.value)}
                        className="w-full h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                      >
                        <option value="همه">همه اقوام</option>
                        <option value="فارس (ایرانی)">فارس</option>
                        <option value="بلوچ (ایرانی)">بلوچ</option>
                        <option value="افغان">افغان</option>
                        <option value="ترک / آذری">ترک</option>
                        <option value="کرد">کرد</option>
                        <option value="لر و بختیاری">لر</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-0.5">حداقل دستمزد (تومان):</label>
                      <input
                        type="number"
                        value={minBudget}
                        onChange={e => setMinBudget(e.target.value)}
                        placeholder="۵۰۰,۰۰۰"
                        className="w-full h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={resetFilters}
                    className="text-[11px] text-rose-600 font-bold flex items-center gap-1 hover:underline"
                  >
                    <RotateCcw className="w-3 h-3" />
                    پاک کردن فیلترها
                  </button>

                  <button
                    onClick={() => {
                      if (activeTab === 'employer') fetchWorkers();
                      else fetchJobs();
                    }}
                    className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold"
                  >
                    اعمال
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* List Content: Workers Tab */}
        {activeTab === 'employer' && (
          <div className="space-y-2.5">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">در حال دریافت لیست کارگران...</div>
            ) : workers.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 space-y-1">
                <p className="text-xs font-bold text-slate-700">کارگری با این مشخصات یافت نشد.</p>
                <p className="text-[11px] text-slate-400">فیلتر را حذف کنید یا نیازمندی ثبت نمایید.</p>
              </div>
            ) : (
              workers.map(w => (
                <WorkerCard
                  key={w.id}
                  worker={w}
                  currentUser={currentUser}
                  onRequireAuth={() => setIsAuthOpen(true)}
                  onOpenChat={worker =>
                    setActiveChat({
                      recipientId: worker.id,
                      recipientName: worker.name,
                    })
                  }
                />
              ))
            )}
          </div>
        )}

        {/* List Content: Jobs Tab */}
        {activeTab === 'worker' && (
          <div className="space-y-2.5">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">در حال دریافت نیازمندی‌ها...</div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 space-y-1">
                <p className="text-xs font-bold text-slate-700">نیازمندی فعالی با این فیلتر وجود ندارد.</p>
              </div>
            ) : (
              jobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  currentUser={currentUser}
                  onAccept={handleAcceptJob}
                  onCancel={handleCancelJob}
                  onComplete={handleCompleteJob}
                  onRequireAuth={() => setIsAuthOpen(true)}
                  onOpenChat={(j, otherId, otherName) =>
                    setActiveChat({
                      recipientId: otherId,
                      recipientName: otherName,
                      jobId: j.id,
                      jobTitle: j.title,
                    })
                  }
                  onOpenReview={(jobId, toUserId, toUserName) =>
                    setActiveReview({
                      jobId,
                      toUserId,
                      toUserName,
                    })
                  }
                />
              ))
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {!currentUser ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2">
                <p className="text-xs text-slate-700 font-bold">برای مشاهده تاریخچه وارد حساب شوید.</p>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  ورود / ثبت‌نام
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    نیازمندی‌های ثبت‌شده توسط من ({myCreatedJobs.length})
                  </span>
                  {myCreatedJobs.length === 0 ? (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                      نیازمندی‌ای ثبت نکرده‌اید.
                    </div>
                  ) : (
                    myCreatedJobs.map(j => (
                      <JobCard
                        key={j.id}
                        job={j}
                        currentUser={currentUser}
                        onAccept={handleAcceptJob}
                        onCancel={handleCancelJob}
                        onComplete={handleCompleteJob}
                        onRequireAuth={() => setIsAuthOpen(true)}
                        onOpenChat={(j, otherId, otherName) =>
                          setActiveChat({ recipientId: otherId, recipientName: otherName, jobId: j.id, jobTitle: j.title })
                        }
                        onOpenReview={(jobId, toUserId, toUserName) =>
                          setActiveReview({ jobId, toUserId, toUserName })
                        }
                      />
                    ))
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    پروژه‌های قبول‌شده توسط من ({myAcceptedJobs.length})
                  </span>
                  {myAcceptedJobs.length === 0 ? (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                      پروژه‌ای را تحویل نگرفته‌اید.
                    </div>
                  ) : (
                    myAcceptedJobs.map(j => (
                      <JobCard
                        key={j.id}
                        job={j}
                        currentUser={currentUser}
                        onAccept={handleAcceptJob}
                        onCancel={handleCancelJob}
                        onComplete={handleCompleteJob}
                        onRequireAuth={() => setIsAuthOpen(true)}
                        onOpenChat={(j, otherId, otherName) =>
                          setActiveChat({ recipientId: otherId, recipientName: otherName, jobId: j.id, jobTitle: j.title })
                        }
                        onOpenReview={(jobId, toUserId, toUserName) =>
                          setActiveReview({ jobId, toUserId, toUserName })
                        }
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Slim Fixed Bottom Bar with Center Action */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200">
        <div className="max-w-md mx-auto grid grid-cols-4 items-center h-14 px-2">
          <button
            onClick={() => setActiveTab('employer')}
            className={`flex flex-col items-center justify-center transition-colors ${
              activeTab === 'employer' ? 'text-emerald-700 font-bold' : 'text-slate-500'
            }`}
          >
            <Users className="w-4.5 h-4.5" />
            <span className="text-[10px] mt-0.5">کارگران</span>
          </button>

          <button
            onClick={() => setActiveTab('worker')}
            className={`flex flex-col items-center justify-center transition-colors ${
              activeTab === 'worker' ? 'text-emerald-700 font-bold' : 'text-slate-500'
            }`}
          >
            <Briefcase className="w-4.5 h-4.5" />
            <span className="text-[10px] mt-0.5">نیازمندی‌ها</span>
          </button>

          {/* New Job CTA */}
          <button
            onClick={() => {
              if (!currentUser) setIsAuthOpen(true);
              else setIsCreateJobOpen(true);
            }}
            className="flex flex-col items-center justify-center text-emerald-800 font-bold active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-sm">
              <Plus className="w-4.5 h-4.5" />
            </div>
            <span className="text-[10px] mt-0.5">ثبت آگهی</span>
          </button>

          <button
            onClick={() => {
              if (!currentUser) setIsAuthOpen(true);
              else setActiveTab('history');
            }}
            className={`flex flex-col items-center justify-center transition-colors ${
              activeTab === 'history' ? 'text-emerald-700 font-bold' : 'text-slate-500'
            }`}
          >
            <Clock className="w-4.5 h-4.5" />
            <span className="text-[10px] mt-0.5">کارهای من</span>
          </button>
        </div>
      </nav>

      {/* Subsystem Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {currentUser && (
        <>
          <CreateJobModal
            isOpen={isCreateJobOpen}
            onClose={() => setIsCreateJobOpen(false)}
            currentUser={currentUser}
            onJobCreated={() => {
              fetchJobs();
              setActiveTab('worker');
            }}
          />

          <WalletModal
            isOpen={isWalletOpen}
            onClose={() => setIsWalletOpen(false)}
            currentUser={currentUser}
            onBalanceUpdated={newBal => {
              const updated = { ...currentUser, balance: newBal };
              setCurrentUser(updated);
              localStorage.setItem('karbalad_user', JSON.stringify(updated));
            }}
          />

          {activeChat && (
            <InAppChatModal
              isOpen={Boolean(activeChat)}
              onClose={() => setActiveChat(null)}
              currentUser={currentUser}
              recipientId={activeChat.recipientId}
              recipientName={activeChat.recipientName}
              jobId={activeChat.jobId}
              jobTitle={activeChat.jobTitle}
            />
          )}

          {activeReview && (
            <ReviewModal
              isOpen={Boolean(activeReview)}
              onClose={() => setActiveReview(null)}
              currentUser={currentUser}
              jobId={activeReview.jobId}
              toUserId={activeReview.toUserId}
              toUserName={activeReview.toUserName}
              onReviewSubmitted={() => {
                fetchJobs();
                fetchWorkers();
              }}
            />
          )}
        </>
      )}

      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
