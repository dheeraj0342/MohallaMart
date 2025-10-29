import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import ConvexProviderWrapper from "@/components/ConvexProvider";
import InngestProvider from "@/components/InngestProvider";
import TRPCProvider from "@/components/TRPCProvider";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MohallaMart - Your Trusted Neighborhood Marketplace",
  description:
    "MohallaMart is your trusted neighborhood marketplace connecting communities with quality products and reliable delivery services. Fast delivery, local partnerships, and exceptional customer service.",
  keywords: [
    "neighborhood marketplace",
    "grocery delivery",
    "quick commerce",
    "local partnerships",
    "MohallaMart",
  ],
  authors: [{ name: "MohallaMart Team" }],
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
    <html lang="en" suppressHydrationWarning>
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
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <TRPCProvider>
          <ConvexProviderWrapper>
            <InngestProvider>
              <Navbar />
              <main>{children}</main>
              <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
                <SearchBar />
              </div>
              <Footer />
            </InngestProvider>
          </ConvexProviderWrapper>
        </TRPCProvider>
      </body>
    </html>
  );
}
