import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "nsp2p - Peer-to-peer ZEC trading at Network School",
  description: "Buy and sell ZEC at Network School",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-dvh bg-[#FAFAF8] text-[#1A1A1A] font-sans">
        <div className="max-w-[390px] mx-auto min-h-dvh">{children}</div>
      </body>
    </html>
  );
}
