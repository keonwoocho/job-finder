import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "커리어캠퍼스 | 대학생 맞춤 채용공고",
  description: "대학생의 관심 직무와 활동 경험을 바탕으로 인턴·신입 채용공고를 추천합니다.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
