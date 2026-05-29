import "./globals.css";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "thai"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const metadata = {
  title: "ระบบวางแผนคอนเทนต์ร้านไอที",
  description: "วางแผนคอนเทนต์จากสต็อกและเทรนด์ไอทีสำหรับร้านท้องถิ่น"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th" className={plusJakartaSans.variable}>
      <body className="font-sans antialiased">
        <Providers>
          <Toaster position="bottom-right" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
