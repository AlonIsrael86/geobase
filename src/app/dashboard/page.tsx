"use client";

import { useState, useEffect } from "react";
import { UserButton, SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { SubmissionsTable } from "@/components/dashboard/submissions-table";
import { ArticleList } from "@/components/dashboard/article-list";
import { ViewSubmissionModal } from "@/components/dashboard/view-submission-modal";
import { FloatingActionBar } from "@/components/dashboard/floating-action-bar";
import { ViewAllQuestionsModal } from "@/components/dashboard/view-all-questions-modal";
import { ImportModal } from "@/components/dashboard/import-modal";
import { Submission, Article } from "@/lib/storage";
import { Layers, MessageSquarePlus, FileUp, Download, Database } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import jitLogo from "@/../public/Just In Time logo-version-3.png";
import * as XLSX from "xlsx";
import { KnowledgeBaseModal } from "@/components/dashboard/knowledge-base-modal";
import { PremiumUpsellModal } from "@/components/dashboard/premium-upsell-modal";
import { notifyExport } from "@/lib/notifications";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState({
    newSubmissions: 0,
    articlesInProgress: 0,
    publishedArticles: 0,
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewingSubmission, setViewingSubmission] = useState<Submission | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showViewAllModal, setShowViewAllModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showKnowledgeBaseModal, setShowKnowledgeBaseModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Load data from database via API
  const loadData = async () => {
    try {
      // Seed default categories if needed
      await fetch("/api/categories", { method: "PUT" });
      
      // Fetch all data in parallel
      const [submissionsRes, statsRes] = await Promise.all([
        fetch("/api/submissions"),
        fetch("/api/stats"),
      ]);

      if (submissionsRes.ok) {
        const loadedSubmissions = await submissionsRes.json();
        setSubmissions(loadedSubmissions);
      }

      if (statsRes.ok) {
        const loadedStats = await statsRes.json();
        setStats(loadedStats);
      }

      // Articles still use localStorage for now
      // TODO: Migrate articles to database
      const loadedArticles: Article[] = []; // Placeholder
      setArticles(loadedArticles);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => {
    loadData().then(() => setIsLoading(false));
  }, []);

  // Sort articles by updatedAt descending
  const sortedArticles = [...articles].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleAddQuestion = () => {
    router.push("/submit");
  };

  const handleExportExcel = () => {
    if (!submissions.length) return;
    const wb = XLSX.utils.book_new();
    const data = [
      ["מקור (אופציונלי)", "קטגוריה", "שאלה", "תשובה"],
      ...submissions.map((s) => [
        s.source || "",
        s.category,
        s.question,
        s.answer,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "שאלות ותשובות");
    const today = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `שאלות-ותשובות-${today}.xlsx`);
    
    // Send notification (fire-and-forget)
    notifyExport(submissions.length, user?.primaryEmailAddress?.emailAddress);
  };

  const handleCreateArticle = () => {
    if (selectedIds.size < 2) return;

    // Show premium upsell modal
    setShowPremiumModal(true);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleViewSubmission = (submission: Submission) => {
    setViewingSubmission(submission);
  };

  const handleDeleteSubmission = async (submission: Submission) => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את השאלה "${submission.question}"?`)) {
      try {
        const response = await fetch(`/api/submissions?id=${submission.id}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          await loadData();
          setViewingSubmission(null);
          // Remove from selection if selected
          if (selectedIds.has(submission.id)) {
            const newSelection = new Set(selectedIds);
            newSelection.delete(submission.id);
            setSelectedIds(newSelection);
          }
        } else {
          alert("שגיאה במחיקת השאלה");
        }
      } catch (error) {
        console.error("Error deleting submission:", error);
        alert("שגיאה במחיקת השאלה");
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (confirm(`האם למחוק ${count} שאלות?`)) {
      try {
        const ids = Array.from(selectedIds);
        const response = await fetch(`/api/submissions?ids=${ids.join(",")}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          const result = await response.json();
          setSelectedIds(new Set());
          await loadData();
          alert(`${result.count} שאלות נמחקו`);
        } else {
          alert("שגיאה במחיקת השאלות");
        }
      } catch (error) {
        console.error("Error deleting submissions:", error);
        alert("שגיאה במחיקת השאלות");
      }
    }
  };

  const handleImportComplete = async () => {
    await loadData();
  };

  const canCreateArticle = selectedIds.size >= 2;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - sticky on desktop only (md breakpoint = 768px) */}
      <header className="md:sticky md:top-0 z-50 glass border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Branding - Centered on mobile, RIGHT side on desktop (RTL) */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 py-4 sm:py-0">
              <Link href="/dashboard">
                <Image
                  src={jitLogo}
                  alt="Just In Time - Automation. Rankings. Results."
                  width={220}
                  height={70}
                  className="object-contain w-[180px] sm:w-[220px]"
                  priority
                />
              </Link>
              <span className="text-xs text-muted-foreground">
                {user?.firstName || "משתמש"}
              </span>
            </div>

            {/* Action Buttons - LEFT side in RTL */}
            {/* RTL: buttons appear left-to-right visually as: צור מאמר | ייבוא | ייצוא | הוסף שאלה */}
            <div className="flex flex-col sm:flex-row-reverse w-full sm:w-auto items-stretch sm:items-center gap-2">
              {/* Auth UI - User Button or Sign In */}
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <SignedIn>
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10 border-2 border-primary/20",
                        userButtonPopoverCard: "bg-card border border-border",
                        userButtonPopoverActionButton: "hover:bg-muted",
                        userButtonPopoverActionButtonText: "text-foreground",
                        userButtonPopoverFooter: "hidden",
                      }
                    }}
                  />
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium h-11 min-h-[44px]">
                      התחברות
                    </button>
                  </SignInButton>
                </SignedOut>
              </div>
              
              {/* Add Question Button (Primary) - rightmost visually */}
              <Button
                className="btn-primary gap-2 h-11 min-h-[44px] w-full sm:w-auto"
                onClick={handleAddQuestion}
              >
                <MessageSquarePlus className="w-4 h-4" />
                הוסף שאלה
              </Button>

              {/* Export Button */}
              <Button
                variant="outline"
                className="gap-2 h-11 min-h-[44px] w-full sm:w-auto"
                onClick={handleExportExcel}
              >
                <Download className="w-4 h-4" />
                ייצוא לאקסל
              </Button>

              {/* Knowledge Base Button (Disabled) */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        variant="outline"
                        className="gap-2 h-11 min-h-[44px] w-full sm:w-auto opacity-50 cursor-not-allowed"
                        onClick={() => setShowKnowledgeBaseModal(true)}
                        disabled
                      >
                        <Database className="w-4 h-4" />
                        מאגר ידע
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>בקרוב: חיבור ל-AI</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Import Button (Secondary) */}
              <Button
                variant="outline"
                className="gap-2 h-11 min-h-[44px] w-full sm:w-auto"
                onClick={() => setShowImportModal(true)}
              >
                <FileUp className="w-4 h-4" />
                ייבוא נתונים
              </Button>

              {/* Create Article Button (Secondary) - leftmost visually */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        variant="outline"
                        className="gap-2 h-11 min-h-[44px] w-full sm:w-auto"
                        onClick={handleCreateArticle}
                        disabled={!canCreateArticle}
                      >
                        <Layers className="w-4 h-4" />
                        צור מאמר
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!canCreateArticle && (
                    <TooltipContent>בחר לפחות 2 שאלות</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-32">
        {/* Stats */}
        <section className="stagger">
          <StatsCards
            newSubmissions={stats.newSubmissions}
            articlesInProgress={stats.articlesInProgress}
            publishedArticles={stats.publishedArticles}
          />
        </section>

        {/* Submissions Table */}
        <section className="animate-fade-in" style={{ animationDelay: "150ms" }}>
          <SubmissionsTable
            submissions={submissions}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onViewSubmission={handleViewSubmission}
            onDeleteSubmission={handleDeleteSubmission}
            onViewAllClick={() => setShowViewAllModal(true)}
          />
        </section>

        {/* Recent Articles */}
        <section className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <ArticleList articles={sortedArticles} />
        </section>
      </main>

      {/* Floating Action Bar */}
      <FloatingActionBar
        selectedCount={selectedIds.size}
        onCreateArticle={handleCreateArticle}
        onClearSelection={handleClearSelection}
        onDeleteSelected={handleDeleteSelected}
      />

      {/* View Submission Modal */}
      <ViewSubmissionModal
        submission={viewingSubmission}
        open={!!viewingSubmission}
        onClose={() => setViewingSubmission(null)}
        onEdit={() => {
          // For now, just close
          alert("עריכה - בקרוב!");
          setViewingSubmission(null);
        }}
        onDelete={handleDeleteSubmission}
      />

      {/* View All Questions Modal */}
      <ViewAllQuestionsModal
        open={showViewAllModal}
        onClose={() => setShowViewAllModal(false)}
        submissions={submissions}
      />

      {/* Import Modal */}
      <ImportModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={handleImportComplete}
      />

      {/* Knowledge Base Modal */}
      <KnowledgeBaseModal
        open={showKnowledgeBaseModal}
        onClose={() => setShowKnowledgeBaseModal(false)}
      />

      {/* Premium Upsell Modal */}
      <PremiumUpsellModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
}
