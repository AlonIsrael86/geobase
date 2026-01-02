import { NextRequest, NextResponse } from "next/server";
import { addSubmissions } from "@/lib/db-actions";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { submissions } = body;

    if (!Array.isArray(submissions)) {
      return NextResponse.json(
        { error: "submissions must be an array" },
        { status: 400 }
      );
    }

    const result = await addSubmissions(submissions);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating bulk submissions:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create submissions" },
      { status: 500 }
    );
  }
}








