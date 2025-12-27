"use server";

import { prisma } from "./db";
import { auth, currentUser } from "@clerk/nextjs/server";

// Get or create user and their client
async function getCurrentUserWithClient() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  // Get email from Clerk user
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress || `user-${userId}@temp.local`;

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { client: true },
  });

  if (!user) {
    // Create default client for new user
    const client = await prisma.client.create({
      data: {
        name: "My Business",
        slug: `client-${userId.slice(0, 8)}`,
      },
    });

    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: email,
        name: clerkUser?.firstName || clerkUser?.fullName || null,
        clientId: client.id,
      },
      include: { client: true },
    });
  } else {
    // Update email/name if changed in Clerk (only if different to avoid unnecessary updates)
    const newName = clerkUser?.firstName || clerkUser?.fullName || null;
    if (user.email !== email || user.name !== newName) {
      try {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            email: email,
            name: newName,
          },
          include: { client: true },
        });
      } catch (error) {
        // If email conflict (shouldn't happen with Clerk), log and continue with existing user
        console.error("Error updating user email/name:", error);
      }
    }
  }

  return user;
}

// SUBMISSIONS

export async function getSubmissions() {
  try {
    const user = await getCurrentUserWithClient();
    if (!user.clientId) return [];

    const submissions = await prisma.submission.findMany({
      where: { clientId: user.clientId },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    // Transform to match the expected format
    return submissions.map((s) => ({
      id: s.id,
      question: s.question,
      answer: s.answer,
      category: s.category.name, // Keep as string for backward compatibility
      categoryId: s.categoryId,
      imageUrl: s.imageUrl || undefined,
      source: s.source || undefined,
      wordCount: s.wordCount,
      status: s.status as "new" | "in_article" | "published",
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return [];
  }
}

export async function addSubmission(data: {
  question: string;
  answer: string;
  categoryId?: string;
  categoryName?: string; // For backward compatibility
  source?: string;
  imageUrl?: string;
  wordCount: number;
}) {
  try {
    const user = await getCurrentUserWithClient();
    if (!user.clientId) throw new Error("No client");

    let categoryId = data.categoryId;
    
    // If categoryName provided but no categoryId, find or create category
    if (!categoryId && data.categoryName) {
      let category = await prisma.category.findFirst({
        where: { 
          name: data.categoryName,
          clientId: user.clientId,
        },
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: data.categoryName,
            clientId: user.clientId,
          },
        });
      }
      categoryId = category.id;
    }

    if (!categoryId) {
      throw new Error("Category ID or name is required");
    }

    const submission = await prisma.submission.create({
      data: {
        question: data.question,
        answer: data.answer,
        categoryId: categoryId,
        source: data.source,
        imageUrl: data.imageUrl,
        wordCount: data.wordCount,
        status: "new",
        clientId: user.clientId,
      },
      include: { category: true },
    });

    return {
      id: submission.id,
      question: submission.question,
      answer: submission.answer,
      category: submission.category.name,
      categoryId: submission.categoryId,
      imageUrl: submission.imageUrl || undefined,
      source: submission.source || undefined,
      wordCount: submission.wordCount,
      status: submission.status as "new" | "in_article" | "published",
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error adding submission:", error);
    throw error;
  }
}

export async function addSubmissions(dataArray: Array<{
  question: string;
  answer: string;
  categoryName: string;
  source?: string;
  wordCount: number;
}>) {
  try {
    const user = await getCurrentUserWithClient();
    if (!user.clientId) throw new Error("No client");

    // Get all categories for this client
    const categories = await prisma.category.findMany({
      where: { clientId: user.clientId },
    });

    const categoryMap = new Map(categories.map(c => [c.name, c.id]));

    // Create submissions with category lookups
    const submissions = await Promise.all(
      dataArray.map(async (data) => {
        let categoryId = categoryMap.get(data.categoryName);
        
        // Create category if it doesn't exist
        if (!categoryId) {
          const newCategory = await prisma.category.create({
            data: {
              name: data.categoryName,
              clientId: user.clientId!,
            },
          });
          categoryId = newCategory.id;
          categoryMap.set(data.categoryName, categoryId);
        }

        return prisma.submission.create({
          data: {
            question: data.question,
            answer: data.answer,
            categoryId: categoryId,
            source: data.source,
            wordCount: data.wordCount,
            status: "new",
            clientId: user.clientId!,
          },
          include: { category: true },
        });
      })
    );

    return submissions.map((s) => ({
      id: s.id,
      question: s.question,
      answer: s.answer,
      category: s.category.name,
      categoryId: s.categoryId,
      imageUrl: s.imageUrl || undefined,
      source: s.source || undefined,
      wordCount: s.wordCount,
      status: s.status as "new" | "in_article" | "published",
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error adding submissions:", error);
    throw error;
  }
}

export async function deleteSubmission(id: string) {
  try {
    const user = await getCurrentUserWithClient();
    if (!user.clientId) throw new Error("No client");

    await prisma.submission.delete({
      where: { id, clientId: user.clientId },
    });

    return true;
  } catch (error) {
    console.error("Error deleting submission:", error);
    throw error;
  }
}

export async function deleteSubmissions(ids: string[]) {
  try {
    const user = await getCurrentUserWithClient();
    if (!user.clientId) throw new Error("No client");

    const result = await prisma.submission.deleteMany({
      where: { 
        id: { in: ids },
        clientId: user.clientId,
      },
    });

    return result.count;
  } catch (error) {
    console.error("Error deleting submissions:", error);
    throw error;
  }
}

// CATEGORIES

export async function getCategories() {
  try {
    const user = await getCurrentUserWithClient();
    if (!user.clientId) return [];

    const categories = await prisma.category.findMany({
      where: { clientId: user.clientId },
      orderBy: { name: "asc" },
    });

    // Return both objects and names for backward compatibility
    return categories.map(c => ({
      id: c.id,
      name: c.name,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getCategoryNames(): Promise<string[]> {
  const categories = await getCategories();
  return categories.map(c => c.name);
}

export async function addCategory(name: string) {
  try {
    const user = await getCurrentUserWithClient();
    if (!user.clientId) throw new Error("No client");

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        clientId: user.clientId,
      },
    });

    return {
      id: category.id,
      name: category.name,
    };
  } catch (error) {
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      throw new Error("Category already exists");
    }
    console.error("Error adding category:", error);
    throw error;
  }
}

export async function deleteCategory(id: string) {
  try {
    const user = await getCurrentUserWithClient();
    if (!user.clientId) throw new Error("No client");

    await prisma.category.delete({
      where: { id, clientId: user.clientId },
    });

    return true;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}

export async function deleteCategoryByName(name: string) {
  try {
    const user = await getCurrentUserWithClient();
    if (!user.clientId) throw new Error("No client");

    const category = await prisma.category.findFirst({
      where: { name, clientId: user.clientId },
    });

    if (category) {
      await prisma.category.delete({
        where: { id: category.id },
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting category by name:", error);
    throw error;
  }
}

// STATS

export async function getStats() {
  try {
    const user = await getCurrentUserWithClient();
    if (!user.clientId) {
      return { newSubmissions: 0, articlesInProgress: 0, publishedArticles: 0 };
    }

    const [newCount, inProgressCount, publishedCount] = await Promise.all([
      prisma.submission.count({
        where: { clientId: user.clientId, status: "new" },
      }),
      prisma.submission.count({
        where: { clientId: user.clientId, status: "in_article" },
      }),
      prisma.submission.count({
        where: { clientId: user.clientId, status: "published" },
      }),
    ]);

    return {
      newSubmissions: newCount,
      articlesInProgress: inProgressCount,
      publishedArticles: publishedCount,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { newSubmissions: 0, articlesInProgress: 0, publishedArticles: 0 };
  }
}

// SEED DEFAULT CATEGORIES

export async function seedDefaultCategories() {
  try {
    const user = await getCurrentUserWithClient();
    if (!user.clientId) return;

    const existingCategories = await prisma.category.count({
      where: { clientId: user.clientId },
    });

    if (existingCategories === 0) {
      const defaultCategories = [
        "קורס סייבר",
        "קורס Data",
        "קורס פיתוח",
        "כללי",
        "מחירים ותשלומים",
        "השמה ותעסוקה",
      ];

      await prisma.category.createMany({
        data: defaultCategories.map((name) => ({
          name,
          clientId: user.clientId!,
        })),
      });
    }
  } catch (error) {
    console.error("Error seeding categories:", error);
  }
}

