import "./globals.css";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";
import VirtualOfficeLayout from "../components/virtual-office/VirtualOfficeLayout";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
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
      <body className="font-sans antialiased bg-gray-950">
        <Providers>
          <Toaster position="bottom-right" />
          <VirtualOfficeLayout>
            {children}
          </VirtualOfficeLayout>
        </Providers>
      </body>
    </html>
  );
}
