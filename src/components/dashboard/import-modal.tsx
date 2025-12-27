"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
// Categories and submissions now use database via API
import { cn } from "@/lib/utils";
import { notifyImport } from "@/lib/notifications";
import { useUser } from "@clerk/nextjs";
import {
  X,
  Upload,
  FileSpreadsheet,
  Link2,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import * as XLSX from "xlsx";
import Image from "next/image";
import jitLogo from "@/../public/Just In Time logo-version-3.png";

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

interface ImportRow {
  question: string;
  answer: string;
  category: string;
  source?: string;
  isValid: boolean;
  errors: string[];
}

export function ImportModal({
  open,
  onClose,
  onImportComplete,
}: ImportModalProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("file");
  const [previewData, setPreviewData] = useState<ImportRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);

  const [categories, setCategories] = useState<string[]>([]);

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
    if (open) {
      loadCategories();
    }
  }, [open]);

  // Count words in text
  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  // Validate a row
  const validateRow = useCallback(
    (row: {
      question?: string;
      answer?: string;
      category?: string;
      source?: string;
    }): ImportRow => {
    const errors: string[] = [];
    const question = row.question?.toString().trim() || "";
    const answer = row.answer?.toString().trim() || "";
    const category = row.category?.toString().trim() || "";
    const source = row.source?.toString().trim() || undefined;

    if (!question) errors.push("שאלה חסרה");
    if (!answer) errors.push("תשובה חסרה");
    if (!category) errors.push("קטגוריה חסרה");
    if (category && !categories.includes(category)) {
      errors.push(`קטגוריה "${category}" לא קיימת`);
    }

    return {
      question,
      answer,
      category,
      source,
      isValid: errors.length === 0,
      errors,
    };
  },
  [categories]
  );

  // Parse Excel/CSV file
  const parseFile = useCallback(
    (file: File) => {
      setIsLoading(true);
      setError("");
      setPreviewData([]);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            setError("הקובץ ריק או לא בפורמט נכון");
            setIsLoading(false);
            return;
          }

          // Map Hebrew/English column names to English keys (case-insensitive)
          const columnMap: Record<string, string> = {
            שאלה: "question",
            תשובה: "answer",
            קטגוריה: "category",
            מקור: "source",
            question: "question",
            answer: "answer",
            category: "category",
            source: "source",
          };

          const mappedData = (jsonData as unknown[]).map((row) => {
            const typedRow = row as Record<string, unknown>;
            const mapped: Record<string, string> = {};
            Object.keys(typedRow).forEach((key) => {
              const normalizedKey =
                columnMap[key] ||
                columnMap[key.toLowerCase()] ||
                columnMap[key.trim()] ||
                key;
              mapped[normalizedKey] = String(typedRow[key] ?? "");
            });
            return validateRow(mapped);
          });

          setPreviewData(mappedData);
        } catch {
          setError("שגיאה בקריאת הקובץ. וודא שהקובץ בפורמט Excel או CSV");
        }
        setIsLoading(false);
      };

      reader.onerror = () => {
        setError("שגיאה בקריאת הקובץ");
        setIsLoading(false);
      };

      reader.readAsArrayBuffer(file);
    },
    [validateRow]
  );

  // Handle file drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        const validExtensions = [".xlsx", ".xls", ".csv"];
        const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
        if (!validExtensions.includes(ext)) {
          setError("פורמט קובץ לא נתמך. השתמש ב-xlsx, xls או csv");
          return;
        }
        parseFile(file);
      }
    },
    [parseFile]
  );

  // Handle file input
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        parseFile(file);
      }
    },
    [parseFile]
  );

  // Fetch Google Sheets data
  const fetchGoogleSheets = async () => {
    if (!sheetsUrl.trim()) {
      setError("יש להזין קישור לגיליון");
      return;
    }

    setIsLoading(true);
    setError("");
    setPreviewData([]);

    try {
      // Extract sheet ID from URL
      const match = sheetsUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        setError("קישור לא תקין. וודא שזה קישור ל-Google Sheets");
        setIsLoading(false);
        return;
      }

      const sheetId = match[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch sheet");
      }

      const csvText = await response.text();
      const workbook = XLSX.read(csvText, { type: "string" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        setError("הגיליון ריק או לא בפורמט נכון");
        setIsLoading(false);
        return;
      }

      // Map Hebrew/English column names to English keys (case-insensitive)
      const columnMap: Record<string, string> = {
        שאלה: "question",
        תשובה: "answer",
        קטגוריה: "category",
        מקור: "source",
        question: "question",
        answer: "answer",
        category: "category",
        source: "source",
      };

      const mappedData = (jsonData as unknown[]).map((row) => {
        const typedRow = row as Record<string, unknown>;
        const mapped: Record<string, string> = {};
        Object.keys(typedRow).forEach((key) => {
          const normalizedKey =
            columnMap[key] ||
            columnMap[key.toLowerCase()] ||
            columnMap[key.trim()] ||
            key;
          mapped[normalizedKey] = String(typedRow[key] ?? "");
        });
        return validateRow(mapped);
      });

      setPreviewData(mappedData);
    } catch {
      setError(
        "לא ניתן לטעון את הגיליון. וודא שהגיליון ציבורי או עם הרשאות צפייה"
      );
    }
    setIsLoading(false);
  };

  // Import data
  const handleImport = async () => {
    const validRows = previewData.filter((row) => row.isValid);
    if (validRows.length === 0) {
      setError("אין שורות תקינות לייבוא");
      return;
    }

    try {
      const submissions = validRows.map((row) => ({
        question: row.question,
        answer: row.answer,
        categoryName: row.category, // Use categoryName for backward compatibility
        source: row.source,
        wordCount: countWords(row.answer),
      }));

      const response = await fetch("/api/submissions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissions }),
      });

      if (!response.ok) {
        throw new Error("Failed to import submissions");
      }
      
      // Send notification (fire-and-forget)
      notifyImport(validRows.length, user?.primaryEmailAddress?.emailAddress);
      
      setImportSuccess(true);
      onImportComplete?.();

      // Reset after 2 seconds and close
      setTimeout(() => {
        resetModal();
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error importing:", error);
      setError("שגיאה בייבוא הנתונים. נסה שנית.");
    }
  };

  // Reset modal state
  const resetModal = () => {
    setPreviewData([]);
    setError("");
    setSheetsUrl("");
    setImportSuccess(false);
    setActiveTab("file");
  };

  const validCount = previewData.filter((r) => r.isValid).length;
  const invalidCount = previewData.filter((r) => !r.isValid).length;

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ["מקור (אופציונלי)", "קטגוריה", "שאלה", "תשובה"],
      [
        "שיחה עם לקוח",
        "קורס סייבר",
        "כמה זמן נמשך הקורס?",
        "הקורס נמשך 6 חודשים של לימודים אינטנסיביים...",
      ],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "geo-template.xlsx");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetModal();
          onClose();
        }
      }}
    >
<DialogContent className="w-full max-w-[calc(100vw-24px)] h-[calc(100vh-24px)] sm:max-w-3xl sm:h-auto max-h-[90vh] p-0 [&>button]:hidden" dir="rtl">
{/* Success Overlay */}
        {importSuccess && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/90 rounded-lg">
            <div className="text-center animate-scale-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">הייבוא הושלם בהצלחה!</h3>
              <p className="text-muted-foreground">
                יובאו{" "}
                <span className="text-primary font-bold ltr-nums">
                  {validCount}
                </span>{" "}
                שאלות
              </p>
            </div>
          </div>
        )}

{/* Header */}
<div className="flex items-center p-6 pb-4 border-b border-border" dir="rtl">
  <Image
    src={jitLogo}
    alt="Just In Time"
    width={120}
    height={40}
    className="object-contain flex-shrink-0"
    priority
  />
  <DialogHeader className="flex-1 text-center">
    <DialogTitle className="flex items-center justify-center gap-2 text-xl">
      <FileSpreadsheet className="h-5 w-5 text-primary" />
      ייבוא שאלות ותשובות
    </DialogTitle>
  </DialogHeader>
  <Button
    variant="ghost"
    size="icon"
    onClick={() => {
      resetModal();
      onClose();
    }}
    className="h-10 w-10 rounded-full hover:bg-white/10 flex-shrink-0"
  >
    <X className="h-5 w-5" />
  </Button>
</div>
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sheets" className="gap-2">
                <Link2 className="h-4 w-4" />
                Google Sheets
              </TabsTrigger>
              <TabsTrigger value="file" className="gap-2">
                <Upload className="h-4 w-4" />
                העלאת קובץ
              </TabsTrigger>
            </TabsList>
          </div>

          {/* File Upload Tab */}
          <TabsContent value="file" className="p-6 pt-4">
            <div className="flex justify-end mb-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={downloadTemplate}
              >
                <Upload className="h-4 w-4 rotate-180" />
                הורד תבנית
              </Button>
            </div>
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                "hover:border-primary/50 hover:bg-card/50"
              )}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileInput}
              />
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="font-medium mb-2 hebrew-text">
                גרור קובץ או לחץ לבחירה
              </p>
              <p className="text-sm text-muted-foreground hebrew-text">
                קבצים נתמכים: xlsx, xls, csv
              </p>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-muted/30 text-sm">
              <p className="font-medium mb-2 hebrew-text">עמודות נדרשות:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">שאלה *</Badge>
                <Badge variant="outline">תשובה *</Badge>
                <Badge variant="outline">קטגוריה *</Badge>
                <Badge variant="outline" className="opacity-60">
                  מקור (אופציונלי)
                </Badge>
              </div>
            </div>
          </TabsContent>

{/* Google Sheets Tab */}
<TabsContent value="sheets" className="p-6 pt-4" dir="rtl">
  <div className="flex justify-start mb-3">
    <Button
      variant="outline"
      className="gap-2"
      onClick={downloadTemplate}
    >
      <Upload className="h-4 w-4 rotate-180" />
      הורד תבנית
    </Button>
  </div>
  <div className="space-y-4">
    <div className="space-y-2">
      <Label className="text-right block">קישור לגיליון Google Sheets</Label>
      <div className="flex gap-2 flex-row-reverse">
        <Input
          placeholder="https://docs.google.com/spreadsheets/d/..."
          value={sheetsUrl}
          onChange={(e) => {
            setSheetsUrl(e.target.value);
            setError("");
          }}
          className="flex-1"
          dir="ltr"
        />
        <Button
          onClick={fetchGoogleSheets}
          disabled={isLoading || !sheetsUrl.trim()}
          className="btn-primary gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
          טען נתונים
        </Button>
      </div>
    </div>
    <div className="p-4 rounded-lg bg-muted/30 text-sm space-y-2">
      <p className="font-medium text-right">הוראות:</p>
      <div className="space-y-1 text-muted-foreground text-right">
        <p>• וודא שהגיליון ציבורי או עם הרשאות צפייה לכולם</p>
        <p>• שורת הכותרת הראשונה צריכה להכיל: שאלה, תשובה, קטגוריה</p>
        <p>• עמודת מקור היא אופציונלית</p>
      </div>
    </div>
    </div>
</TabsContent>
</Tabs>

{/* Error Message */}
        {error && (
          <div className="mx-6 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm hebrew-text">{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Preview */}
        {previewData.length > 0 && !isLoading && (
          <div className="px-6 pb-6">
            {/* Stats */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm">
                {invalidCount > 0 && (
                  <span className="text-destructive hebrew-text">
                    {invalidCount} שגיאות
                  </span>
                )}
              </div>
              <div className="text-sm hebrew-text">
                <span className="ltr-nums">{validCount}</span> שורות תקינות מתוך{" "}
                <span className="ltr-nums">{previewData.length}</span>
              </div>
            </div>

            {/* Preview Table */}
            <ScrollArea className="h-48 rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-right p-2 font-medium">סטטוס</th>
                    <th className="text-right p-2 font-medium">שאלה</th>
                    <th className="text-right p-2 font-medium">תשובה</th>
                    <th className="text-right p-2 font-medium">קטגוריה</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {previewData.slice(0, 20).map((row, index) => (
                    <tr
                      key={index}
                      className={cn(
                        !row.isValid && "bg-destructive/5"
                      )}
                    >
                      <td className="p-2">
                        {row.isValid ? (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        ) : (
                          <span className="text-xs text-destructive hebrew-text">
                            {row.errors.join(", ")}
                          </span>
                        )}
                      </td>
                      <td className="p-2 max-w-48 truncate hebrew-text" dir="auto">
                        {row.question || "-"}
                      </td>
                      <td className="p-2 max-w-48 truncate hebrew-text" dir="auto">
                        {row.answer ? `${row.answer.slice(0, 50)}...` : "-"}
                      </td>
                      <td className="p-2 hebrew-text">{row.category || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 20 && (
                <p className="text-center text-sm text-muted-foreground py-2 hebrew-text">
                  + {previewData.length - 20} שורות נוספות
                </p>
              )}
            </ScrollArea>

            {/* Import Button */}
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setPreviewData([]);
                  setError("");
                }}
              >
                נקה
              </Button>
              <Button
                onClick={handleImport}
                disabled={validCount === 0}
                className="btn-primary gap-2"
              >
                <Upload className="h-4 w-4" />
                ייבא {validCount} שאלות
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

