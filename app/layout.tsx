import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://career-campus-student-jobs.workspace-162376.chatgpt.site"),
  title: "커리어캠퍼스 | 대학생 맞춤 채용공고",
  description: "대학생의 관심 직무와 활동 경험을 바탕으로 인턴·신입 채용공고를 추천합니다.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "커리어캠퍼스 | 첫 커리어, 딱 맞는 기회부터.",
    description: "대학생을 위한 맞춤형 인턴·신입 채용공고 추천",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "커리어캠퍼스" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "커리어캠퍼스 | 첫 커리어, 딱 맞는 기회부터.",
    description: "대학생을 위한 맞춤형 인턴·신입 채용공고 추천",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
