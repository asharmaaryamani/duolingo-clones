import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Duo Clone — Learn Spanish for free",
  description: "A functional clone of Duolingo's lesson loop and gamification mechanics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  );
}
