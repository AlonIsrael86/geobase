"use client";

import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Sparkles, Globe, MapPin, Phone, Mail } from "lucide-react";
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          access_key: "96913552-b611-44f9-ae64-d966b7870c9c",
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          message: formData.get("message"),
          subject: "פנייה חדשה מ-GEOBase",
          from_name: "GEOBase Contact Form"
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsSubmitted(true);
        form.reset();
      } else {
        setError("אירעה שגיאה בשליחת ההודעה. אנא נסה שנית.");
      }
    } catch (err) {
      setError("אירעה שגיאה בשליחת ההודעה. אנא נסה שנית.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20">
        {/* Dark gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[100px] animate-pulse" />
        </div>

        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 text-center max-w-6xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/Just In Time logo-version-3.png"
              alt="Just In Time Logo"
              width={180}
              height={180}
              className="mx-auto"
              priority
            />
          </div>

          {/* Main Title */}
          <h1 className="text-5xl font-black mb-6">
            <span className="text-primary">GEOBase</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl text-muted-foreground mb-12">
            תוכן חכם למנועי AI
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <SignedOut>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-all">
                  התחברות
                </button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="border border-primary text-primary px-8 py-3 rounded-lg font-medium hover:bg-primary/10 transition-all">
                  הרשמה
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-all">
                  לוח הבקרה
                </button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            למה GEOBase?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <Card className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-0">
                <MessageSquare className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">ניהול שאלות ותשובות</h3>
                <p className="text-muted-foreground">
                  אסוף ונהל שאלות ותשובות מלקוחות בקלות
                </p>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-0">
                <Sparkles className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">הצעות AI חכמות</h3>
                <p className="text-muted-foreground">
                  קבל הצעות לשאלות ותשובות מבוססות בינה מלאכותית
                </p>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-0">
                <Globe className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">ממשק בעברית מלא</h3>
                <p className="text-muted-foreground">
                  חווית משתמש מותאמת לעברית מימין לשמאל
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">צור קשר</h2>

          <div className="max-w-md mx-auto bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
            {isSubmitted ? (
              <div className="text-primary bg-primary/10 p-4 rounded-lg text-center">
                ההודעה נשלחה בהצלחה! נחזור אליך בהקדם.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">
                    שם
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="השם שלך"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    אימייל
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    className="h-12 ltr-nums"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-foreground">
                    טלפון
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="050-000-0000"
                    className="h-12 ltr-nums"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-foreground">
                    הודעה
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    placeholder="ספר לנו במה נוכל לעזור..."
                    rows={5}
                    className="resize-none"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isLoading ? "שולח..." : "שלח הודעה"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Company Info - Right side in RTL */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                <span>יגאל אלון 123, תל אביב</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <a href="tel:050-787-7165" className="ltr-nums" dir="ltr">
                  050-787-7165
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <a href="mailto:alon.justintime@gmail.com" dir="ltr">
                  alon.justintime@gmail.com
                </a>
              </div>
            </div>

            {/* Links - Left side in RTL */}
            <div className="space-y-3">
              <Link
                href="#"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                תנאי שימוש
              </Link>
              <Link
                href="#"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                מדיניות פרטיות
              </Link>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-center text-muted-foreground text-sm">
              © Just In Time. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
