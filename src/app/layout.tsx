import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { heIL } from "@clerk/localizations";
import { dark } from "@clerk/themes";

export const metadata: Metadata = {
  title: "GEOBase - פלטפורמת תוכן GEO",
  description: "מערכת לניהול שאלות ותשובות ויצירת תוכן מותאם ל-AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider 
      localization={heIL}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "hsl(142, 76%, 46%)",
        },
      }}
    >
      <html lang="he" dir="rtl" className="dark">
        <body className="font-heebo antialiased min-h-screen bg-background">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
