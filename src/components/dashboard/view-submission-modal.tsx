"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Submission } from "@/lib/storage";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, X } from "lucide-react";
import Image from "next/image";

interface ViewSubmissionModalProps {
  submission: Submission | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (submission: Submission) => void;
  onDelete?: (submission: Submission) => void;
}

const statusConfig = {
  new: { label: "חדש", class: "status-new" },
  in_article: { label: "שובץ למאמר", class: "status-in-article" },
  published: { label: "פורסם", class: "status-published" },
};

export function ViewSubmissionModal({
  submission,
  open,
  onClose,
  onEdit,
  onDelete,
}: ViewSubmissionModalProps) {
  if (!submission) return null;

  const status = statusConfig[submission.status];
  const createdDate = new Date(submission.createdAt);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-full max-w-[calc(100vw-24px)] h-[calc(100vh-24px)] sm:max-w-2xl sm:h-auto max-h-[90vh] overflow-y-auto p-0 [&>button]:hidden">
        {/* Custom Header with close button on LEFT (RTL) */}
        <div className="flex items-center justify-between p-6 pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
          <DialogHeader className="flex-1 text-right">
            <DialogTitle className="sr-only">צפייה בשאלה</DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* Category and Date Row */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground ltr-nums">
              {format(createdDate, "dd/MM/yyyy")}
            </span>
            <Badge variant="outline" className="text-sm">
              {submission.category}
            </Badge>
          </div>

          <Separator />

          {/* Image if exists */}
          {submission.imageUrl && (
            <div className="rounded-lg overflow-hidden border border-border">
              <Image
                src={submission.imageUrl}
                alt="תמונה מצורפת"
                width={1200}
                height={600}
                className="w-full max-h-64 object-cover"
              />
            </div>
          )}

          {/* Question */}
          <div className="space-y-2 text-right">
            <label className="text-sm font-medium text-muted-foreground block">
              שאלה:
            </label>
            <p className="text-lg font-semibold leading-relaxed">
              {submission.question}
            </p>
          </div>

          {/* Answer */}
          <div className="space-y-2 text-right">
            <label className="text-sm font-medium text-muted-foreground block">
              תשובה:
            </label>
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {submission.answer}
            </p>
          </div>

          {/* Source if exists */}
          {submission.source && (
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">מקור:</span> {submission.source}
              </p>
            </div>
          )}

          <Separator />

          {/* Footer with word count and status */}
          <div className="flex items-center justify-between">
            <Badge className={cn("text-xs border", status.class)}>
              {status.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              <span className="ltr-nums">{submission.wordCount}</span> מילים
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-4">
            {onDelete && (
              <Button
                variant="outline"
                onClick={() => onDelete(submission)}
                className="gap-2 text-destructive hover:text-destructive"
              >
                מחק
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                onClick={() => onEdit(submission)}
                className="gap-2"
              >
                ערוך
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

