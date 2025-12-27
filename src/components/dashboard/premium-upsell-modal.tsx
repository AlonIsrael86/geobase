"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, X, Crown, Loader2 } from "lucide-react";

interface PremiumUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumUpsellModal({
  isOpen,
  onClose,
}: PremiumUpsellModalProps) {
  const [showContactForm, setShowContactForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "96913552-b611-44f9-ae64-d966b7870c9c",
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          subject: "שדרוג לפרימיום - GEOBase",
          from_name: "GEOBase Premium Upgrade",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          onClose();
          setShowContactForm(false);
          setSubmitSuccess(false);
          setFormData({ name: "", email: "", phone: "", message: "" });
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowContactForm(false);
    setSubmitSuccess(false);
    setFormData({ name: "", email: "", phone: "", message: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className="relative z-10 w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">שדרג לפרימיום</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 rounded-full hover:bg-white/30 transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Icon and Description */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">יצירת מאמרים - תכונה פרימיום</h3>
            <p className="text-sm text-muted-foreground">
              שדרג לחשבון פרימיום כדי ליצור מאמרים מקצועיים משאלות ותשובות
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 text-right">
              <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">יצירת מאמרים אוטומטית</p>
                <p className="text-xs text-muted-foreground">
                  בחר מספר שאלות וצור מאמר מקצועי עם AI
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 text-right">
              <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">עריכה מתקדמת</p>
                <p className="text-xs text-muted-foreground">
                  כלי עריכה מקצועיים למיטוב התוכן
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 text-right">
              <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">פרסום ל-WordPress (בקרוב)</p>
                <p className="text-xs text-muted-foreground">
                  פרסום ישיר לבלוג או אתר WordPress
                </p>
              </div>
            </div>
          </div>

          {/* Buttons or Form */}
          {!showContactForm ? (
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                אולי מאוחר יותר
              </Button>
              <Button
                onClick={() => setShowContactForm(true)}
                className="flex-1 btn-primary gap-2"
              >
                <Crown className="w-4 h-4" />
                שדרג עכשיו
              </Button>
            </div>
          ) : (
            <div className="space-y-4 pt-2 border-t border-border">
              {submitSuccess ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-primary">
                    נשלח בהצלחה! נחזור אליך בהקדם.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div className="space-y-2 text-right">
                    <Label htmlFor="name">שם מלא *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="השם שלך"
                      required
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label htmlFor="email">אימייל *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label htmlFor="phone">טלפון</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="050-000-0000"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label htmlFor="message">הודעה</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="ספר לנו על הצרכים שלך..."
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowContactForm(false);
                        setFormData({ name: "", email: "", phone: "", message: "" });
                      }}
                      className="flex-1"
                    >
                      חזור
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 btn-primary gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          שולח...
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4" />
                          שלח בקשה
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
