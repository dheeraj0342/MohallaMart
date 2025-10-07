import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MohallaMart - Your Trusted Neighborhood Marketplace",
  description: "MohallaMart is your trusted neighborhood marketplace connecting communities with quality products and reliable delivery services. Fast delivery, local partnerships, and exceptional customer service.",
  keywords: ["neighborhood marketplace", "grocery delivery", "quick commerce", "local partnerships", "MohallaMart"],
  authors: [{ name: "MohallaMart Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent hydration mismatch from browser extensions
              (function() {
                try {
                  var html = document.documentElement;
                  // Store original classes
                  var originalClasses = html.className;
                  // Remove extension-added classes temporarily
                  html.className = html.className.replace(/\\bchromane-[^\\s]+/g, '');
                  // Restore after a short delay to allow React to hydrate
                  setTimeout(function() {
                    html.className = originalClasses;
                  }, 100);
                } catch (e) {
                  // Silently handle any errors
                }
              })();
            `,
          }}
        />
      </head>
      <body 
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
