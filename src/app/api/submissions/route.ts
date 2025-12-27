import { NextRequest, NextResponse } from "next/server";
import {
  getSubmissions,
  addSubmission,
  deleteSubmission,
  deleteSubmissions,
} from "@/lib/db-actions";

export async function GET() {
  try {
    const submissions = await getSubmissions();
    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const submission = await addSubmission(body);
    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create submission" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get("ids");
    
    if (ids) {
      // Multiple deletions
      const idArray = ids.split(",");
      const count = await deleteSubmissions(idArray);
      return NextResponse.json({ count });
    } else {
      // Single deletion
      const id = searchParams.get("id");
      if (!id) {
        return NextResponse.json(
          { error: "ID is required" },
          { status: 400 }
        );
      }
      await deleteSubmission(id);
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Error deleting submission(s):", error);
    return NextResponse.json(
      { error: "Failed to delete submission(s)" },
      { status: 500 }
    );
  }
}



