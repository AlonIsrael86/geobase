"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { QABlock } from "./qa-block";
import { QASorter } from "./qa-sorter";
import { WordpressModal } from "@/components/publish/wordpress-modal";
import { Article, Submission, ArticleStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ArrowRight, Save, Send, Eye, Edit } from "lucide-react";
import Link from "next/link";

interface ArticleEditorProps {
  article: Article;
  submissions: Submission[];
  onSave: (article: Article, submissions: Submission[]) => void;
  onPublish: () => void;
}

const statusConfig: Record<ArticleStatus, { label: string; class: string }> = {
  draft: { label: "טיוטה", class: "status-draft" },
  editing: { label: "טיוטה", class: "status-editing" },
  published: { label: "פורסם", class: "status-published" },
};

export function ArticleEditor({
  article: initialArticle,
  submissions: initialSubmissions,
  onSave,
  onPublish,
}: ArticleEditorProps) {
  const [article, setArticle] = useState(initialArticle);
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [activeQAId, setActiveQAId] = useState<string | undefined>(
    submissions[0]?.id
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  const status = statusConfig[article.status];

  const handleTitleChange = (title: string) => {
    setArticle({ ...article, title });
  };

  const handleQAUpdate = (id: string, data: Partial<Submission>) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
  };

  const handleReorder = (newSubmissions: Submission[]) => {
    setSubmissions(newSubmissions);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onSave(article, submissions);
    setIsSaving(false);
  };

  const scrollToQA = (id: string) => {
    setActiveQAId(id);
    const element = document.getElementById(`qa-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <Input
                  value={article.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="text-xl font-bold bg-transparent border-0 p-0 h-auto focus-visible:ring-0 truncate"
                  placeholder="כותרת המאמר..."
                />
                <Badge className={cn("mt-1 text-xs border", status.class)}>
                  {status.label}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="hidden sm:flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "edit" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("edit")}
                  className="gap-1.5"
                >
                  <Edit className="w-4 h-4" />
                  עריכה
                </Button>
                <Button
                  variant={viewMode === "preview" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("preview")}
                  className="gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  תצוגה
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">שמור טיוטה</span>
              </Button>
              <Button
                onClick={() => setShowPublishModal(true)}
                className="btn-primary gap-2"
                disabled
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">פרסם לוורדפרס <span className="text-xs opacity-70">(בקרוב)</span></span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-8">
          {/* Article Preview/Editor */}
          <div className="space-y-6">
            {submissions.map((submission, index) => (
              <div key={submission.id} id={`qa-${submission.id}`}>
                <QABlock
                  submission={submission}
                  index={index}
                  onUpdate={handleQAUpdate}
                />
                {index < submissions.length - 1 && (
                  <Separator className="my-6" />
                )}
              </div>
            ))}
            {submissions.length === 0 && (
              <Card className="border-dashed border-2 border-border">
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <p>אין שאלות במאמר זה</p>
                  <p className="text-sm mt-1">הוסף שאלות מהסיידבר</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <QASorter
                    submissions={submissions}
                    onReorder={handleReorder}
                    onAddMore={() => {
                      // In real app, open modal to select submissions
                      alert("פתח בורר שאלות");
                    }}
                    activeId={activeQAId}
                    onSelect={scrollToQA}
                  />
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </main>

      {/* WordPress Publish Modal */}
      <WordpressModal
        open={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        article={article}
        submissions={submissions}
        onPublish={onPublish}
      />
    </div>
  );
}

