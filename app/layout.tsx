import type { Metadata } from "next";
import { Sora, Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/motion/SmoothScroll";
import CustomCursor from "@/components/motion/CustomCursor";
import ScrollProgress from "@/components/motion/ScrollProgress";
import PageTransition from "@/components/motion/PageTransition";

const sora = Sora({ variable: "--font-display", subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const manrope = Manrope({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Marketorr — We Turn Attention Into Results",
  description:
    "Marketorr is an independent creative & digital agency building brands, digital products and experiences designed for measurable growth.",
  metadataBase: new URL("https://marketorr.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#08080A] text-[#F7F7F5]">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black">
          Skip to content
        </a>
        <ScrollProgress />
        <CustomCursor />
        <SmoothScroll />
        <Header />
        <PageTransition>
          <main id="main">{children}</main>
          <Footer />
        </PageTransition>
      </body>
    </html>
  );
}
