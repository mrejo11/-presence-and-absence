import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سامانه حضور و غیاب هوشمند",
  description: "ثبت ورود و خروج و محاسبه حق شیفت کارکنان"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
