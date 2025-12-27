"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Submission } from "@/lib/storage";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { X, Search, MessageSquare } from "lucide-react";

interface ViewAllQuestionsModalProps {
  open: boolean;
  onClose: () => void;
  submissions: Submission[];
}

const statusConfig = {
  new: { label: "חדש", class: "status-new" },
  in_article: { label: "שובץ למאמר", class: "status-in-article" },
  published: { label: "פורסם", class: "status-published" },
};

export function ViewAllQuestionsModal({
  open,
  onClose,
  submissions,
}: ViewAllQuestionsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      if (open) {
        try {
          const response = await fetch("/api/categories?namesOnly=true");
          if (response.ok) {
            const categoryNames = await response.json();
            setCategories(categoryNames);
          }
        } catch (error) {
          console.error("Error loading categories:", error);
        }
      }
    };
    loadCategories();
  }, [open]);

  // Filter submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchesSearch =
        searchQuery === "" ||
        sub.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || sub.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [submissions, searchQuery, categoryFilter]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-full max-w-[calc(100vw-24px)] h-[calc(100vh-24px)] sm:max-w-4xl sm:h-auto max-h-[90vh] p-0 [&>button]:hidden" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
          <DialogHeader className="flex-1 text-center">
            <DialogTitle className="flex items-center justify-center gap-2 text-xl">
              כל השאלות והתשובות
              <MessageSquare className="h-5 w-5 text-primary" />
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Count */}
            <div className="text-sm text-muted-foreground">
              מציג{" "}
              <span className="font-medium text-foreground ltr-nums">
                {filteredSubmissions.length}
              </span>{" "}
              מתוך{" "}
              <span className="font-medium text-foreground ltr-nums">
                {submissions.length}
              </span>{" "}
              שאלות
            </div>

            {/* Search and Category Filter */}
            <div className="flex gap-2 w-full sm:w-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
  <SelectTrigger className="w-40 text-right" dir="rtl">
    <SelectValue placeholder="קטגוריה" />
  </SelectTrigger>
  <SelectContent dir="rtl">
    <SelectItem value="all" className="text-right">כל הקטגוריות</SelectItem>
    {categories.map((cat) => (
      <SelectItem key={cat} value={cat} className="text-right">
        {cat}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="חיפוש..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 text-right"
                  dir="rtl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <ScrollArea className="h-[60vh] px-6 py-4">
          {filteredSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
              <p className="hebrew-text">לא נמצאו שאלות</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => {
                const status = statusConfig[submission.status];
                return (
                  <Card
                    key={submission.id}
                    className="border-border/50 hover:border-primary/30 transition-colors"
                  >
<CardContent className="p-5" dir="rtl">
  {/* Header Row */}
  <div className="flex items-center justify-between mb-3 flex-row-reverse">
    <Badge variant="outline" className="text-xs">
      {submission.category}
    </Badge>
    <div className="flex items-center gap-2">
      <Badge
        className={cn("text-xs border", status.class)}
      >
        {status.label}
      </Badge>
      <span className="text-sm text-muted-foreground ltr-nums">
        {format(new Date(submission.createdAt), "dd/MM/yyyy", {
          locale: he,
        })}
      </span>
    </div>
  </div>

  {/* Question */}
  <div className="mb-3">
    <label className="text-xs font-medium text-muted-foreground mb-1 block text-right">
      שאלה:
    </label>
    <p className="font-semibold text-lg hebrew-text text-right" dir="rtl">
      {submission.question}
    </p>
  </div>

  {/* Answer */}
  <div className="mb-3">
    <label className="text-xs font-medium text-muted-foreground mb-1 block text-right">
      תשובה:
    </label>
    <p
      className="text-base leading-relaxed whitespace-pre-wrap hebrew-text text-right"
      dir="rtl"
    >
      {submission.answer}
    </p>
  </div>

  {/* Footer */}
  <div className="flex items-center justify-between pt-3 border-t border-border/50 flex-row-reverse">
    <span className="text-sm text-muted-foreground">
      <span className="ltr-nums">{submission.wordCount}</span>{" "}
      מילים
    </span>
    {submission.source && (
      <span className="text-sm text-muted-foreground hebrew-text">
        מקור: {submission.source}
      </span>
    )}
  </div>
</CardContent>

                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

