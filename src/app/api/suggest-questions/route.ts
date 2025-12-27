import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// #region agent log
fetch('http://127.0.0.1:7244/ingest/1672c919-3851-46e4-a77b-46c4b2bbfbae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'suggest-questions/route.ts:4',message:'Module loaded - checking API key',data:{hasKey:!!process.env.GEMINI_API_KEY,keyLength:process.env.GEMINI_API_KEY?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'A'})}).catch(()=>{});
// #endregion

const apiKey = process.env.GEMINI_API_KEY || "";

// #region agent log
fetch('http://127.0.0.1:7244/ingest/1672c919-3851-46e4-a77b-46c4b2bbfbae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'suggest-questions/route.ts:8',message:'Initializing GoogleGenerativeAI',data:{apiKeyExists:!!apiKey,apiKeyLength:apiKey.length},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'A'})}).catch(()=>{});
// #endregion

const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/1672c919-3851-46e4-a77b-46c4b2bbfbae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'suggest-questions/route.ts:15',message:'=== API CALLED ===',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'request',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/1672c919-3851-46e4-a77b-46c4b2bbfbae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'suggest-questions/route.ts:16',message:'GEMINI_API_KEY check',data:{exists:!!process.env.GEMINI_API_KEY,keyLength:process.env.GEMINI_API_KEY?.length||0,firstChars:process.env.GEMINI_API_KEY?.substring(0,10)||'N/A'},timestamp:Date.now(),sessionId:'debug-session',runId:'request',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  try {
    const body = await req.json();
    const { question, category } = body;

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/1672c919-3851-46e4-a77b-46c4b2bbfbae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'suggest-questions/route.ts:25',message:'Request body parsed',data:{hasQuestion:!!question,hasCategory:!!category,questionLength:question?.length||0,categoryValue:category},timestamp:Date.now(),sessionId:'debug-session',runId:'request',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/1672c919-3851-46e4-a77b-46c4b2bbfbae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'suggest-questions/route.ts:33',message:'Before getGenerativeModel',data:{apiKeyExists:!!apiKey,genAIExists:!!genAI},timestamp:Date.now(),sessionId:'debug-session',runId:'request',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/1672c919-3851-46e4-a77b-46c4b2bbfbae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'suggest-questions/route.ts:44',message:'Using model: gemini-2.0-flash',data:{modelName:'gemini-2.0-flash'},timestamp:Date.now(),sessionId:'debug-session',runId:'request',hypothesisId:'MODEL'})}).catch(()=>{});
    // #endregion
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/1672c919-3851-46e4-a77b-46c4b2bbfbae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'suggest-questions/route.ts:36',message:'Model obtained, before generateContent',data:{modelExists:!!model},timestamp:Date.now(),sessionId:'debug-session',runId:'request',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    const prompt = `אתה עוזר לצוות מכירות.
בהינתן השאלה הבאה מלקוח, הצע 3 שאלות דומות שלקוחות אחרים עשויים לשאול.

קטגוריה: ${category}
שאלה: ${question}

חשוב: אם השאלה כללית (כמו "כמה עולה הקורס?"), הצע שאלות כלליות בלי לציין פרטים ספציפיים שאינך בטוח לגביהם.

החזר רק את 3 השאלות, כל שאלה בשורה נפרדת, בעברית בלבד. אל תוסיף מספור או תבליטים.`;

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/1672c919-3851-46e4-a77b-46c4b2bbfbae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'suggest-questions/route.ts:48',message:'Before API call',data:{promptLength:prompt.length},timestamp:Date.now(),sessionId:'debug-session',runId:'request',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    const result = await model.generateContent(prompt);

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/1672c919-3851-46e4-a77b-46c4b2bbfbae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'suggest-questions/route.ts:50',message:'After generateContent, before response',data:{resultExists:!!result},timestamp:Date.now(),sessionId:'debug-session',runId:'request',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    const response = await result.response;

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/1672c919-3851-46e4-a77b-46c4b2bbfbae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'suggest-questions/route.ts:54',message:'Response obtained, before text()',data:{responseExists:!!response},timestamp:Date.now(),sessionId:'debug-session',runId:'request',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    const text = response.text();

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/1672c919-3851-46e4-a77b-46c4b2bbfbae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'suggest-questions/route.ts:56',message:'Text extracted',data:{textLength:text?.length||0,textPreview:text?.substring(0,100)||'N/A'},timestamp:Date.now(),sessionId:'debug-session',runId:'request',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    const suggestions = text.split("\n").filter(line => line.trim()).slice(0, 3);

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/1672c919-3851-46e4-a77b-46c4b2bbfbae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'suggest-questions/route.ts:60',message:'Success - returning suggestions',data:{suggestionsCount:suggestions.length},timestamp:Date.now(),sessionId:'debug-session',runId:'request',hypothesisId:'SUCCESS'})}).catch(()=>{});
    // #endregion
    
    return NextResponse.json({ suggestions });
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/1672c919-3851-46e4-a77b-46c4b2bbfbae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'suggest-questions/route.ts:65',message:'Gemini Error',data:{errorMessage:error?.message||'Unknown',errorName:error?.name||'Unknown',errorStack:error?.stack?.substring(0,200)||'N/A'},timestamp:Date.now(),sessionId:'debug-session',runId:'request',hypothesisId:'ERROR'})}).catch(()=>{});
    // #endregion

    // #region agent log
    try {
      fetch('http://127.0.0.1:7244/ingest/1672c919-3851-46e4-a77b-46c4b2bbfbae',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'suggest-questions/route.ts:68',message:'Full error object',data:{errorStringified:JSON.stringify(error,null,2)},timestamp:Date.now(),sessionId:'debug-session',runId:'request',hypothesisId:'ERROR'})}).catch(()=>{});
    } catch {}
    // #endregion

    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}

