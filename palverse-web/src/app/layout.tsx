import type { Metadata } from "next";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteLayoutWrapper } from "@/components/layout/SiteLayoutWrapper";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const ibmPlex = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Palverse",
    default: "Palverse | اكتشف أفضل الأعمال في فلسطين",
  },
  description: "كل فلسطين في دليل واحد. اكتشف أفضل المتاجر والخدمات والعروض في فلسطين.",
};

import { PublicAuthProvider } from "@/contexts/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${cairo.variable} ${ibmPlex.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground pb-16 md:pb-0" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <PublicAuthProvider>
            <SiteLayoutWrapper 
              header={<Header />} 
              footer={<Footer />} 
              bottomNav={<BottomNav />}
            >
              {children}
            </SiteLayoutWrapper>
          </PublicAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
