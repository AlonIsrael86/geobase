// Local Storage management for GEOBase

export interface Submission {
  id: string;
  question: string;
  answer: string;
  category: string;
  imageUrl?: string;
  source?: string;
  wordCount: number;
  status: "new" | "in_article" | "published";
  articleId?: string;
  createdAt: string; // ISO date string
}

export interface Article {
  id: string;
  title: string;
  status: "draft" | "editing" | "published";
  submissionIds: string[];
  wordpressUrl?: string;
  metaTitle?: string;
  metaDesc?: string;
  focusKeyword?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const SUBMISSIONS_KEY = "geo_submissions";
const ARTICLES_KEY = "geo_articles";
const CATEGORIES_KEY = "geo_categories";

// Default categories
const DEFAULT_CATEGORIES = [
  "קורס סייבר",
  "קורס Data",
  "קורס פיתוח",
  "כללי",
  "מחירים ותשלומים",
  "השמה ותעסוקה",
];

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============ CATEGORIES ============

export function getCategories(): string[] {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  const data = localStorage.getItem(CATEGORIES_KEY);
  if (!data) {
    // Seed default categories
    seedCategories();
    return DEFAULT_CATEGORIES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function seedCategories(): void {
  if (typeof window === "undefined") return;
  const existing = localStorage.getItem(CATEGORIES_KEY);
  if (!existing) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
  }
}

export function addCategory(name: string): boolean {
  const categories = getCategories();
  const trimmed = name.trim();
  if (!trimmed || categories.includes(trimmed)) {
    return false;
  }
  categories.push(trimmed);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  return true;
}

export function deleteCategory(name: string): boolean {
  const categories = getCategories();
  const filtered = categories.filter((c) => c !== name);
  if (filtered.length === categories.length) return false;
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(filtered));
  return true;
}

// ============ SUBMISSIONS ============

export function getSubmissions(): Submission[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(SUBMISSIONS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function getSubmissionById(id: string): Submission | undefined {
  const submissions = getSubmissions();
  return submissions.find((s) => s.id === id);
}

export function addSubmission(
  data: Omit<Submission, "id" | "status" | "createdAt">
): Submission {
  const submissions = getSubmissions();
  const newSubmission: Submission = {
    ...data,
    id: generateId(),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  submissions.unshift(newSubmission); // Add to beginning
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  return newSubmission;
}

export function addSubmissions(
  dataArray: Omit<Submission, "id" | "status" | "createdAt">[]
): Submission[] {
  const submissions = getSubmissions();
  const newSubmissions: Submission[] = dataArray.map((data) => ({
    ...data,
    id: generateId(),
    status: "new" as const,
    createdAt: new Date().toISOString(),
  }));
  submissions.unshift(...newSubmissions);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  return newSubmissions;
}

export function updateSubmission(
  id: string,
  data: Partial<Submission>
): Submission | undefined {
  const submissions = getSubmissions();
  const index = submissions.findIndex((s) => s.id === id);
  if (index === -1) return undefined;

  submissions[index] = { ...submissions[index], ...data };
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  return submissions[index];
}

export function deleteSubmission(id: string): boolean {
  const submissions = getSubmissions();
  const filtered = submissions.filter((s) => s.id !== id);
  if (filtered.length === submissions.length) return false;
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(filtered));
  return true;
}

export function deleteSubmissions(ids: string[]): number {
  if (!ids.length) return 0;
  const idSet = new Set(ids);
  const submissions = getSubmissions();
  const filtered = submissions.filter((s) => !idSet.has(s.id));
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(filtered));
  return submissions.length - filtered.length;
}

export function getSubmissionsByStatus(
  status: Submission["status"]
): Submission[] {
  return getSubmissions().filter((s) => s.status === status);
}

// ============ ARTICLES ============

export function getArticles(): Article[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(ARTICLES_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function getArticleById(id: string): Article | undefined {
  const articles = getArticles();
  return articles.find((a) => a.id === id);
}

export function addArticle(
  data: Omit<Article, "id" | "createdAt" | "updatedAt">
): Article {
  const articles = getArticles();
  const now = new Date().toISOString();
  const newArticle: Article = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  articles.unshift(newArticle);
  localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
  return newArticle;
}

export function updateArticle(
  id: string,
  data: Partial<Article>
): Article | undefined {
  const articles = getArticles();
  const index = articles.findIndex((a) => a.id === id);
  if (index === -1) return undefined;

  articles[index] = {
    ...articles[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
  return articles[index];
}

export function deleteArticle(id: string): boolean {
  const articles = getArticles();
  const filtered = articles.filter((a) => a.id !== id);
  if (filtered.length === articles.length) return false;
  localStorage.setItem(ARTICLES_KEY, JSON.stringify(filtered));
  return true;
}

// ============ STATS ============

export function getStats() {
  const submissions = getSubmissions();
  const articles = getArticles();

  return {
    newSubmissions: submissions.filter((s) => s.status === "new").length,
    articlesInProgress: articles.filter(
      (a) => a.status === "draft" || a.status === "editing"
    ).length,
    publishedArticles: articles.filter((a) => a.status === "published").length,
  };
}

// ============ SEED DATA ============

export function seedInitialData(): void {
  if (typeof window === "undefined") return;

  // Seed categories
  seedCategories();

  // Only seed if no data exists
  const existingSubmissions = localStorage.getItem(SUBMISSIONS_KEY);
  if (existingSubmissions) return;

  const initialSubmissions: Submission[] = [
    {
      id: "sub-1",
      question: "כמה זמן נמשך קורס הסייבר?",
      answer:
        "קורס הסייבר ב-8200academy נמשך 6 חודשים של לימודים אינטנסיביים. הקורס כולל 500 שעות לימוד פרונטליות, פרויקטים מעשיים, והכנה מלאה לתעודות הסמכה בינלאומיות. הלימודים מתקיימים 4 ימים בשבוע, מה שמאפשר לסטודנטים לעבוד במקביל או להתמקד לחלוטין בלימודים.",
      category: "קורס סייבר",
      source: "שיחה עם לקוח מתעניין",
      wordCount: 52,
      status: "new",
      createdAt: "2024-12-05T10:30:00.000Z",
    },
    {
      id: "sub-2",
      question: "האם יש התחייבות להשמה בעבודה?",
      answer:
        "כן, אנחנו מתחייבים להשמה בתעסוקה לכל בוגר שעומד בדרישות הקורס. שיעור ההשמה שלנו עומד על 94% תוך 3 חודשים מסיום הלימודים. אנחנו עובדים עם מעל 200 חברות הייטק מובילות בישראל ומלווים את הבוגרים בתהליך חיפוש העבודה, הכנה לראיונות, ומשא ומתן על שכר.",
      category: "השמה ותעסוקה",
      source: "פגישת ייעוץ",
      wordCount: 58,
      status: "new",
      createdAt: "2024-12-05T09:15:00.000Z",
    },
    {
      id: "sub-3",
      question: "מה השכר הממוצע של בוגרי הקורס?",
      answer:
        'הבוגרים שלנו משתלבים בשוק העבודה עם שכר התחלתי ממוצע של 18,000-25,000 ש״ח למשרה מלאה. לאחר שנה של ניסיון, השכר עולה משמעותית ל-25,000-35,000 ש״ח. בוגרי הסייבר מהמצטיינים מגיעים לשכר של מעל 40,000 ש״ח כבר בשנה השנייה שלהם בתעשייה.',
      category: "השמה ותעסוקה",
      wordCount: 55,
      status: "new",
      createdAt: "2024-12-04T14:20:00.000Z",
    },
    {
      id: "sub-4",
      question: "האם צריך רקע טכני קודם?",
      answer:
        "לא נדרש רקע טכני קודם! הקורס מתחיל מהיסודות ומתאים גם למי שמגיע ללא ניסיון בתחום. כל מה שצריך זה מוטיבציה גבוהה, יכולת לימוד עצמאית, ואנגלית ברמה בסיסית. אנחנו מלמדים הכל מאפס - ממבנה מחשב ורשתות ועד טכניקות האקינג מתקדמות.",
      category: "קורס סייבר",
      source: "שאלה נפוצה",
      wordCount: 54,
      status: "new",
      createdAt: "2024-12-03T11:45:00.000Z",
    },
    {
      id: "sub-5",
      question: "מה ההבדל בין קורס Data לקורס פיתוח?",
      answer:
        "קורס Data Analytics מתמקד בניתוח נתונים, Python, SQL, ו-BI tools כמו Tableau ו-PowerBI. מתאים למי שאוהב לחקור נתונים ולהפיק תובנות עסקיות. קורס פיתוח מתמקד בבניית אפליקציות web ו-mobile עם React, Node.js ו-databases. מתאים למי שאוהב ליצור מוצרים ולראות תוצאות מיידיות.",
      category: "כללי",
      wordCount: 58,
      status: "new",
      createdAt: "2024-12-05T08:00:00.000Z",
    },
    {
      id: "sub-6",
      question: "האם יש אפשרויות מימון?",
      answer:
        'בהחלט! אנחנו מציעים מספר אפשרויות מימון: תשלום מלא מראש עם הנחה של 10%, פריסה ל-12 תשלומים ללא ריבית, או מודל ISA - תשלום רק אחרי השמה בעבודה. במודל ISA אתה לא משלם שקל עד שאתה מתחיל לעבוד ולהרוויח מעל 15,000 ש״ח בחודש.',
      category: "מחירים ותשלומים",
      source: "שיחת מכירות",
      wordCount: 56,
      status: "new",
      createdAt: "2024-12-04T16:30:00.000Z",
    },
    {
      id: "sub-7",
      question: "מתי מתחיל המחזור הבא?",
      answer:
        'המחזור הבא מתחיל בינואר 2025. יש לנו כיתות שמתחילות בתחילת כל חודש. מומלץ להירשם מוקדם כי הכיתות מתמלאות מהר - בממוצע הכיתה מתמלאת חודש וחצי לפני תחילת הקורס. ניתן לשריין מקום עם מקדמה של 1,000 ש״ח שמקוזזת מהתשלום הכולל.',
      category: "כללי",
      wordCount: 54,
      status: "new",
      createdAt: "2024-11-20T13:00:00.000Z",
    },
  ];

  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(initialSubmissions));
}
