import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { question, category } = await req.json();
    
    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // Use the same model name as suggest-questions
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    
    const prompt = `אתה כותב תשובות עבור עסק שמקבל שאלות מלקוחות.

קטגוריה: ${category}
שאלה: ${question}

הנחיות:
- כתוב תשובה קצרה וממוקדת (80-120 מילים)
- דבר בגוף ראשון רבים ("אנחנו מציעים...", "אצלנו...")
- תן תשובה עם פרטים שהמשתמש יוכל לערוך לפי העסק שלו
- השתמש ב-[סוגריים מרובעים] למקומות שצריך למלא פרטים ספציפיים
- לדוגמה: "המחיר הוא [מחיר] ש״ח" או "הקורס נמשך [משך זמן]"
- סיים במשפט שמזמין ליצור קשר

כתוב רק את התשובה.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();
    
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Failed to generate answer" },
      { status: 500 }
    );
  }
}

