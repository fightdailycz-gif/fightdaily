import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FightDaily",
  description: "Boxing & MMA round timer — alarms work alongside your music.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FightDaily",
  },
  icons: {
    icon: [
      { url: "/fightdaily-favicon.ico", sizes: "any" },
      { url: "/fightdaily-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/fightdaily-favicon.ico",
    apple: [
      { url: "/fightdaily-apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
