"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Submission } from "@/lib/storage";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Eye, Trash2, Filter, Settings, List } from "lucide-react";
import { CategoryManagementModal } from "./category-management-modal";

interface SubmissionsTableProps {
  submissions: Submission[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onViewSubmission: (submission: Submission) => void;
  onDeleteSubmission?: (submission: Submission) => void;
  onViewAllClick?: () => void;
}

const statusConfig = {
  new: { label: "חדש", class: "status-new" },
  in_article: { label: "שובץ למאמר", class: "status-in-article" },
  published: { label: "פורסם", class: "status-published" },
};

export function SubmissionsTable({
  submissions,
  selectedIds,
  onSelectionChange,
  onViewSubmission,
  onDeleteSubmission,
  onViewAllClick,
}: SubmissionsTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
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

  // Filter submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || sub.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  // Handle selection
  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    onSelectionChange(newSelection);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredSubmissions.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(filteredSubmissions.map((s) => s.id)));
    }
  };

  return (
    <>
    <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Title and View All on RIGHT in RTL */}
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">שאלות ותשובות</CardTitle>
              {onViewAllClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onViewAllClick}
                  className="gap-2 text-primary hover:text-primary/80 hover:bg-transparent"
                >
                  <List className="h-4 w-4" />
                  צפה בכל השאלות
                </Button>
              )}
            </div>

            {/* Filters on LEFT in RTL */}
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="סטטוס" />
                  <Filter className="w-4 h-4 mr-2" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">הכל</SelectItem>
                  <SelectItem value="new">חדש</SelectItem>
                  <SelectItem value="in_article">שובץ למאמר</SelectItem>
                  <SelectItem value="published">פורסם</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter with Settings Gear */}
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setShowCategoryModal(true)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>ניהול קטגוריות</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="קטגוריה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הקטגוריות</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto" dir="rtl">
          {/* Table Header - RTL order: checkbox first (right), actions last (left) */}
          <div className="min-w-[760px] grid grid-cols-[auto,minmax(0,1fr),140px,auto,auto,auto] gap-4 px-6 py-3 border-b border-border bg-muted/30 text-sm font-medium text-muted-foreground">
            <Checkbox
              checked={
                selectedIds.size === filteredSubmissions.length &&
                filteredSubmissions.length > 0
              }
              onCheckedChange={toggleAll}
              className="sticky right-0 bg-muted/30 z-10 rounded"
            />
            <span className="text-right pr-4">שאלה</span>
            <span className="w-[140px] text-right">קטגוריה</span>
            <span>תאריך</span>
            <span>סטטוס</span>
            <span>פעולות</span>
          </div>

          {/* Table Body */}
          <ScrollArea className="h-[400px]">
            {filteredSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p className="hebrew-text">אין שאלות עדיין</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50 min-w-[760px]">
                {filteredSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className={cn(
                      "grid grid-cols-[auto,minmax(0,1fr),140px,auto,auto,auto] gap-4 px-6 py-4 items-start hover:bg-muted/30 transition-colors",
                      selectedIds.has(submission.id) && "bg-primary/5"
                    )}
                  >
                    {/* Checkbox - first column (RIGHT in RTL) */}
                    <Checkbox
                      checked={selectedIds.has(submission.id)}
                      onCheckedChange={() => toggleSelection(submission.id)}
                      className="sticky right-0 bg-background z-10 rounded"
                    />

                    {/* Question - text aligned RIGHT with proper Hebrew punctuation */}
                    <div
                      className="min-w-0 text-right cursor-pointer pr-4 space-y-1"
                      onClick={() => onViewSubmission(submission)}
                    >
                      <p className="font-medium truncate leading-snug hebrew-text text-foreground text-right" dir="auto">
                        {submission.question}
                      </p>
                      <p className="text-sm text-muted-foreground truncate leading-snug hebrew-text text-right" dir="auto">
                        {submission.answer.slice(0, 60)}...
                      </p>
                    </div>

                    {/* Category */}
                    <Badge variant="outline" className="text-xs w-[140px] justify-center whitespace-nowrap truncate">
                      {submission.category}
                    </Badge>

                    {/* Date - LTR numbers */}
                    <span className="text-sm text-muted-foreground whitespace-nowrap ltr-nums">
                      {format(new Date(submission.createdAt), "dd/MM/yyyy")}
                    </span>

                    {/* Status */}
                    <Badge
                      className={cn(
                        "text-xs border",
                        statusConfig[submission.status].class
                      )}
                    >
                      {statusConfig[submission.status].label}
                    </Badge>

                    {/* Actions - last column (LEFT in RTL) */}
                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewSubmission(submission);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>צפה בשאלה</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {onDeleteSubmission && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteSubmission(submission);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>מחק שאלה</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
      </Card>

      {/* Category Management Modal */}
      <CategoryManagementModal
        open={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCategoriesChange={handleCategoriesChange}
      />
    </>
  );
}
