import type { Metadata } from "next";
import { Open_Sans, Montserrat } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import ConditionalFooter from "@/components/ConditionalFooter";
import ConvexProviderWrapper from "@/components/ConvexProvider";
import InngestProvider from "@/components/InngestProvider";
import TRPCProvider from "@/components/TRPCProvider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PWAServiceWorker, PWAInstallPrompt, RequestNotificationPermission } from "@/components/PWA";
import { PushNotificationManager, InstallPromptIOS } from "@/components/PushNotifications";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "MohallaMart - Your Trusted Neighborhood Marketplace",
    template: "%s | MohallaMart",
  },
  description:
    "MohallaMart connects you with local neighborhood shops for fast, reliable delivery of groceries, essentials, and more. Support local businesses and enjoy quick commerce convenience.",
  keywords: [
    "neighborhood marketplace",
    "grocery delivery",
    "quick commerce",
    "local shops",
    "online shopping",
    "daily essentials",
    "MohallaMart",
    "India",
    "hyperlocal delivery",
  ],
  authors: [{ name: "MohallaMart Team" }],
  creator: "MohallaMart",
  publisher: "MohallaMart",
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MohallaMart",
  },
  formatDetection: {
    telephone: true,
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mohalla.vercel.app",
    title: "MohallaMart - Your Trusted Neighborhood Marketplace",
    description:
      "Shop from your favorite local stores online. Get groceries, daily needs, and more delivered to your doorstep quickly and reliably.",
    siteName: "MohallaMart",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MohallaMart - Neighborhood Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MohallaMart - Your Trusted Neighborhood Marketplace",
    description:
      "Support local businesses and get fast delivery of daily essentials with MohallaMart.",
    images: ["/og-image.jpg"],
    creator: "@mohallamart",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    shortcut: "/favicon.ico",
  },
  metadataBase: new URL("https://mohalla.vercel.app"),
  alternates: {
    canonical: "/",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MohallaMart" />
        <meta name="theme-color" content="#10b981" />
        <meta name="color-scheme" content="light" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="MohallaMart" />
        
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        
        <link rel="manifest" href="/manifest.json" />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var html = document.documentElement;
                  html.classList.remove('dark');
                  localStorage.setItem('theme-preference', 'light');
                } catch (e) {
                  console.error('Theme initialization error:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${openSans.variable} ${montserrat.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <PWAServiceWorker />
        <RequestNotificationPermission />
        <ThemeProvider defaultTheme="light" storageKey="theme-preference">
          <TRPCProvider>
            <ConvexProviderWrapper>
              <InngestProvider>
                <ConditionalNavbar />
                <main className="pt-[184px] lg:pt-0">{children}</main>
                <ConditionalFooter />
                <Toaster />
                <PWAInstallPrompt />
                <InstallPromptIOS />
              </InngestProvider>
            </ConvexProviderWrapper>
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
