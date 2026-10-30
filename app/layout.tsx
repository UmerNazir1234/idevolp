import type { Metadata } from "next";
import { Gelasio, Roboto } from "next/font/google";
import "./globals.css";
const serif = Gelasio({ subsets: ["latin"], weight: ["700"], variable: "--font-serif" });
const sans = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-sans" });
export const metadata: Metadata = {
  title: "iDeveloped Skills Academy",
  description: "Youth and adult basketball and volleyball in Baton Rouge, LA.",
  icons: { icon: "/favicon.ico" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={`${serif.variable} ${sans.variable} font-sans`}>{children}</body></html>;
}
