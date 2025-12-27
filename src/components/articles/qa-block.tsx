"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Submission } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Bold, Upload, X, GripVertical } from "lucide-react";
import Image from "next/image";

interface QABlockProps {
  submission: Submission;
  index: number;
  onUpdate: (id: string, data: Partial<Submission>) => void;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function QABlock({
  submission,
  index,
  onUpdate,
  isDragging,
  dragHandleProps,
}: QABlockProps) {
  const [question, setQuestion] = useState(submission.question);
  const [answer, setAnswer] = useState(submission.answer);
  const [imagePreview, setImagePreview] = useState<string | null>(
    submission.imageUrl || null
  );
  const answerRef = useRef<HTMLTextAreaElement>(null);

  // Word count
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  // Handle bold toggle
  const toggleBold = () => {
    const textarea = answerRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = answer.substring(start, end);

    if (selectedText) {
      // Check if already bold (wrapped in **)
      const beforeSelection = answer.substring(0, start);
      const afterSelection = answer.substring(end);

      // Simple bold toggle - in real app would use proper HTML
      const newAnswer = beforeSelection + `**${selectedText}**` + afterSelection;
      setAnswer(newAnswer);
      onUpdate(submission.id, { answer: newAnswer });
    }
  };

  // Handle image change
  const handleImageChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        setImagePreview(url);
        onUpdate(submission.id, { imageUrl: url });
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      onUpdate(submission.id, { imageUrl: undefined });
    }
  };

  // Debounced update for text fields
  useEffect(() => {
    const timer = setTimeout(() => {
      onUpdate(submission.id, { question, answer });
    }, 500);
    return () => clearTimeout(timer);
  }, [question, answer, submission.id, onUpdate]);

  return (
    <div
      className={cn(
        "group relative bg-card rounded-xl border border-border/50 overflow-hidden transition-all",
        isDragging && "opacity-50 shadow-2xl ring-2 ring-primary"
      )}
    >
      {/* Drag Handle */}
      <div
        {...dragHandleProps}
        className="absolute top-4 right-4 p-2 rounded-lg bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Q&A Number Badge */}
      <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center z-10">
        <span className="text-sm font-bold text-primary">{index + 1}</span>
      </div>

      <div className="p-6 space-y-6">
        {/* Image Section */}
        <div className="pt-8">
          {imagePreview ? (
            <div className="relative w-full max-w-md mx-auto">
              <Image
                src={imagePreview}
                alt={`תמונה עבור שאלה ${index + 1}`}
                width={800}
                height={600}
                className="w-full rounded-lg object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 left-2 h-8 w-8"
                onClick={() => handleImageChange(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full max-w-md mx-auto h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">העלה תמונה</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
              />
            </label>
          )}
        </div>

        {/* Question */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            שאלה:
          </label>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="text-lg font-bold bg-transparent border-0 border-b border-border/50 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
            placeholder="השאלה..."
          />
        </div>

        {/* Answer with Bold Toolbar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-foreground">
              תשובה:
            </label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleBold}
                className="h-8 px-2"
                title="הדגש טקסט נבחר (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground ltr-nums">
                {wordCount} מילים
              </span>
            </div>
          </div>
          <Textarea
            ref={answerRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="min-h-[120px] bg-transparent border-0 rounded-none px-0 focus-visible:ring-0 resize-none leading-relaxed"
            placeholder="התשובה..."
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === "b") {
                e.preventDefault();
                toggleBold();
              }
            }}
          />
        </div>

        {/* Source */}
        {submission.source && (
          <p className="text-sm text-muted-foreground italic">
            מקור: {submission.source}
          </p>
        )}
      </div>
    </div>
  );
}


