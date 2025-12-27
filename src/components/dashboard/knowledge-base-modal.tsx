"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Upload, Database } from "lucide-react";

interface KnowledgeBaseModalProps {
  open: boolean;
  onClose: () => void;
}

export function KnowledgeBaseModal({ open, onClose }: KnowledgeBaseModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-full max-w-[calc(100vw-24px)] h-[calc(100vh-24px)] sm:max-w-xl sm:h-auto [&_button[aria-label='Close']]:hidden">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogHeader className="flex-1 text-right">
            <DialogTitle className="flex items-center justify-end gap-2 text-xl">
              מאגר ידע
              <Database className="h-5 w-5 text-primary" />
            </DialogTitle>
          </DialogHeader>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="text">הדבקת טקסט</TabsTrigger>
            <TabsTrigger value="upload">העלאת קבצים</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/5">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">גרור קבצים לכאן</h3>
              <p className="text-sm text-muted-foreground mb-4">
                או לחץ לבחירת קבצים מהמחשב
              </p>
              <p className="text-xs text-muted-foreground">
                תומך בקבצי PDF, DOCX, TXT (עד 10MB)
              </p>
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium block text-right">
                תוכן המאגר
              </label>
              <Textarea
                placeholder="הדבק כאן טקסט חופשי, נהלים, שאלות נפוצות ועוד..."
                className="min-h-[200px] text-right resize-none"
                dir="auto"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            ביטול
          </Button>
          <Button disabled>שמור במאגר (בקרוב)</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

