import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";

const display = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"]
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"]
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://tableflow.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "TableFlow | Restaurant Guest Experience and Customer Retention",
    template: "%s | TableFlow"
  },
  description:
    "TableFlow helps restaurants in Rwanda improve guest experience, collect customer contacts, promote offers, and bring diners back with an interactive table-side menu.",
  keywords: [
    "restaurant software Rwanda",
    "restaurant marketing Rwanda",
    "digital menu Rwanda",
    "restaurant guest experience",
    "restaurant customer retention",
    "restaurant QR menu",
    "hospitality software Rwanda",
    "TableFlow"
  ],
  applicationName: "TableFlow",
  category: "restaurant software",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: appUrl,
    siteName: "TableFlow",
    title: "TableFlow | Help Restaurants Bring Guests Back",
    description:
      "Interactive restaurant pages, table-side menu browsing, offers, guest contact capture, and founder-friendly insights for restaurants in Rwanda.",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "TableFlow | Help Restaurants Bring Guests Back",
    description:
      "A restaurant growth tool for better guest experience, offer visibility, and customer follow-up."
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable} min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
