"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AISuggestionsProps {
  question: string;
  category: string;
  onSelectSuggestion?: (suggestion: string) => void;
  className?: string;
}

export function AISuggestions({
  question,
  category,
  onSelectSuggestion,
  className,
}: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchSuggestions = async () => {
    if (!question.trim()) {
      setError("יש להזין שאלה תחילה");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuggestions([]);
    setIsExpanded(true);

    try {
      const response = await fetch("/api/suggest-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, category }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch {
      setError("שגיאה בקבלת הצעות. נסה שוב מאוחר יותר.");
    }

    setIsLoading(false);
  };

  if (!isExpanded) {
    return (
      <div className="flex flex-col items-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={fetchSuggestions}
          disabled={!question.trim()}
          className={cn("gap-2", className)}
        >
          <Sparkles className="h-4 w-4" />
          הצע שאלות דומות
        </Button>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Gemini 3.0 Flash
        </span>
      </div>
    );
  }

  return (
    <Card className={cn("border-primary/30 bg-primary/5", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              setIsExpanded(false);
              setSuggestions([]);
              setError("");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              שאלות דומות מוצעות
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Gemini 3.0 Flash
            </span>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive text-center py-4 hebrew-text">
            {error}
          </p>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors group"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/20 hover:text-white"
                  onClick={() => onSelectSuggestion?.(suggestion)}
                  title="השתמש בשאלה זו"
                >
                  <Plus className="h-4 w-4 text-primary" />
                </Button>
                <p className="text-sm flex-1 text-right hebrew-text" dir="auto">
                  {suggestion}
                </p>
              </div>
            ))}
          </div>
        )}

        {!isLoading && suggestions.length === 0 && !error && (
          <div className="text-center py-4">
            <Button
              onClick={fetchSuggestions}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              קבל הצעות
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

