import CSRFInitializer from "@/components/CSRFInitializer";
import SessionTimeoutHandler from "@/components/SessionTimeoutHandler";
import { ThemeProvider } from "@/components/ThemeProvider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIoT Chain - Ecosystem Inovasi AI & IoT",
  description: "Platform kolaborasi untuk pengembang AI dan IoT. Temukan asset 3D, blog teknologi, dan learning path terbaik.",
  keywords: ["AI", "IoT", "Robotik", "3D Asset", "Learning Path", "Inovasi"],
  authors: [{ name: "AIoT Chain Team" }],
  openGraph: {
    title: "AIoT Chain - Ecosystem Inovasi AI & IoT",
    description: "Platform kolaborasi untuk pengembang AI dan IoT.",
    url: "https://aiotchain.id",
    siteName: "AIoT Chain",
    locale: "id_ID",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AIoT Chain",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CSRFInitializer />
          <SessionTimeoutHandler />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}