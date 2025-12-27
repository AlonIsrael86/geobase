import { NextRequest, NextResponse } from "next/server";
import {
  getCategories,
  getCategoryNames,
  addCategory,
  deleteCategory,
  deleteCategoryByName,
  seedDefaultCategories,
} from "@/lib/db-actions";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const namesOnly = searchParams.get("namesOnly") === "true";

    if (namesOnly) {
      const names = await getCategoryNames();
      return NextResponse.json(names);
    }

    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const category = await addCategory(name);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const name = searchParams.get("name");

    if (id) {
      await deleteCategory(id);
      return NextResponse.json({ success: true });
    } else if (name) {
      const success = await deleteCategoryByName(name);
      return NextResponse.json({ success });
    } else {
      return NextResponse.json(
        { error: "ID or name is required" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}

// Seed default categories
export async function PUT() {
  try {
    await seedDefaultCategories();
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error seeding categories:", error);
    return NextResponse.json(
      { error: "Failed to seed categories" },
      { status: 500 }
    );
  }
}



