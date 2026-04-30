import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionWrapper from "@/components/SessionWrapper";

export const metadata: Metadata = {
  title: {
    template: "%s | Clean Bharat",
    default: "Clean Bharat – Community Issue Reporter",
  },
  description:
    "Spot a problem in your city? Report it on Clean Bharat and help your community make it right. Community-powered civic reporting for a cleaner, better India.",
  keywords: ["city", "issue", "report", "community", "civic", "clean bharat", "urban", "india"],
  authors: [{ name: "Clean Bharat" }],
  openGraph: {
    title: "Clean Bharat – Community Issue Reporter",
    description:
      "Spot a problem in your city? Report it on Clean Bharat and help your community make it right.",
    type: "website",
    siteName: "Clean Bharat",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clean Bharat – Community Issue Reporter",
    description: "Community-powered civic reporting for a cleaner India.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <SessionWrapper>
          <Navbar />
          <div className="page-wrapper">
            {children}
          </div>
          <Footer />
        </SessionWrapper>
      </body>
    </html>
  );
}