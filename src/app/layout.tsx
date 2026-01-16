import type { Metadata } from "next";
import { Open_Sans, Montserrat } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import ConditionalFooter from "@/components/ConditionalFooter";
import ConvexProviderWrapper from "@/components/ConvexProvider";
import InngestProvider from "@/components/InngestProvider";
import TRPCProvider from "@/components/TRPCProvider";
import { Toaster } from "@/components/ui/sonner";

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
        url: "/og-image.jpg", // Ensure you have an OG image in your public folder
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
  metadataBase: new URL("https://mohalla.vercel.app"), // Replace with your actual domain
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var html = document.documentElement;
                  var originalClasses = html.className;
                  html.className = html.className.replace(/\\bchromane-[^\\s]+/g, '');
                  setTimeout(function() {
                    html.className = originalClasses;
                  }, 100);
                } catch (e) {
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
        <TRPCProvider>
          <ConvexProviderWrapper>
            <InngestProvider>
              <ConditionalNavbar />
                <main className="lg:pt-0 pt-[220px]">{children}</main>
              <ConditionalFooter />
              <Toaster />
            </InngestProvider>
          </ConvexProviderWrapper>
        </TRPCProvider>
      </body>
    </html>
  );
}
