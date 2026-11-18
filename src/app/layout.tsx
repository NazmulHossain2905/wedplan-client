import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { Geist, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WedPlan — Your dream wedding, beautifully planned",
    template: "%s | WedPlan",
  },
  description:
    "WedPlan is a wedding planning platform where couples discover trusted wedding professionals, explore beautiful venues, and request bookings — all in one place.",
  keywords: [
    "wedding planning",
    "wedding vendors",
    "wedding services",
    "photography",
    "venues",
    "catering",
    "bridal makeup",
  ],
  openGraph: {
    title: "WedPlan — Your dream wedding, beautifully planned",
    description:
      "Discover trusted wedding professionals, explore beautiful venues, and request bookings — all in one place.",
    type: "website",
    siteName: "WedPlan",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", geist.variable)}
    >
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
