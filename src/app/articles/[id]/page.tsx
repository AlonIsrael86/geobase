"use client";

import { useParams, useRouter } from "next/navigation";
import { ArticleEditor } from "@/components/articles/article-editor";
import {
  getArticleById,
  getSubmissionsForArticle,
  mockSubmissions,
  Article,
  Submission,
} from "@/lib/mock-data";
import { useEffect, useState } from "react";

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const articleId = params.id as string;
    
    if (articleId === "new") {
      // Handle new article creation from query params
      const searchParams = new URLSearchParams(window.location.search);
      const submissionIds = searchParams.get("submissions")?.split(",") || [];
      
      const selectedSubmissions = mockSubmissions.filter((s) =>
        submissionIds.includes(s.id)
      );

      // Create new article
      const newArticle: Article = {
        id: `article-${Date.now()}`,
        title: "מאמר חדש",
        status: "draft",
        submissionIds: submissionIds,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setArticle(newArticle);
      setSubmissions(selectedSubmissions);
      setLoading(false);
      return;
    }

    // Load existing article
    const foundArticle = getArticleById(articleId);
    if (foundArticle) {
      setArticle(foundArticle);
      setSubmissions(getSubmissionsForArticle(articleId));
    }
    setLoading(false);
  }, [params.id]);

  const handleSave = (updatedArticle: Article, updatedSubmissions: Submission[]) => {
    console.log("Saving article:", updatedArticle);
    console.log("Saving submissions:", updatedSubmissions);
    // In real app, would POST to API
  };

  const handlePublish = () => {
    console.log("Article published!");
    // In real app, would update article status and redirect
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">מאמר לא נמצא</h2>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-primary hover:underline"
          >
            חזור לדאשבורד
          </button>
        </div>
      </div>
    );
  }

  return (
    <ArticleEditor
      article={article}
      submissions={submissions}
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}


