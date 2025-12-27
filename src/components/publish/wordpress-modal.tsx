"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Article, Submission } from "@/lib/mock-data";
import { Check, ExternalLink, Globe, Image as ImageIcon, Search, Send, FileText } from "lucide-react";
import NextImage from "next/image";

interface WordpressModalProps {
  open: boolean;
  onClose: () => void;
  article: Article;
  submissions: Submission[];
  onPublish: () => void;
}

export function WordpressModal({
  open,
  onClose,
  article,
  submissions,
  onPublish,
}: WordpressModalProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [formData, setFormData] = useState({
    wordpressUrl: "https://8200academy.com",
    category: "מאמרים",
    metaTitle: article.title,
    metaDesc: `${submissions[0]?.question || article.title} - כל התשובות והמידע שאתם צריכים על 8200academy`,
    focusKeyword: "",
  });

  const firstImage = submissions.find((s) => s.imageUrl)?.imageUrl;

  const handlePublish = async () => {
    setIsPublishing(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    console.log("Publishing to WordPress:", {
      article,
      submissions,
      ...formData,
    });

    setIsPublishing(false);
    setIsPublished(true);
    onPublish();
  };

  const handleSaveAsDraft = async () => {
    console.log("Saving as draft in WordPress:", formData);
    onClose();
  };

  if (isPublished) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <div className="flex flex-col items-center py-8 text-center animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-primary animate-checkmark" />
            </div>
            <h2 className="text-2xl font-bold mb-2">המאמר פורסם בהצלחה!</h2>
            <p className="text-muted-foreground mb-6">
              המאמר עלה לאוויר באתר 8200academy
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="gap-2"
              >
                חזור לדאשבורד
              </Button>
              <Button
                className="btn-primary gap-2"
                asChild
              >
                <a href={`${formData.wordpressUrl}/article-slug`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  צפה במאמר
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            פרסום לוורדפרס
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preview Card */}
          <div className="flex gap-4 p-4 rounded-lg bg-muted/50 border border-border/50">
            {firstImage ? (
              <NextImage
                src={firstImage}
                alt="תמונה ראשית"
                width={96}
                height={96}
                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-bold truncate">{article.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {submissions.length} שאלות ותשובות
              </p>
              <p className="text-sm text-muted-foreground ltr-nums">
                {submissions.reduce(
                  (sum, s) => sum + s.answer.split(/\s+/).filter(Boolean).length,
                  0
                )}{" "}
                מילים
              </p>
            </div>
          </div>

          <Separator />

          {/* WordPress URL */}
          <div className="space-y-2">
            <Label>כתובת WordPress</Label>
            <Input
              value={formData.wordpressUrl}
              onChange={(e) =>
                setFormData({ ...formData, wordpressUrl: e.target.value })
              }
              dir="ltr"
              className="font-mono"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>קטגוריה בוורדפרס</Label>
            <Input
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            />
          </div>

          <Separator />

          {/* SEO Fields */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              הגדרות SEO
            </h4>

            <div className="space-y-2">
              <Label>Meta Title</Label>
              <Input
                value={formData.metaTitle}
                onChange={(e) =>
                  setFormData({ ...formData, metaTitle: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground ltr-nums">
                {formData.metaTitle.length}/60 תווים
              </p>
            </div>

            <div className="space-y-2">
              <Label>Meta Description</Label>
              <Textarea
                value={formData.metaDesc}
                onChange={(e) =>
                  setFormData({ ...formData, metaDesc: e.target.value })
                }
                rows={3}
              />
              <p className="text-xs text-muted-foreground ltr-nums">
                {formData.metaDesc.length}/160 תווים
              </p>
            </div>

            <div className="space-y-2">
              <Label>מילת מפתח (Focus Keyword)</Label>
              <Input
                value={formData.focusKeyword}
                onChange={(e) =>
                  setFormData({ ...formData, focusKeyword: e.target.value })
                }
                placeholder="לדוגמה: קורס סייבר"
              />
            </div>
          </div>

          {/* Featured Image */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              תמונה ראשית
            </Label>
            <p className="text-sm text-muted-foreground">
              {firstImage
                ? "התמונה הראשונה מהמאמר תשמש כתמונה ראשית"
                : "אין תמונה במאמר - מומלץ להוסיף"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleSaveAsDraft} className="flex-1">
            שמור כטיוטה בוורדפרס
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isPublishing}
            className="btn-primary flex-1 gap-2"
          >
            {isPublishing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                מפרסם...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                פרסם עכשיו
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


