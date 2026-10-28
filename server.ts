import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type { User, JobRequest, Review, ChatMessage, WalletTransaction, AuditLog } from './src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '15mb' }));

// -----------------------------------------------------------------------------
// Database Persistence Layer (data/db.json)
// -----------------------------------------------------------------------------
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  users: User[];
  jobs: JobRequest[];
  reviews: Review[];
  chatMessages: ChatMessage[];
  transactions: WalletTransaction[];
  auditLogs: AuditLog[];
}

// Initial Seed Data with Authentic Crafts & Masters
const INITIAL_SEED: DatabaseSchema = {
  users: [
    {
      id: 'usr_ostad_ali',
      name: 'اوستا علی رضوانی',
      mobile: '09121112233',
      password: '123',
      gender: 'آقا',
      city: 'تهران',
      district: 'پیروزی و نیرو هوایی',
      ethnicity: 'فارس',
      role: 'worker',
      specialty: 'گچ‌کاری',
      skills: ['گچ‌بری دستی', 'سفیدکاری حرفه‌ای', 'ابزارزنی سقف', 'ترمیم ترک و نم'],
      experienceYears: 18,
      dailyRate: 950000,
      workingHours: '۰۸:۰۰ الی ۱۷:۰۰',
      mealInclusion: 'با ناهار و صبحانه',
      bio: '۱۸ سال سابقه سفیدکاری و ابزارزنی ساختمان‌های مسکونی و تجاری. خوش‌قول و تمیزکار با اکیپ مجرب.',
      fullBio: 'استاد کار گچ‌کار و گچ‌بر دستی با ۱۸ سال سابقه مستمر در پروژه‌های لوکس مسکونی و تجاری تهران.\nدارای کلیه داربست‌ها و ابزارآلات حرفه‌ای لکه‌گیری و ابزارزنی.\nتضمین تحویل کار کاملاً صاف و بدون موج همراه با اکیپ مجرب و منظم.',
      portfolio: [
        { title: 'گچ‌بری دور لوستر سالن پذیرایی فرمانیه', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80', date: '۱۴۰۴/۱۰' },
        { title: 'سفیدکاری برج تجاری نیلوفر', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80', date: '۱۴۰۴/۰۸' },
      ],
      balance: 240000,
      rating: 4.9,
      reviewCount: 32,
      isVerified: true,
      showPhonePublicly: false,
      createdAt: '1404-01-10',
    },
    {
      id: 'usr_baloch_reza',
      name: 'عبدالرحیم بلوچ‌زهی',
      mobile: '09152223344',
      password: '123',
      gender: 'آقا',
      city: 'زاهدان',
      district: 'بلوار معلم',
      ethnicity: 'بلوچ',
      role: 'worker',
      specialty: 'بنایی',
      skills: ['تیغه‌چینی', 'دیوارچینی بلوک و آجر', 'شیب‌بندی بام', 'سنگ‌کاری نما'],
      experienceYears: 12,
      dailyRate: 850000,
      workingHours: '۰۷:۳۰ الی ۱۶:۳۰',
      mealInclusion: 'با ناهار',
      bio: 'اوستا بنای بااخلاق، مسلط به دیوارچینی دقیق با شاقول و تراز، بدون پرتی ملات و تضمین سرعت کار.',
      fullBio: 'اوستا بنای با سابقه در استان سیستان و بلوچستان.\nتخصص در دیوارچینی بلوک و آجر با کمترین پرت ملات و دقت بالا.\nمسلط به شاقول‌کاری زوایا و دور سوله و شیب‌بندی پشت بام.',
      portfolio: [
        { title: 'دیوارچینی ویلای ساحلی چابهار', image: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=600&q=80', date: '۱۴۰۴/۱۱' },
      ],
      balance: 150000,
      rating: 4.8,
      reviewCount: 19,
      isVerified: true,
      showPhonePublicly: false,
      createdAt: '1404-02-15',
    },
    {
      id: 'usr_afghan_nemat',
      name: 'نعمت‌الله احمدی',
      mobile: '09353334455',
      password: '123',
      gender: 'آقا',
      city: 'مشهد',
      district: 'سیدی و طلاب',
      ethnicity: 'افغان',
      role: 'worker',
      specialty: 'کارگر ساده',
      skills: ['تخریب بتن و آجر', 'بارگیری نخاله', 'حمل مصالح طبقات', 'نظافت اساسی کارگاه'],
      experienceYears: 8,
      dailyRate: 700000,
      workingHours: '۰۸:۰۰ الی ۱۷:۰۰',
      mealInclusion: 'بدون ناهار و صبحانه',
      bio: 'کارگر کاری و باانرژی، غیرسیگاری و امین، آماده کار روزمزد و پیمانکاری در پروژه‌های عمرانی مشهد.',
      fullBio: '۸ سال سابقه کارگری ساده و تخریب در مشهد مقدس.\nغیرسیگاری، بسیار پرتلاش و منظم در جابه‌جایی مصالح و جمع‌آوری نخاله.\nآماده پذیرش کارهای سنگین کارگاهی و تخریب سرویس و آشپزخانه.',
      portfolio: [],
      balance: 80000,
      rating: 5.0,
      reviewCount: 27,
      isVerified: true,
      showPhonePublicly: false,
      createdAt: '1404-03-01',
    },
    {
      id: 'usr_turk_mehdi',
      name: 'مهدی قاسم‌پور (اوستا تبریزی)',
      mobile: '09144445566',
      password: '123',
      gender: 'آقا',
      city: 'تبریز',
      district: 'ولیعصر',
      ethnicity: 'ترک',
      role: 'worker',
      specialty: 'نقاشی',
      skills: ['رنگ روغن و پلاستیک', 'رنگ کناف و بتونه ماستیک', 'پتینه‌کاری مدرن', 'طرح سنگ'],
      experienceYears: 15,
      dailyRate: 900000,
      workingHours: '۰۸:۰۰ الی ۱۷:۳۰',
      mealInclusion: 'با ناهار و صبحانه',
      bio: 'نقاش درجه یک ساختمانی، استفاده از بهترین برندهای رنگ بدون بو و تحویل کار کاملاً شفاف و یکنواخت.',
      fullBio: 'استاد نقاش ساختمانی با ۱۵ سال تجربه کار در تبریز و استان آذربایجان شرقی.\nمتخصص رنگ‌کاری کناف با بتونه ماستیک کی‌پلاس و پتینه‌کاری مدرن دیوارهای اداری و تجاری.\nتحویل کارگاه کاملاً تمیز و شسته‌شده.',
      portfolio: [
        { title: 'پتینه‌کاری برج اطلس تبریز', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80', date: '۱۴۰۴/۰۹' },
      ],
      balance: 310000,
      rating: 4.9,
      reviewCount: 22,
      isVerified: true,
      showPhonePublicly: false,
      createdAt: '1404-04-12',
    },
    {
      id: 'usr_plumber_hossein',
      name: 'حسین مرادی',
      mobile: '09135556677',
      password: '123',
      gender: 'آقا',
      city: 'اصفهان',
      district: 'بزرگمهر',
      ethnicity: 'فارس',
      role: 'worker',
      specialty: 'لوله‌کشی',
      skills: ['لوله‌کشی ۵ لایه و نیوپایپ', 'نصب پکیج و رادیاتور', 'تشخیص نشتی با دستگاه', 'تعمیر شیرآلات توکار'],
      experienceYears: 10,
      dailyRate: 920000,
      workingHours: '۰۸:۰۰ الی ۱۶:۳۰',
      mealInclusion: 'توافقی',
      bio: 'تکنسین تاسیسات و لوله‌کشی با مدرک فنی و حرفه‌ای. رفع نم و نشتی در اسرع وقت با ارائه ضمانت کتبی.',
      fullBio: 'تکنسین رسمی تاسیسات ساختمان در اصفهان.\nارائه خدمات لوله‌کشی سرد و گرم، فاضلاب و ۵ لایه با دستگاه تست فشار.\nارائه ضمانت کتبی کیفیت لوله‌کشی.',
      portfolio: [],
      balance: 190000,
      rating: 4.7,
      reviewCount: 15,
      isVerified: true,
      showPhonePublicly: false,
      createdAt: '1404-05-20',
    },
    {
      id: 'usr_emp_hamid',
      name: 'مهندس حمید کاظمی',
      mobile: '09128889900',
      password: '123',
      gender: 'آقا',
      city: 'تهران',
      district: 'سعادت‌آباد',
      ethnicity: 'فارس',
      role: 'employer',
      balance: 1500000,
      rating: 4.9,
      reviewCount: 14,
      isVerified: true,
      showPhonePublicly: false,
      createdAt: '1404-01-05',
    },
  ],
  jobs: [
    {
      id: 'job_gach_teh',
      employerId: 'usr_emp_hamid',
      employerName: 'مهندس حمید کاظمی',
      employerPhone: '09128889900',
      title: 'سفیدکاری و لکه‌گیری سقف و دیوار واحد ۹۵ متری',
      category: 'گچ‌کاری',
      requiredSkills: ['سفیدکاری', 'لکه‌گیری', 'ترمیم نم'],
      city: 'تهران',
      address: 'سعادت‌آباد، میدان کاج، خیابان مروارید، کوچه ششم',
      budget: 3800000,
      wageType: 'کنتراکی (پروژه‌ای)',
      description: 'یک واحد آپارتمان مسکونی تخلیه شده نیاز به سفیدکاری مجدد و ترمیم جای لوله‌کشی شوفاژ دارد. داربست و نردبان در محل آماده است و تسویه حساب بلافاصله پس از اتمام و رضایت انجام می‌شود.',
      status: 'open',
      createdAt: '۱۴۰۴/۱۲/۰۱',
      updatedAt: '۱۴۰۴/۱۲/۰۱',
    },
    {
      id: 'job_bana_zahedan',
      employerId: 'usr_emp_hamid',
      employerName: 'پیمانکاری برادران کاظمی',
      employerPhone: '09128889900',
      title: 'دیوارچینی محوطه سوله صنعتی با بلوک سیمانی',
      category: 'بنایی',
      requiredSkills: ['تیغه‌چینی', 'دیوارچینی بلوک'],
      city: 'زاهدان',
      address: 'شهرک صنعتی کامبوزیا، خیابان صنعت ۴',
      budget: 950000,
      wageType: 'روزمزد',
      description: 'نیاز به ۲ نفر اوستا بنای ماهر و دست به کار جهت دیوارچینی دور سوله. مصالح پای کار است و ناهار به عهده کارفرما می‌باشد. پرداخت به صورت روزانه نقد.',
      status: 'open',
      createdAt: '۱۴۰۴/۱۲/۰۲',
      updatedAt: '۱۴۰۴/۱۲/۰۲',
    },
    {
      id: 'job_paint_tabriz',
      employerId: 'usr_emp_hamid',
      employerName: 'دفتر مهندسی پارس',
      employerPhone: '09128889900',
      title: 'نقاشی کناف و سقف دفتر اداری با رنگ اکریلیک درجه یک',
      category: 'نقاشی',
      requiredSkills: ['رنگ کناف و بتونه ماستیک', 'رنگ روغن و پلاستیک'],
      city: 'تبریز',
      address: 'خیابان امام، جنب ایستگاه مترو میدان ساعت',
      budget: 6500000,
      wageType: 'کنتراکی (پروژه‌ای)',
      description: 'نقاشی کامل کناف سقف و دیوارهای یک فضای اداری ۱۵۰ متری. تسویه‌حساب مرحله‌ای طبق پیشرفت کار، نیاز به ارائه فاکتور رسمی رنگ.',
      status: 'accepted',
      assignedWorkerId: 'usr_turk_mehdi',
      assignedWorkerName: 'مهدی قاسم‌پور (اوستا تبریزی)',
      assignedWorkerPhone: '09144445566',
      createdAt: '۱۴۰۴/۱۱/۲۸',
      updatedAt: '۱۴۰۴/۱۱/۲۹',
    },
    {
      id: 'job_kargar_mashhad',
      employerId: 'usr_emp_hamid',
      employerName: 'حاج رضا سعیدی',
      employerPhone: '09128889900',
      title: 'تخریب کف سرویس بهداشتی و حمل نخاله‌ها به بیرون',
      category: 'کارگر ساده',
      requiredSkills: ['تخریب بتن و آجر', 'بارگیری نخاله'],
      city: 'مشهد',
      address: 'بلوار وکیل‌آباد، نبش لادن ۱۵',
      budget: 750000,
      wageType: 'روزمزد',
      description: 'تخریب کاشی و شیب‌بندی کف یک حمام و توالت و ریختن نخاله‌ها داخل گونی جهت حمل با وانت. کار یک روزه از ساعت ۸ صبح تا ۵ بعدازظهر.',
      status: 'completed',
      assignedWorkerId: 'usr_afghan_nemat',
      assignedWorkerName: 'نعمت‌الله احمدی',
      assignedWorkerPhone: '09353334455',
      createdAt: '۱۴۰۴/۱۱/۲۵',
      updatedAt: '۱۴۰۴/۱۱/۲۶',
    },
  ],
  reviews: [
    {
      id: 'rev_1',
      jobId: 'job_kargar_mashhad',
      fromUserId: 'usr_emp_hamid',
      fromUserName: 'مهندس حمید کاظمی',
      toUserId: 'usr_afghan_nemat',
      toUserName: 'نعمت‌الله احمدی',
      rating: 5,
      comment: 'اوستا نعمت بسیار مرد زحمتکش، تمیزکار و وقت‌شناسی هستند. تمام نخاله‌ها رو با وسواس جمع کرد و کارگاه رو تمیز تحویل داد. قطعاً کارهای بعدی باز هم با ایشان همکاری می‌کنم.',
      createdAt: '۱۴۰۴/۱۱/۲۶',
    },
    {
      id: 'rev_2',
      jobId: 'job_kargar_mashhad',
      fromUserId: 'usr_afghan_nemat',
      fromUserName: 'نعمت‌الله احمدی',
      toUserId: 'usr_emp_hamid',
      toUserName: 'مهندس حمید کاظمی',
      rating: 5,
      comment: 'کارفرمای بسیار محترم و باانصافی هستند. دستمزد رو سر موقع و بدون یک ریال کسری پرداخت کردند و امکانات رفاهی عالی بود. خدا برکت بده.',
      createdAt: '۱۴۰۴/۱۱/۲۶',
    },
    {
      id: 'rev_3',
      jobId: 'prev_job_ali',
      fromUserId: 'usr_emp_hamid',
      fromUserName: 'مهندس حمید کاظمی',
      toUserId: 'usr_ostad_ali',
      toUserName: 'اوستا علی رضوانی',
      rating: 5,
      comment: 'گچ‌بری سقف رو مثل پنبه صاف و یکدست تحویل داد. سرعت کار و ابزارزنی دقیقش واقعاً ستودنیه.',
      createdAt: '۱۴۰۴/۱۰/۱۸',
    },
  ],
  chatMessages: [
    {
      id: 'msg_1',
      conversationId: 'usr_emp_hamid_usr_turk_mehdi',
      jobId: 'job_paint_tabriz',
      senderId: 'usr_emp_hamid',
      senderName: 'مهندس حمید کاظمی',
      receiverId: 'usr_turk_mehdi',
      text: 'سلام اوستا مهدی وقتت بخیر. بتونه ماستیک کناف رو خودتون تهیه می‌کنید یا ما باید خریداری کنیم؟',
      isPhoneShared: false,
      timestamp: '۱۰:۳۰ - ۱۴۰۴/۱۱/۲۹',
    },
    {
      id: 'msg_2',
      conversationId: 'usr_emp_hamid_usr_turk_mehdi',
      jobId: 'job_paint_tabriz',
      senderId: 'usr_turk_mehdi',
      senderName: 'مهدی قاسم‌پور (اوستا تبریزی)',
      receiverId: 'usr_emp_hamid',
      text: 'سلام مهندس جان. بتونه مخصوص کی‌پلاس رو خودم از نمایندگی با تخفیف می‌گیرم که خیالتون از کیفیت و چسبندگی راحت باشه.',
      isPhoneShared: true,
      timestamp: '۱۰:۳۵ - ۱۴۰۴/۱۱/۲۹',
    },
  ],
  transactions: [
    {
      id: 'tx_1',
      userId: 'usr_emp_hamid',
      amount: 1500000,
      type: 'charge',
      description: 'شارژ کیف پول کاربری از درگاه شتاب',
      timestamp: '۱۴۰۴/۱۱/۲۰',
    },
    {
      id: 'tx_2',
      userId: 'usr_ostad_ali',
      amount: 200000,
      type: 'charge',
      description: 'شارژ حساب اولیه',
      timestamp: '۱۴۰۴/۰۱/۱۰',
    },
  ],
  auditLogs: [
    {
      id: 'log_1',
      timestamp: new Date().toISOString(),
      type: 'LOGIN',
      userName: 'حمید کاظمی',
      details: 'ورود موفق به سیستم با شماره 09128889900',
      ip: '127.0.0.1',
    },
    {
      id: 'log_2',
      timestamp: new Date().toISOString(),
      type: 'JOB_ACCEPT',
      userName: 'مهدی قاسم‌پور',
      details: 'پذیرش نیازمندی نقاشی کناف دفتر اداری (شناسه: job_paint_tabriz)',
      ip: '127.0.0.1',
    },
  ],
};

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    let db: DatabaseSchema;
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_SEED, null, 2), 'utf-8');
      db = INITIAL_SEED;
    } else {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(raw);
    }

    // Guarantee that Admin user 09334237673 with password i1l3i8a5 is always present in db.json
    let admin = db.users.find(u => u.mobile === '09334237673');
    let needsSave = false;
    if (!admin) {
      admin = {
        id: 'usr_admin_09334237673',
        name: 'مدیریت کل سیستم (کاربلد)',
        mobile: '09334237673',
        password: 'i1l3i8a5',
        gender: 'آقا',
        city: 'تهران',
        district: 'مرکزی',
        ethnicity: 'فارس (ایرانی)',
        role: 'both',
        isAdmin: true,
        balance: 10000000,
        rating: 5.0,
        reviewCount: 0,
        isVerified: true,
        showPhonePublicly: true,
        createdAt: '1404-01-01',
      };
      db.users.unshift(admin);
      needsSave = true;
    } else {
      if (admin.password !== 'i1l3i8a5' || !admin.isAdmin) {
        admin.password = 'i1l3i8a5';
        admin.isAdmin = true;
        needsSave = true;
      }
    }

    if (needsSave) {
      writeDb(db);
    }

    return db;
  } catch (err) {
    console.error('Error reading DB, using initial seed:', err);
    return INITIAL_SEED;
  }
}

function writeDb(data: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    // Atomic write via temp file
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

function logEvent(type: AuditLog['type'], details: string, req: express.Request, userId?: string, userName?: string) {
  const db = readDb();
  const log: AuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    type,
    userId,
    userName,
    details,
    ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  writeDb(db);
}

// -----------------------------------------------------------------------------
// Authentication Endpoints
// -----------------------------------------------------------------------------
app.post('/api/auth/check-mobile', (req, res) => {
  const { mobile } = req.body;
  if (!mobile) {
    return res.status(400).json({ error: 'شماره موبایل الزامی است' });
  }
  const cleanMobile = mobile.trim();
  const db = readDb();
  const user = db.users.find(u => u.mobile === cleanMobile);
  if (user) {
    return res.json({
      exists: true,
      name: user.name,
      role: user.role,
      city: user.city,
    });
  }
  return res.json({ exists: false });
});

app.post('/api/auth/login', (req, res) => {
  const { mobile, password } = req.body;
  if (!mobile || !password) {
    return res.status(400).json({ error: 'شماره موبایل و رمز عبور الزامی است' });
  }
  const cleanMobile = mobile.trim();
  const db = readDb();
  const user = db.users.find(u => u.mobile === cleanMobile);
  if (!user) {
    return res.status(404).json({ error: 'کاربری با این شماره یافت نشد' });
  }
  if (user.password && user.password !== password) {
    logEvent('SECURITY_CHECK', `تلاش ناموفق برای ورود با شماره ${cleanMobile} (رمز عبور نادرست)`, req);
    return res.status(401).json({ error: 'رمز عبور وارد شده نادرست است' });
  }

  logEvent('LOGIN', `ورود موفق کاربر ${user.name} (${cleanMobile})`, req, user.id, user.name);
  const safeUser = { ...user };
  delete safeUser.password;
  safeUser.isAdmin = Boolean(user.isAdmin || user.mobile === '09334237673');
  return res.json({ success: true, user: safeUser });
});

app.post('/api/auth/register', (req, res) => {
  const {
    name,
    mobile,
    password,
    gender,
    city,
    district,
    ethnicity,
    role,
    specialty,
    skills,
    experienceYears,
    dailyRate,
    workingHours,
    mealInclusion,
    bio,
    fullBio,
  } = req.body;

  if (!name || !mobile || !password || !city || !ethnicity) {
    return res.status(400).json({ error: 'لطفاً تمامی فیلدهای الزامی را تکمیل کنید' });
  }

  const cleanMobile = mobile.trim();
  const db = readDb();
  if (db.users.some(u => u.mobile === cleanMobile)) {
    return res.status(400).json({ error: 'کاربری با این شماره موبایل قبلاً ثبت‌نام کرده است' });
  }

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    mobile: cleanMobile,
    password,
    gender: gender || 'آقا',
    city: city.trim(),
    district: district?.trim() || '',
    ethnicity: ethnicity.trim(),
    role: role || 'worker',
    specialty: specialty?.trim() || (role === 'worker' ? 'کارگر ساده' : undefined),
    skills: Array.isArray(skills) ? skills : [],
    experienceYears: Number(experienceYears) || 1,
    dailyRate: Number(dailyRate) || (role === 'worker' ? 700000 : 0),
    workingHours: workingHours || (role === 'worker' ? '۰۸:۰۰ الی ۱۷:۰۰' : undefined),
    mealInclusion: mealInclusion || (role === 'worker' ? 'با ناهار و صبحانه' : undefined),
    bio: bio?.trim() || '',
    fullBio: fullBio?.trim() || '',
    portfolio: [],
    balance: 50000, // Gift initial credit
    rating: 5.0,
    reviewCount: 0,
    isVerified: true,
    showPhonePublicly: false,
    createdAt: new Date().toLocaleDateString('fa-IR'),
  };

  db.users.push(newUser);
  writeDb(db);
  logEvent('REGISTER', `ثبت‌نام کاربر جدید: ${newUser.name} با نقش ${newUser.role} در شهر ${newUser.city}`, req, newUser.id, newUser.name);

  const safeUser = { ...newUser };
  delete safeUser.password;
  return res.json({ success: true, user: safeUser });
});

app.put('/api/auth/profile', (req, res) => {
  const {
    userId,
    name,
    mobile,
    avatar,
    role,
    city,
    district,
    ethnicity,
    gender,
    specialty,
    skills,
    experienceYears,
    dailyRate,
    workingHours,
    shift,
    mealInclusion,
    bio,
    fullBio,
    portfolio,
    showPhonePublicly,
  } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'شناسه کاربر الزامی است' });
  }
  const db = readDb();
  const index = db.users.findIndex(u => u.id === userId);
  if (index === -1) {
    return res.status(404).json({ error: 'کاربر یافت نشد' });
  }

  const user = db.users[index];
  if (name !== undefined && name.trim()) user.name = name.trim();
  if (mobile !== undefined && mobile.trim()) user.mobile = mobile.trim();
  if (avatar !== undefined) user.avatar = avatar;
  if (role !== undefined) user.role = role;
  if (city !== undefined) user.city = city.trim();
  if (district !== undefined) user.district = district.trim();
  if (ethnicity !== undefined) user.ethnicity = ethnicity;
  if (gender !== undefined) user.gender = gender;
  if (specialty !== undefined) user.specialty = specialty;
  if (skills !== undefined) user.skills = skills;
  if (experienceYears !== undefined) user.experienceYears = Number(experienceYears) || 0;
  if (dailyRate !== undefined) user.dailyRate = Number(dailyRate);
  if (workingHours !== undefined) user.workingHours = workingHours;
  if (shift !== undefined) user.shift = shift;
  if (mealInclusion !== undefined) user.mealInclusion = mealInclusion;
  if (bio !== undefined) user.bio = bio;
  if (fullBio !== undefined) user.fullBio = fullBio;
  if (portfolio !== undefined) user.portfolio = portfolio;
  if (showPhonePublicly !== undefined) user.showPhonePublicly = showPhonePublicly;

  db.users[index] = user;
  writeDb(db);
  logEvent('SECURITY_CHECK', `بروزرسانی مشخصات پروفایل و وضعیت کاری توسط ${user.name} (نقش: ${user.role})`, req, user.id, user.name);

  const safeUser = { ...user };
  delete safeUser.password;
  return res.json({ success: true, user: safeUser });
});

// -----------------------------------------------------------------------------
// Workers & Craftspeople Directory
// -----------------------------------------------------------------------------
app.get('/api/workers', (req, res) => {
  const { search, category, city, skill, ethnicity, minRating } = req.query;
  const db = readDb();
  let workers = db.users.filter(u => u.role === 'worker' || u.role === 'both');

  if (search) {
    const s = String(search).toLowerCase().trim();
    workers = workers.filter(
      w =>
        w.name.toLowerCase().includes(s) ||
        (w.specialty && w.specialty.toLowerCase().includes(s)) ||
        (w.bio && w.bio.toLowerCase().includes(s)) ||
        (w.skills && w.skills.some(sk => sk.toLowerCase().includes(s))) ||
        w.city.toLowerCase().includes(s)
    );
  }

  if (category && category !== 'همه') {
    workers = workers.filter(w => w.specialty === category);
  }

  if (city && city !== 'همه') {
    workers = workers.filter(w => w.city === city);
  }

  if (ethnicity && ethnicity !== 'همه') {
    workers = workers.filter(w => w.ethnicity === ethnicity);
  }

  if (skill) {
    workers = workers.filter(w => w.skills && w.skills.includes(String(skill)));
  }

  if (minRating) {
    workers = workers.filter(w => w.rating >= Number(minRating));
  }

  // Hide password and mask phone if privacy enabled
  const safeWorkers = workers.map(w => {
    const copy = { ...w };
    delete copy.password;
    if (!copy.showPhonePublicly) {
      // e.g. 0912***2233
      copy.mobile = copy.mobile.replace(/(\d{4})\d{4}(\d{3})/, '$1****$2');
    }
    return copy;
  });

  return res.json(safeWorkers);
});

// -----------------------------------------------------------------------------
// Job Requests (نیازمندی‌ها)
// -----------------------------------------------------------------------------
app.get('/api/jobs', (req, res) => {
  const { search, category, city, minBudget, maxBudget, status, employerId, workerId } = req.query;
  const db = readDb();
  let jobs = [...db.jobs];

  if (employerId) {
    jobs = jobs.filter(j => j.employerId === employerId);
  }

  if (workerId) {
    jobs = jobs.filter(j => j.assignedWorkerId === workerId);
  }

  if (status && status !== 'همه') {
    jobs = jobs.filter(j => j.status === status);
  }

  if (category && category !== 'همه') {
    jobs = jobs.filter(j => j.category === category);
  }

  if (city && city !== 'همه') {
    jobs = jobs.filter(j => j.city === city);
  }

  if (minBudget) {
    jobs = jobs.filter(j => j.budget >= Number(minBudget));
  }

  if (maxBudget) {
    jobs = jobs.filter(j => j.budget <= Number(maxBudget));
  }

  if (search) {
    const s = String(search).toLowerCase().trim();
    jobs = jobs.filter(
      j =>
        j.title.toLowerCase().includes(s) ||
        j.description.toLowerCase().includes(s) ||
        j.category.toLowerCase().includes(s) ||
        j.city.toLowerCase().includes(s) ||
        j.requiredSkills.some(sk => sk.toLowerCase().includes(s))
    );
  }

  // Sort by newest
  jobs.reverse();
  return res.json(jobs);
});

app.post('/api/jobs', (req, res) => {
  const { employerId, employerName, employerPhone, title, category, requiredSkills, city, address, budget, wageType, description, createdAt } = req.body;
  if (!employerId || !title || !category || !city || !description) {
    return res.status(400).json({ error: 'لطفاً مشخصات کامل نیازمندی را وارد کنید' });
  }

  const nowTimestamp = `${new Date().toLocaleDateString('fa-IR')} - ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`;

  const db = readDb();
  const newJob: JobRequest = {
    id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    employerId,
    employerName: employerName || 'کارفرما',
    employerPhone: employerPhone || '',
    title: title.trim(),
    category: category.trim(),
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
    city: city.trim(),
    address: address?.trim() || '',
    budget: Number(budget) || 0,
    wageType: wageType || 'کنتراکی (پروژه‌ای)',
    description: description.trim(),
    status: 'open',
    createdAt: createdAt || nowTimestamp,
    updatedAt: nowTimestamp,
  };

  db.jobs.push(newJob);
  writeDb(db);
  logEvent('JOB_CREATE', `ثبت نیازمندی جدید «${newJob.title}» در دسته ${newJob.category} توسط ${employerName}`, req, employerId, employerName);

  return res.json({ success: true, job: newJob });
});

app.post('/api/jobs/:id/accept', (req, res) => {
  const { id } = req.params;
  const { workerId, workerName, workerPhone } = req.body;
  if (!workerId || !workerName) {
    return res.status(400).json({ error: 'مشخصات کارگر الزامی است' });
  }

  const db = readDb();
  const job = db.jobs.find(j => j.id === id);
  if (!job) {
    return res.status(404).json({ error: 'نیازمندی یافت نشد' });
  }
  if (job.status !== 'open') {
    return res.status(400).json({ error: 'این نیازمندی قبلاً پذیرفته شده یا لغو گردیده است' });
  }

  job.status = 'accepted';
  job.assignedWorkerId = workerId;
  job.assignedWorkerName = workerName;
  job.assignedWorkerPhone = workerPhone || '';
  job.updatedAt = new Date().toLocaleDateString('fa-IR');

  writeDb(db);
  logEvent('JOB_ACCEPT', `پذیرش پروژه «${job.title}» توسط اوستا ${workerName}`, req, workerId, workerName);

  return res.json({ success: true, job });
});

app.post('/api/jobs/:id/cancel', (req, res) => {
  const { id } = req.params;
  const { userId, userName, reason } = req.body;

  const db = readDb();
  const job = db.jobs.find(j => j.id === id);
  if (!job) {
    return res.status(404).json({ error: 'نیازمندی یافت نشد' });
  }

  job.status = 'cancelled';
  job.cancelReason = reason || 'لغو توسط کاربر';
  job.updatedAt = new Date().toLocaleDateString('fa-IR');

  writeDb(db);
  logEvent('JOB_CANCEL', `لغو پروژه «${job.title}» به علت: ${job.cancelReason} توسط ${userName || 'کاربر'}`, req, userId, userName);

  return res.json({ success: true, job });
});

app.post('/api/jobs/:id/complete', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;

  const db = readDb();
  const job = db.jobs.find(j => j.id === id);
  if (!job) {
    return res.status(404).json({ error: 'نیازمندی یافت نشد' });
  }

  job.status = 'completed';
  job.updatedAt = new Date().toLocaleDateString('fa-IR');

  writeDb(db);
  logEvent('JOB_COMPLETE', `تکمیل و پایان موفق پروژه «${job.title}»`, req, userId, userName);

  return res.json({ success: true, job });
});

// -----------------------------------------------------------------------------
// Two-Way Ratings & Reviews
// -----------------------------------------------------------------------------
app.get('/api/reviews', (req, res) => {
  const { userId, jobId } = req.query;
  const db = readDb();
  let reviews = [...db.reviews];

  if (userId) {
    reviews = reviews.filter(r => r.toUserId === userId);
  }
  if (jobId) {
    reviews = reviews.filter(r => r.jobId === jobId);
  }

  return res.json(reviews.reverse());
});

app.post('/api/reviews', (req, res) => {
  const { jobId, fromUserId, fromUserName, toUserId, toUserName, rating, comment } = req.body;
  if (!fromUserId || !toUserId || !rating) {
    return res.status(400).json({ error: 'مشخصات امتیازدهی کامل نیست' });
  }

  const numRating = Math.max(1, Math.min(5, Number(rating) || 5));
  const db = readDb();

  const newReview: Review = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    jobId: jobId || '',
    fromUserId,
    fromUserName: fromUserName || 'کاربر کاربلد',
    toUserId,
    toUserName: toUserName || '',
    rating: numRating,
    comment: comment?.trim() || '',
    createdAt: new Date().toLocaleDateString('fa-IR'),
  };

  db.reviews.push(newReview);

  // Recalculate recipient rating
  const recipientUser = db.users.find(u => u.id === toUserId);
  if (recipientUser) {
    const userReviews = db.reviews.filter(r => r.toUserId === toUserId);
    const sum = userReviews.reduce((acc, r) => acc + r.rating, 0);
    recipientUser.rating = Number((sum / userReviews.length).toFixed(1));
    recipientUser.reviewCount = userReviews.length;
  }

  writeDb(db);
  logEvent('REVIEW_SUBMIT', `ثبت امتیاز ${numRating} ستاره از طرف ${fromUserName} برای ${toUserName}`, req, fromUserId, fromUserName);

  return res.json({ success: true, review: newReview, updatedRating: recipientUser?.rating });
});

// -----------------------------------------------------------------------------
// Secure In-App Chat
// -----------------------------------------------------------------------------
app.get('/api/chat/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  const db = readDb();
  const messages = db.chatMessages.filter(m => m.conversationId === conversationId);
  return res.json(messages);
});

app.post('/api/chat/send', (req, res) => {
  const { conversationId, jobId, senderId, senderName, receiverId, text, attachmentUrl, isPhoneShared } = req.body;
  if (!conversationId || !senderId || (!text && !attachmentUrl && !isPhoneShared)) {
    return res.status(400).json({ error: 'پیام نمی‌تواند خالی باشد' });
  }

  const db = readDb();
  const newMsg: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    conversationId,
    jobId,
    senderId,
    senderName,
    receiverId,
    text: text?.trim() || '',
    attachmentUrl,
    isPhoneShared: Boolean(isPhoneShared),
    timestamp: `${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })} - ${new Date().toLocaleDateString('fa-IR')}`,
  };

  db.chatMessages.push(newMsg);
  writeDb(db);

  if (isPhoneShared) {
    logEvent('PHONE_SHARED', `کاربر ${senderName} شماره تماس خود را در چت به اشتراک گذاشت`, req, senderId, senderName);
  } else {
    logEvent('CHAT_MESSAGE', `ارسال پیام در گفتگو بین ${senderName} و مخاطب`, req, senderId, senderName);
  }

  return res.json({ success: true, message: newMsg });
});

// -----------------------------------------------------------------------------
// Wallet & Account Balance
// -----------------------------------------------------------------------------
app.get('/api/wallet/:userId', (req, res) => {
  const { userId } = req.params;
  const db = readDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'کاربر یافت نشد' });
  }

  const transactions = db.transactions.filter(t => t.userId === userId).reverse();
  return res.json({
    balance: user.balance,
    transactions,
  });
});

app.post('/api/wallet/charge', (req, res) => {
  const { userId, amount } = req.body;
  const chargeAmount = Number(amount);
  if (!userId || isNaN(chargeAmount) || chargeAmount <= 0) {
    return res.status(400).json({ error: 'مبلغ شارژ نامعتبر است' });
  }

  const db = readDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'کاربر یافت نشد' });
  }

  user.balance += chargeAmount;
  const tx: WalletTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    amount: chargeAmount,
    type: 'charge',
    description: `شارژ حساب به مبلغ ${chargeAmount.toLocaleString('fa-IR')} تومان از طریق درگاه پرداخت`,
    timestamp: new Date().toLocaleDateString('fa-IR'),
  };

  db.transactions.push(tx);
  writeDb(db);
  logEvent('WALLET_CHARGE', `افزایش اعتبار حساب به مبلغ ${chargeAmount.toLocaleString('fa-IR')} تومان برای ${user.name}`, req, user.id, user.name);

  return res.json({ success: true, newBalance: user.balance, transaction: tx });
});

// -----------------------------------------------------------------------------
// Admin & User Management Endpoints (Synced directly with data/db.json)
// -----------------------------------------------------------------------------
app.get('/api/admin/users', (_req, res) => {
  const db = readDb();
  const safeUsers = db.users.map(u => {
    const copy = { ...u };
    delete copy.password;
    copy.isAdmin = Boolean(u.isAdmin || u.mobile === '09334237673');
    return copy;
  });
  return res.json(safeUsers);
});

app.post('/api/admin/users', (req, res) => {
  const { name, mobile, password, role, specialty, city, district, ethnicity, gender, isAdmin, balance } = req.body;
  if (!name || !mobile || !password) {
    return res.status(400).json({ error: 'نام، شماره موبایل و رمز عبور الزامی است' });
  }

  const cleanMobile = mobile.trim();
  const db = readDb();
  if (db.users.some(u => u.mobile === cleanMobile)) {
    return res.status(400).json({ error: 'کاربری با این شماره موبایل قبلاً در سیستم ثبت شده است' });
  }

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    mobile: cleanMobile,
    password: password.trim(),
    gender: gender || 'آقا',
    city: city?.trim() || 'تهران',
    district: district?.trim() || '',
    ethnicity: ethnicity?.trim() || 'فارس (ایرانی)',
    role: role || 'worker',
    specialty: specialty?.trim() || (role === 'worker' ? 'کارگر ساده' : undefined),
    skills: [],
    experienceYears: 3,
    dailyRate: role === 'worker' ? 700000 : 0,
    bio: '',
    portfolio: [],
    balance: Number(balance) || 50000,
    rating: 5.0,
    reviewCount: 0,
    isVerified: true,
    isAdmin: Boolean(isAdmin),
    showPhonePublicly: false,
    createdAt: new Date().toLocaleDateString('fa-IR'),
  };

  db.users.unshift(newUser);
  writeDb(db);
  logEvent('REGISTER', `مدیریت کاربر جدید ثبت کرد: ${newUser.name} (${cleanMobile})`, req, newUser.id, newUser.name);

  const safe = { ...newUser };
  delete safe.password;
  return res.json({ success: true, user: safe });
});

app.delete('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const user = db.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'کاربر یافت نشد' });
  }

  // Prevent deleting the main admin
  if (user.mobile === '09334237673') {
    return res.status(403).json({ error: 'حذف مدیر اصلی سامانه امکان‌پذیر نیست' });
  }

  db.users = db.users.filter(u => u.id !== id);
  writeDb(db);
  logEvent('SECURITY_CHECK', `حذف کاربر ${user.name} (${user.mobile}) از سیستم توسط مدیریت`, req, user.id, user.name);

  return res.json({ success: true, message: 'کاربر با موفقیت حذف گردید' });
});

app.post('/api/admin/users/:id/promote', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const user = db.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'کاربر یافت نشد' });
  }

  // If user is main admin, always keep admin
  if (user.mobile === '09334237673') {
    user.isAdmin = true;
  } else {
    user.isAdmin = !user.isAdmin;
  }

  writeDb(db);
  logEvent('SECURITY_CHECK', `تغییر سطح دسترسی کاربر ${user.name} به ${user.isAdmin ? 'مدیر' : 'کاربر عادی'}`, req, user.id, user.name);

  const safe = { ...user };
  delete safe.password;
  return res.json({ success: true, isAdmin: user.isAdmin, user: safe });
});

app.get('/api/logs', (_req, res) => {
  const db = readDb();
  return res.json(db.auditLogs);
});

app.get('/api/stats', (_req, res) => {
  const db = readDb();
  const totalUsers = db.users.length;
  const totalWorkers = db.users.filter(u => u.role === 'worker' || u.role === 'both').length;
  const totalEmployers = db.users.filter(u => u.role === 'employer' || u.role === 'both').length;
  const totalJobs = db.jobs.length;
  const openJobs = db.jobs.filter(j => j.status === 'open').length;
  const acceptedJobs = db.jobs.filter(j => j.status === 'accepted').length;
  const completedJobs = db.jobs.filter(j => j.status === 'completed').length;
  const totalReviews = db.reviews.length;
  const totalTransactions = db.transactions.length;

  return res.json({
    totalUsers,
    totalWorkers,
    totalEmployers,
    totalJobs,
    openJobs,
    acceptedJobs,
    completedJobs,
    totalReviews,
    totalTransactions,
    serverPlatform: 'Linux / Debian Ready',
    systemStatus: 'Operational',
  });
});

// -----------------------------------------------------------------------------
// Setup Vite in Dev or Static Serving in Prod
// -----------------------------------------------------------------------------
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KarBalad] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
