"use client";

import { Button } from "@/components/ui/button";
import { X, Layers, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionBarProps {
  selectedCount: number;
  onCreateArticle: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
}

export function FloatingActionBar({
  selectedCount,
  onCreateArticle,
  onClearSelection,
  onDeleteSelected,
}: FloatingActionBarProps) {
  const canCreateArticle = selectedCount >= 2 && selectedCount <= 7;

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4 sm:px-0 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 animate-slide-up">
      <div className="glass rounded-2xl shadow-2xl border border-border/50 px-4 sm:px-6 py-4 w-full sm:w-auto">
        {/* RTL order: נבחרו X | מחק נבחרות | צור מאמר | בטל בחירה */}
        <div className="flex flex-col sm:flex-row-reverse items-stretch sm:items-center gap-3 sm:gap-6">
          {/* Clear Selection */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="gap-2 text-muted-foreground hover:text-foreground h-11 min-h-[44px] justify-center"
          >
            <X className="h-4 w-4" />
            בטל בחירה
          </Button>

          {/* Create Article */}
          <Button
            onClick={onCreateArticle}
            disabled={!canCreateArticle}
            className={cn(
              "gap-2 h-11 min-h-[44px] justify-center",
              canCreateArticle ? "btn-primary" : "opacity-50"
            )}
          >
            <Layers className="h-4 w-4" />
            צור מאמר מהנבחרות
          </Button>

          {/* Delete Selected */}
          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteSelected}
            className="gap-2 h-11 min-h-[44px] justify-center"
          >
            <Trash2 className="h-4 w-4" />
            מחק נבחרות
          </Button>

          {/* Selected Count */}
          <div className="text-sm font-medium text-center sm:text-right">
            נבחרו{" "}
            <span className="text-primary ltr-nums">{selectedCount}</span>{" "}
            שאלות
          </div>
        </div>

        {/* Helper text for invalid selection */}
        {selectedCount === 1 && (
          <p className="text-xs text-muted-foreground text-center mt-2 hebrew-text">
            בחר לפחות 2 שאלות ליצירת מאמר
          </p>
        )}
        {selectedCount > 7 && (
          <p className="text-xs text-amber-400 text-center mt-2 hebrew-text">
            מומלץ עד 7 שאלות למאמר
          </p>
        )}
      </div>
    </div>
  );
}
