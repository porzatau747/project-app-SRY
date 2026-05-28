import "./globals.css";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";

export const metadata = {
  title: "ระบบวางแผนคอนเทนต์ร้านไอที",
  description: "วางแผนคอนเทนต์จากสต็อกและเทรนด์ไอทีสำหรับร้านท้องถิ่น"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <body>
        <Providers>
          <Toaster position="bottom-right" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
