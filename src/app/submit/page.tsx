"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Categories and submissions now use database via API
import { AISuggestions } from "@/components/dashboard/ai-suggestions";
import { CategoryManagementModal } from "@/components/dashboard/category-management-modal";
import { notifyNewQuestion } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { Upload, Send, Check, Plus, X, Sparkles, ArrowRight, Wand2, Loader2, Settings } from "lucide-react";
import Image from "next/image";
import jitLogo from "@/../public/Just In Time logo-version-3.png";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function SubmitPage() {
  const { user } = useUser();
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
    source: "",
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Seed default categories if needed
        await fetch("/api/categories", { method: "PUT" });
        
        // Fetch categories
        const response = await fetch("/api/categories?namesOnly=true");
        if (response.ok) {
          const categoryNames = await response.json();
          setCategories(categoryNames);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
  }, []);

  // Refresh categories when modal closes
  const handleCategoriesChange = async () => {
    try {
      const response = await fetch("/api/categories?namesOnly=true");
      if (response.ok) {
        const categoryNames = await response.json();
        setCategories(categoryNames);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  // Word count calculation
  const wordCount = formData.answer.trim().split(/\s+/).filter(Boolean).length;
  const wordCountStatus =
    wordCount === 0
      ? "empty"
      : wordCount < 100
      ? "warning"
      : wordCount > 200
      ? "error"
      : "good";

  // Handle image upload
  const handleImageChange = (file: File | null) => {
    setFormData({ ...formData, image: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageChange(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || !formData.answer || !formData.category) return;

    setIsSubmitting(true);

    try {
      // Save to database
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: formData.question,
          answer: formData.answer,
          categoryName: formData.category, // Use categoryName for backward compatibility
          source: formData.source || undefined,
          imageUrl: imagePreview || undefined,
          wordCount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save submission");
      }

      // Send notification (fire-and-forget)
      notifyNewQuestion(
        formData.question,
        formData.category,
        user?.primaryEmailAddress?.emailAddress
      );

      setIsSubmitting(false);
      setShowSuccess(true);
      setTodayCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error submitting:", error);
      alert("שגיאה בשמירת השאלה. נסה שנית.");
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      question: "",
      answer: "",
      category: formData.category, // Keep category
      source: "",
      image: null,
    });
    setImagePreview(null);
    setShowSuccess(false);
  };

  // Handle AI suggestion selection
  const handleSelectSuggestion = (suggestion: string) => {
    setFormData({ ...formData, question: suggestion });
  };

  // Handle AI answer generation
  const handleSuggestAnswer = async () => {
    if (!formData.question || !formData.category) {
      alert("יש להזין שאלה ולבחור קטגוריה לפני הצעת תשובה");
      return;
    }
    
    setIsGeneratingAnswer(true);
    try {
      const response = await fetch("/api/suggest-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: formData.question,
          category: formData.category
        })
      });
      
      const data = await response.json();
      if (data.answer) {
        setFormData(prev => ({ ...prev, answer: data.answer }));
      } else {
        throw new Error("No answer received");
      }
    } catch (error) {
      console.error("Failed to generate answer:", error);
      alert("שגיאה ביצירת תשובה. נסה שנית.");
    } finally {
      setIsGeneratingAnswer(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card/50">
      {/* Header - sticky on desktop only (md breakpoint = 768px) */}
      <header className="md:sticky md:top-0 z-50 glass border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
{/* Logo - Centered on mobile, RIGHT on desktop (RTL) */}
<div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 py-4 sm:py-0">
  <Link href="/dashboard" className="cursor-pointer">
    <Image
      src={jitLogo}
      alt="Just In Time - Automation. Rankings. Results."
      width={220}
      height={70}
      className="object-contain w-[180px] sm:w-[220px] hover:opacity-80 transition-opacity"
      priority
    />
  </Link>
  <span className="text-xs text-muted-foreground">{user?.firstName || "משתמש"}</span>
</div>
            {/* Back to Dashboard - LEFT in RTL */}
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2 h-10 min-h-[44px]">
                <ArrowRight className="w-4 h-4" />
                חזרה לדאשבורד
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="text-center animate-scale-in">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Check className="w-10 h-10 text-primary animate-checkmark" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              נשלח בהצלחה!
            </h2>
            <p className="text-muted-foreground mb-6 hebrew-text">השאלה נוספה למאגר</p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/dashboard">
                <Button variant="outline" className="gap-2">
                  <ArrowRight className="w-4 h-4" />
                  לדאשבורד
                </Button>
              </Link>
              <Button onClick={resetForm} className="btn-primary gap-2">
                <Plus className="w-5 h-5" />
                הוסף שאלה נוספת
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Today's count badge */}
        {todayCount > 0 && (
          <div className="text-center mb-6 animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              הגשת {todayCount} שאלות היום
            </span>
          </div>
        )}

        <Card className="border-border/50 shadow-xl">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="category" className="text-base font-medium text-right">
                    קטגוריה *
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                  >
                    <Settings className="w-4 h-4" />
                    ניהול קטגוריות
                  </button>
                </div>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="h-12 text-base text-right" dir="rtl">
                    <SelectValue placeholder="בחר קטגוריה" />
                  </SelectTrigger>
                  <SelectContent dir="rtl" className="text-right">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-base text-right" dir="rtl">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Question */}
              <div className="space-y-2">
                <Label htmlFor="question" className="text-base font-medium text-right">
                  השאלה *
                </Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  placeholder="הזן את נושא השאלה כאן..."
                  className="h-12 text-base hebrew-text"
                  dir="rtl"
                  required
                />
              </div>

              {/* AI Suggestions */}
              {formData.question.length >= 10 && formData.category && (
                <div className="text-right">
                  <AISuggestions
                    question={formData.question}
                    category={formData.category}
                    onSelectSuggestion={handleSelectSuggestion}
                  />
                </div>
              )}

{/* Answer */}
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <div className="text-right flex items-center gap-2">
      <Label htmlFor="answer" className="text-base font-medium text-right">
        התשובה *
      </Label>
      {formData.question && formData.category && (
        <button
          type="button"
          onClick={handleSuggestAnswer}
          disabled={isGeneratingAnswer || !formData.question || !formData.category}
          className="text-sm text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          {isGeneratingAnswer ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              יוצר תשובה...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              הצע תשובה עם AI
            </>
          )}
        </button>
      )}
      <p className="text-xs text-muted-foreground mt-0.5 hebrew-text text-right">
        מומלץ 100-200 מילים
      </p>
    </div>
    <span
      className={cn(
        "text-sm font-medium ltr-nums tabular-nums",
        wordCountStatus === "empty" && "text-muted-foreground",
        wordCountStatus === "warning" && "text-amber-400",
        wordCountStatus === "good" && "text-primary",
        wordCountStatus === "error" && "text-red-400"
      )}
    >
      {wordCount}/150 מילים
    </span>
  </div>
  
  {/* Coming Soon Notice */}
  <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md border border-border/50 text-right">
    💡 <span className="font-medium">בקרוב:</span> התשובות יותאמו אוטומטית לעסק שלך על בסיס המידע שתעלה למאגר הידע
  </p>
  
  <Textarea
    id="answer"
    value={formData.answer}
    onChange={(e) =>
      setFormData({ ...formData, answer: e.target.value })
    }
    placeholder="כתוב את התשובה המלאה..."
    className={cn(
      "min-h-[160px] text-base resize-none hebrew-text",
      wordCountStatus === "error" &&
        "border-red-500 focus-visible:ring-red-500"
    )}
    dir="rtl"
    required
  />
  {wordCountStatus === "warning" && (
    <p className="text-sm text-amber-400 hebrew-text text-right">
      מומלץ לכתוב לפחות 100 מילים
    </p>
  )}
  {wordCountStatus === "error" && (
    <p className="text-sm text-red-400 hebrew-text text-right">
      התשובה ארוכה מדי - נסה לקצר ל-200 מילים
    </p>
  )}
</div>

              {/* Image Upload */}
              <div className="space-y-2">
                <div className="text-right">
                  <Label className="text-base font-medium text-right">
                    תמונה (אופציונלי)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5 hebrew-text text-right">
                    תמונה תוצג בראש התשובה
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 hebrew-text text-right">
                    מומלץ להעלות תמונה רחבה בפורמט פנורמי (2560x1080 או רחב יותר)
                  </p>
                </div>
                <div
                  className={cn(
                    "relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer",
                    imagePreview
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-card"
                  )}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                >
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageChange(e.target.files?.[0] || null)
                    }
                  />

                  {imagePreview ? (
                    <div className="relative">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={800}
                        height={600}
                        className="max-h-48 mx-auto rounded-lg w-auto h-auto object-contain"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 left-2 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageChange(null);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground hebrew-text">
                        גרור תמונה או לחץ לבחירה
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Source */}
              <div className="space-y-2">
                <div className="text-right">
                  <Label htmlFor="source" className="text-base font-medium text-right">
                    מקור (אופציונלי)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5 hebrew-text text-right">
                    לדוגמה: שיחה עם דני, 5.12.24
                  </p>
                </div>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                  placeholder="מתוך שיחה עם..."
                  className="h-12 text-base hebrew-text"
                  dir="rtl"
                />
              </div>

              {/* Submit Button - icon on LEFT (before text visually in RTL) */}
              <Button
                type="submit"
                className="w-full h-14 text-lg btn-primary gap-2"
                disabled={
                  isSubmitting ||
                  !formData.question ||
                  !formData.answer ||
                  !formData.category
                }
              >
                {isSubmitting ? (
                  <>
                    שולח...
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    שלח שאלה
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            מופעל על ידי{" "}
            <span className="font-semibold text-foreground">Just In Time</span>
            {" "}• GEOBase
          </p>
        </footer>
      </main>

      {/* Category Management Modal */}
      <CategoryManagementModal
        open={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCategoriesChange={handleCategoriesChange}
      />
    </div>
  );
}
