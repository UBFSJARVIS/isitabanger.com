import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IsItABanger — Download Music, Support Artists",
  description:
    "Discover and download music from your favorite artists. Artists earn revenue every time fans visit their download page.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
