export interface User {
  id: string;
  name: string;
  mobile: string;
  password?: string;
  gender: 'آقا' | 'خانم';
  city: string;
  district?: string;
  ethnicity: string;
  role: 'worker' | 'employer' | 'both';
  specialty?: string;
  skills?: string[];
  experienceYears?: number;
  dailyRate?: number;
  bio?: string;
  portfolio?: Array<{
    title: string;
    image: string;
    date?: string;
  }>;
  balance: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isAdmin?: boolean;
  showPhonePublicly: boolean;
  createdAt: string;
}

export type JobStatus = 'open' | 'accepted' | 'completed' | 'cancelled';
export type WageType = 'روزمزد' | 'کنتراکی (پروژه‌ای)' | 'توافقی';

export interface JobRequest {
  id: string;
  employerId: string;
  employerName: string;
  employerPhone: string;
  title: string;
  category: string;
  requiredSkills: string[];
  city: string;
  address: string;
  budget: number;
  wageType: WageType;
  description: string;
  status: JobStatus;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  assignedWorkerPhone?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  jobId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  jobId?: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  attachmentUrl?: string;
  isPhoneShared?: boolean;
  timestamp: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'charge' | 'payment' | 'payout';
  description: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  type:
    | 'LOGIN'
    | 'REGISTER'
    | 'JOB_CREATE'
    | 'JOB_ACCEPT'
    | 'JOB_CANCEL'
    | 'JOB_COMPLETE'
    | 'REVIEW_SUBMIT'
    | 'CHAT_MESSAGE'
    | 'WALLET_CHARGE'
    | 'PHONE_SHARED'
    | 'SECURITY_CHECK';
  userId?: string;
  userName?: string;
  details: string;
  ip: string;
}
