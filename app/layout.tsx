import type { Metadata } from "next";
import { Cinzel, Playfair_Display, Crimson_Text } from "next/font/google";
import "./globals.css";

// Greek-inspired serif fonts
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const crimson = Crimson_Text({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Daily Psicho - Daily Psychology & Philosophy",
  description: "Daily insights into psychology and philosophy, inspired by ancient wisdom",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cinzel.variable} ${playfair.variable} ${crimson.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
