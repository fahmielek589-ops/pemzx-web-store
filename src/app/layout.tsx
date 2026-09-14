import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pemzx — Developer Portfolio",
  description:
    "Pemzx is a developer focused on building modern, responsive and high-performance digital experiences.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Pemzx — Developer Portfolio",
    description:
      "Pemzx is a developer focused on building modern, responsive and high-performance digital experiences.",
    type: "website",
    siteName: "Pemzx",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pemzx — Developer Portfolio",
    description:
      "Pemzx is a developer focused on building modern, responsive and high-performance digital experiences.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
