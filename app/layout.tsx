import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "City Issue Reporter",
  description: "Report problems in your city and help make it better. Community-powered civic reporting.",
  keywords: ["city", "issue", "report", "community", "civic", "urban"],
  authors: [{ name: "City Issue Reporter" }],
  openGraph: {
    title: "City Issue Reporter",
    description: "Report problems in your city and help make it better.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}