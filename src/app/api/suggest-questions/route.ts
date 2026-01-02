import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, category } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `אתה עוזר לצוות מכירות.
בהינתן השאלה הבאה מלקוח, הצע 3 שאלות דומות שלקוחות אחרים עשויים לשאול.

קטגוריה: ${category}
שאלה: ${question}

חשוב: אם השאלה כללית (כמו "כמה עולה הקורס?"), הצע שאלות כלליות בלי לציין פרטים ספציפיים שאינך בטוח לגביהם.

החזר רק את 3 השאלות, כל שאלה בשורה נפרדת, בעברית בלבד. אל תוסיף מספור או תבליטים.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const suggestions = text.split("\n").filter(line => line.trim()).slice(0, 3);

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}

