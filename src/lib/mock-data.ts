// Simplified mock data for 8200academy GEOBase

export type SubmissionStatus = "new" | "in_article" | "published";
export type ArticleStatus = "draft" | "editing" | "published";

export interface Submission {
  id: string;
  question: string;
  answer: string;
  category: string;
  imageUrl?: string;
  source?: string;
  wordCount: number;
  status: SubmissionStatus;
  articleId?: string;
  createdAt: Date;
}

export interface Article {
  id: string;
  title: string;
  status: ArticleStatus;
  submissionIds: string[];
  wordpressUrl?: string;
  metaTitle?: string;
  metaDesc?: string;
  focusKeyword?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Categories for 8200academy
export const CATEGORIES = [
  "קורס סייבר",
  "קורס Data",
  "קורס פיתוח",
  "כללי",
  "מחירים ותשלומים",
  "השמה ותעסוקה",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Mock submissions
export const mockSubmissions: Submission[] = [
  {
    id: "sub-1",
    question: "כמה זמן נמשך קורס הסייבר?",
    answer: "קורס הסייבר ב-8200academy נמשך 6 חודשים של לימודים אינטנסיביים. הקורס כולל 500 שעות לימוד פרונטליות, פרויקטים מעשיים, והכנה מלאה לתעודות הסמכה בינלאומיות. הלימודים מתקיימים 4 ימים בשבוע, מה שמאפשר לסטודנטים לעבוד במקביל או להתמקד לחלוטין בלימודים.",
    category: "קורס סייבר",
    source: "שיחה עם לקוח מתעניין",
    wordCount: 52,
    status: "new",
    createdAt: new Date("2024-12-05T10:30:00"),
  },
  {
    id: "sub-2",
    question: "האם יש התחייבות להשמה בעבודה?",
    answer: "כן, אנחנו מתחייבים להשמה בתעסוקה לכל בוגר שעומד בדרישות הקורס. שיעור ההשמה שלנו עומד על 94% תוך 3 חודשים מסיום הלימודים. אנחנו עובדים עם מעל 200 חברות הייטק מובילות בישראל ומלווים את הבוגרים בתהליך חיפוש העבודה, הכנה לראיונות, ומשא ומתן על שכר.",
    category: "השמה ותעסוקה",
    source: "פגישת ייעוץ",
    wordCount: 58,
    status: "new",
    createdAt: new Date("2024-12-05T09:15:00"),
  },
  {
    id: "sub-3",
    question: "מה השכר הממוצע של בוגרי הקורס?",
    answer: "הבוגרים שלנו משתלבים בשוק העבודה עם שכר התחלתי ממוצע של 18,000-25,000 ש״ח למשרה מלאה. לאחר שנה של ניסיון, השכר עולה משמעותית ל-25,000-35,000 ש״ח. בוגרי הסייבר מהמצטיינים מגיעים לשכר של מעל 40,000 ש״ח כבר בשנה השנייה שלהם בתעשייה.",
    category: "השמה ותעסוקה",
    wordCount: 55,
    status: "in_article",
    articleId: "article-1",
    createdAt: new Date("2024-12-04T14:20:00"),
  },
  {
    id: "sub-4",
    question: "האם צריך רקע טכני קודם?",
    answer: "לא נדרש רקע טכני קודם! הקורס מתחיל מהיסודות ומתאים גם למי שמגיע ללא ניסיון בתחום. כל מה שצריך זה מוטיבציה גבוהה, יכולת לימוד עצמאית, ואנגלית ברמה בסיסית. אנחנו מלמדים הכל מאפס - ממבנה מחשב ורשתות ועד טכניקות האקינג מתקדמות.",
    category: "קורס סייבר",
    source: "שאלה נפוצה",
    wordCount: 54,
    status: "in_article",
    articleId: "article-1",
    createdAt: new Date("2024-12-03T11:45:00"),
  },
  {
    id: "sub-5",
    question: "מה ההבדל בין קורס Data לקורס פיתוח?",
    answer: "קורס Data Analytics מתמקד בניתוח נתונים, Python, SQL, ו-BI tools כמו Tableau ו-PowerBI. מתאים למי שאוהב לחקור נתונים ולהפיק תובנות עסקיות. קורס פיתוח מתמקד בבניית אפליקציות web ו-mobile עם React, Node.js ו-databases. מתאים למי שאוהב ליצור מוצרים ולראות תוצאות מיידיות.",
    category: "כללי",
    wordCount: 58,
    status: "new",
    createdAt: new Date("2024-12-05T08:00:00"),
  },
  {
    id: "sub-6",
    question: "האם יש אפשרויות מימון?",
    answer: "בהחלט! אנחנו מציעים מספר אפשרויות מימון: תשלום מלא מראש עם הנחה של 10%, פריסה ל-12 תשלומים ללא ריבית, או מודל ISA - תשלום רק אחרי השמה בעבודה. במודל ISA אתה לא משלם שקל עד שאתה מתחיל לעבוד ולהרוויח מעל 15,000 ש״ח בחודש.",
    category: "מחירים ותשלומים",
    source: "שיחת מכירות",
    wordCount: 56,
    status: "new",
    createdAt: new Date("2024-12-04T16:30:00"),
  },
  {
    id: "sub-7",
    question: "מתי מתחיל המחזור הבא?",
    answer: "המחזור הבא מתחיל בינואר 2025. יש לנו כיתות שמתחילות בתחילת כל חודש. מומלץ להירשם מוקדם כי הכיתות מתמלאות מהר - בממוצע הכיתה מתמלאת חודש וחצי לפני תחילת הקורס. ניתן לשריין מקום עם מקדמה של 1,000 ש״ח שמקוזזת מהתשלום הכולל.",
    category: "כללי",
    wordCount: 54,
    status: "published",
    articleId: "article-2",
    createdAt: new Date("2024-11-20T13:00:00"),
  },
];

// Mock articles
export const mockArticles: Article[] = [
  {
    id: "article-1",
    title: "כל מה שצריך לדעת על קריירה בסייבר",
    status: "editing",
    submissionIds: ["sub-3", "sub-4"],
    createdAt: new Date("2024-12-04T15:00:00"),
    updatedAt: new Date("2024-12-05T10:00:00"),
  },
  {
    id: "article-2",
    title: "שאלות נפוצות על הרשמה ולימודים",
    status: "published",
    submissionIds: ["sub-7"],
    wordpressUrl: "https://8200academy.com/faq-registration",
    metaTitle: "שאלות נפוצות על לימודים ב-8200academy",
    metaDesc: "כל התשובות לשאלות הנפוצות על הרשמה, מחזורים ותהליך הלימודים ב-8200academy",
    focusKeyword: "לימודי סייבר",
    publishedAt: new Date("2024-11-26T10:00:00"),
    createdAt: new Date("2024-11-20T14:00:00"),
    updatedAt: new Date("2024-11-25T16:00:00"),
  },
];

// Helper functions
export function getSubmissionById(id: string): Submission | undefined {
  return mockSubmissions.find((s) => s.id === id);
}

export function getArticleById(id: string): Article | undefined {
  return mockArticles.find((a) => a.id === id);
}

export function getSubmissionsForArticle(articleId: string): Submission[] {
  return mockSubmissions.filter((s) => s.articleId === articleId);
}

export function getSubmissionsByStatus(status: SubmissionStatus): Submission[] {
  return mockSubmissions.filter((s) => s.status === status);
}

export function getArticlesByStatus(status: ArticleStatus): Article[] {
  return mockArticles.filter((a) => a.status === status);
}

// Stats
export function getStats() {
  return {
    newSubmissions: mockSubmissions.filter((s) => s.status === "new").length,
    articlesInProgress: mockArticles.filter(
      (a) => a.status === "draft" || a.status === "editing"
    ).length,
    publishedArticles: mockArticles.filter((a) => a.status === "published").length,
  };
}


