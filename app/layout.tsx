import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { WebsiteStructuredData, PersonStructuredData } from "@/components/StructuredData";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://lradev.app'),
  title: {
    default: "Backend Developer | Luca Altimare",
    template: "%s | Luca Altimare"
  },
  description: "Backend Developer specializzato in architetture IT, Python, PHP e AI Integrations. Articoli tecnici su Django, FastAPI, Clean Architecture e design patterns.",
  keywords: ["Backend Developer", "Python", "PHP", "Django", "FastAPI", "Clean Architecture", "AI", "Luca Altimare"],
  authors: [{ name: "Luca Altimare" }],
  creator: "Luca Altimare",
  publisher: "Luca Altimare",

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: 'https://lradev.app',
    siteName: 'Luca Altimare - Backend Developer',
    title: "Backend Developer | Luca Altimare",
    description: "Backend Developer specializzato in architetture IT, Python, PHP e AI Integrations",
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'Luca Altimare Logo',
      }
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: "Backend Developer | Luca Altimare",
    description: "Backend Developer specializzato in architetture IT, Python, PHP e AI Integrations",
    images: ['/icon.png'],
    creator: '@lradev',
  },

  // Icons
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', type: 'image/png' },
    ],
  },

  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LRA Portfolio",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: "#050508",

  // Verification for Google Search Console
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        <WebsiteStructuredData />
        <PersonStructuredData />
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5DVNN8BF');` }} />
        {/* End Google Tag Manager */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5DVNN8BF"
        height="0" width="0" style={{display:'none', visibility:'hidden'}}></iframe></noscript>
        {/* End Google Tag Manager (noscript) */}
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
