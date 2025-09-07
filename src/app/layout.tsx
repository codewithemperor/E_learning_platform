import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Learning Platform - CodeWithEmperor",
  description:
    "A modern E-Learning platform for managing courses, classes, and resources. Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.",
  keywords: [
    "E-Learning",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "shadcn/ui",
    "CodeWithEmperor",
    "Online Education",
  ],
  authors: [{ name: "CodeWithEmperor" }],
  openGraph: {
    title: "E-Learning Platform",
    description: "Learn smarter with the E-Learning Platform by CodeWithEmperor",
    url: "https://codewithemperor.github.io",
    siteName: "E-Learning Platform",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "E-Learning Platform",
    description: "A modern E-Learning platform built by CodeWithEmperor",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col">
            <div className="flex-1">{children}</div>

            {/* Footer */}
            <footer className="bg-black/20 text-gray-200 text-center text-xs py-2 z-10">
              Design and code by{" "}
              <span className="font-semibold">Sulaimon Yusuf Ayomide</span> —{" "}
              <span className="italic">codewithemperor</span>
            </footer>
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
