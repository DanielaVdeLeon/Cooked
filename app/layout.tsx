import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ToastProvider } from "@/components/ui/Toast";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const youngSerif = localFont({
  src: "./fonts/Young-Serif-var.ttf",
  weight: "400 700",
  variable: "--font-young-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Cooked — recipe library",
    template: "%s · Cooked",
  },
  description:
    "A fast, uncluttered library of recipes collected from websites, social platforms, and personal sources. Browse, search, and cook — no account needed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${youngSerif.variable}`}>
      <body>
        <ToastProvider>
          <div className="app-shell">
            <SiteHeader />
            {children}
            <SiteFooter />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
