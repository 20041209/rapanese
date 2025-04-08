import type { Metadata } from "next";
import { Inter, Noto_Sans, Noto_Sans_JP, Noto_Sans_SC, Noto_Serif, Noto_Serif_JP, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const notoSans = Noto_Sans({ subsets: ["latin"], weight: ["400", "700"], display: "swap", variable: "--font-noto-sans" });
const notoSansJP = Noto_Sans_JP({ subsets: ["latin"], weight: ["400", "700"], display: "swap", variable: "--font-noto-sans-jp" });
const notoSansSC = Noto_Sans_SC({ subsets: ["latin"], weight: ["400", "700"], display: "swap", variable: "--font-noto-sans-sc" });
const notoSerif = Noto_Serif({ subsets: ["latin"], weight: ["400", "700"], display: "swap", variable: "--font-noto-serif" });
const notoSerifJP = Noto_Serif_JP({ subsets: ["latin"], weight: ["400", "700"], display: "swap", variable: "--font-noto-serif-jp" });
const notoSerifSC = Noto_Serif_SC({ subsets: ["latin"], weight: ["400", "700"], display: "swap", variable: "--font-noto-serif-sc" });

export const metadata: Metadata = {
  title: "Anime日语每日课 - 沉浸式日语学习",
  description: "通过动漫片段学习日语，每天10分钟，沉浸式体验，让日语学习更有趣、更高效",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${notoSans.variable} ${notoSansJP.variable} ${notoSansSC.variable} ${notoSerif.variable} ${notoSerifJP.variable} ${notoSerifSC.variable}`}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      </head>
      <body>
        <div className="app">
          {children}
        </div>
      </body>
    </html>
  );
}
