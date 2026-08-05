import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const sourceSerif4 = Source_Serif_4({
  variable: "--font-source-serif-4",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kamai Wholesale",
  description: "B2B commerce platform for the Indian bakery industry",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${sourceSerif4.variable} h-full antialiased`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full bg-background flex items-center justify-center m-0 p-0 text-text-primary">
        <ThemeProvider>
          <div className="w-full h-[100dvh] md:max-w-[414px] bg-background relative overflow-x-hidden overflow-y-auto kamai-scrollbar mx-auto shadow-2xl md:border-x border-border flex flex-col">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
