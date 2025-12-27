import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { heIL } from "@clerk/localizations";
import { dark } from "@clerk/themes";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL("https://geobase.justintime.co.il"),
  title: {
    default: "GEOBase - פלטפורמת תוכן חכם למנועי AI | Just In Time",
    template: "%s | GEOBase",
  },
  description:
    "GEOBase - פלטפורמה לניהול שאלות ותשובות ויצירת תוכן מותאם למנועי AI. אסוף תוכן מלקוחות, קבל הצעות AI חכמות, וצור מאמרים מותאמים ל-GEO.",
  keywords: [
    "GEO",
    "Generative Engine Optimization",
    "AI SEO",
    "תוכן למנועי AI",
    "שאלות ותשובות",
    "Q&A management",
    "Just In Time",
    "קידום אתרים",
    "תוכן חכם",
    "בינה מלאכותית",
  ],
  authors: [{ name: "Just In Time", url: "https://justintime.co.il" }],
  creator: "Just In Time",
  publisher: "Just In Time",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: "https://geobase.justintime.co.il",
    siteName: "GEOBase",
    title: "GEOBase - פלטפורמת תוכן חכם למנועי AI",
    description:
      "פלטפורמה לניהול שאלות ותשובות ויצירת תוכן מותאם למנועי AI. אסוף תוכן מלקוחות, קבל הצעות AI חכמות.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GEOBase - פלטפורמת תוכן חכם למנועי AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GEOBase - פלטפורמת תוכן חכם למנועי AI",
    description:
      "פלטפורמה לניהול שאלות ותשובות ויצירת תוכן מותאם למנועי AI.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://geobase.justintime.co.il",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://geobase.justintime.co.il/#website",
        url: "https://geobase.justintime.co.il",
        name: "GEOBase",
        description: "פלטפורמת תוכן חכם למנועי AI",
        publisher: {
          "@id": "https://geobase.justintime.co.il/#organization",
        },
        inLanguage: "he-IL",
      },
      {
        "@type": "Organization",
        "@id": "https://geobase.justintime.co.il/#organization",
        name: "Just In Time",
        url: "https://justintime.co.il",
        logo: {
          "@type": "ImageObject",
          url: "https://geobase.justintime.co.il/logo.png",
          width: 512,
          height: 512,
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+972-50-787-7165",
          contactType: "customer service",
          areaServed: "IL",
          availableLanguage: ["Hebrew", "English"],
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: "יגאל אלון 123",
          addressLocality: "תל אביב",
          addressCountry: "IL",
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://geobase.justintime.co.il/#application",
        name: "GEOBase",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description:
          "פלטפורמה לניהול שאלות ותשובות ויצירת תוכן מותאם למנועי AI",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "ILS",
        },
        creator: {
          "@id": "https://geobase.justintime.co.il/#organization",
        },
      },
    ],
  };

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
        <head>
          <meta name="theme-color" content="#22c55e" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          {/* Google Analytics */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-0HCYPYX3LJ"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-0HCYPYX3LJ');
            `}
          </Script>
        </head>
        <body className="font-heebo antialiased min-h-screen bg-background">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
