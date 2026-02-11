import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { VALUES } from "@/lib/values";
import { AuthProvider } from "@/lib/AuthContext";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { LayoutClient } from "@/components/LayoutClient";
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
  title: {
    default: VALUES.APP_NAME,
    template: `%s | ${VALUES.APP_NAME}`,
  },
  description: VALUES.APP_DESCRIPTION,
  keywords: [
    "sentiment analysis",
    "text analysis",
    "natural language processing",
    "NLP",
    "polarity detection",
    "opinion mining",
    "multilingual",
    "word cloud",
    "sentiment detection",
    "text sentiment",
    "AI analysis",
  ],
  authors: [
    {
      name: VALUES.APP_AUTHOR[0].name,
      url: VALUES.APP_AUTHOR[0].portfolio
    },
  ],
  creator: VALUES.APP_AUTHOR[0].name,
  publisher: VALUES.APP_AUTHOR[0].name,
  metadataBase: new URL(VALUES.APP_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: VALUES.APP_URL,
    title: VALUES.APP_NAME,
    description: VALUES.APP_DESCRIPTION,
    siteName: VALUES.APP_NAME,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${VALUES.APP_NAME} - ${VALUES.APP_SHORT_DESCRIPTION}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: VALUES.APP_NAME,
    description: VALUES.APP_DESCRIPTION,
    images: ["/og.png"],
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
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <LayoutClient>
          <AuthProvider>
            <Navbar />
            <BottomNav />
            <main className="flex-1 pt-4 md:pt-16 pb-20 md:pb-0">
              {/* Grid Pattern Background */}
              <div className="fixed inset-0 -z-50 pointer-events-none bg-black">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4489c815_2px,transparent_2px),linear-gradient(to_bottom,#4489c815_2px,transparent_2px)] bg-[size:32px_32px]" />
              </div>
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </LayoutClient>
      </body>
    </html>
  );
}