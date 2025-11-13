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
        className={`${openSans.variable} ${montserrat.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <TRPCProvider>
          <ConvexProviderWrapper>
            <InngestProvider>
              <ConditionalNavbar />
                <main>{children}</main>
              <ConditionalFooter />
              <Toaster />
            </InngestProvider>
          </ConvexProviderWrapper>
        </TRPCProvider>
      </body>
    </html>
  );
}
