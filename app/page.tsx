"use client";

import { useMemo, useState } from "react";

const jobs = [
  { id: 1, company: "토스", logo: "T", tone: "blue", title: "Product Assistant (체험형 인턴)", location: "서울 강남구", type: "인턴", category: "기획·전략", tags: ["서비스 기획", "데이터 분석"], deadline: "D-5", match: 96, reason: "전공과 관심 직무가 잘 맞아요" },
  { id: 2, company: "카카오", logo: "K", tone: "yellow", title: "콘텐츠 마케팅 어시스턴트", location: "경기 성남시", type: "인턴", category: "마케팅", tags: ["SNS", "콘텐츠 제작"], deadline: "D-8", match: 92, reason: "보유 역량 3개가 일치해요" },
  { id: 3, company: "당근", logo: "당", tone: "orange", title: "UX Research Assistant", location: "서울 서초구", type: "인턴", category: "디자인", tags: ["UX 리서치", "사용자 인터뷰"], deadline: "D-12", match: 89, reason: "관심 기업과 유사한 포지션이에요" },
  { id: 4, company: "네이버웹툰", logo: "N", tone: "green", title: "글로벌 서비스 운영 인턴", location: "경기 성남시", type: "인턴", category: "기획·전략", tags: ["서비스 운영", "영어"], deadline: "D-14", match: 87, reason: "희망 산업과 활동 경험이 맞아요" },
  { id: 5, company: "무신사", logo: "M", tone: "black", title: "브랜드 마케팅 인턴", location: "서울 성동구", type: "인턴", category: "마케팅", tags: ["패션", "캠페인"], deadline: "D-17", match: 84, reason: "관심 키워드 2개가 일치해요" },
  { id: 6, company: "오늘의집", logo: "집", tone: "sky", title: "Frontend Engineer Intern", location: "서울 서초구", type: "인턴", category: "개발", tags: ["React", "TypeScript"], deadline: "D-20", match: 82, reason: "프로젝트 기술 스택이 일치해요" },
];

const categories = ["전체", "기획·전략", "마케팅", "개발", "디자인"];

export default function Home() {
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<number[]>([2, 4]);
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return jobs.filter((job) => (category === "전체" || job.category === category) && (!keyword || [job.company, job.title, ...job.tags].join(" ").toLowerCase().includes(keyword)));
  }, [category, query]);
  const toggleSaved = (id: number) => setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="커리어캠퍼스 홈"><span className="brandMark">C</span><span>커리어캠퍼스</span></a>
        <nav aria-label="주요 메뉴"><a className="active" href="#jobs">채용공고</a><a href="#career">커리어</a><a href="#activity">대외활동</a></nav>
        <div className="headerActions"><button className="iconButton" aria-label="알림">●<span className="notificationDot" /></button><button className="profile"><span>김</span>김대학생</button></div>
      </header>

      <section className="hero" id="top">
        <div className="heroCopy">
          <p className="eyebrow">나를 위한 커리어 시작</p>
          <h1>첫 커리어,<br /><em>딱 맞는 기회</em>부터.</h1>
          <p className="heroText">관심 직무와 활동 경험을 바탕으로<br />지금 지원하면 좋은 공고를 골라드려요.</p>
          <div className="searchBox"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="기업, 직무, 키워드로 검색" aria-label="채용공고 검색" /><button type="button">검색</button></div>
          <div className="popular"><b>인기 검색어</b><button onClick={() => setQuery("마케팅")}>#마케팅 인턴</button><button onClick={() => setQuery("서비스 기획")}>#서비스 기획</button><button onClick={() => setQuery("React")}>#프론트엔드</button></div>
        </div>
        <div className="heroVisual" aria-label="추천 매칭 현황">
          <div className="orbit orbitOne" /><div className="orbit orbitTwo" />
          <div className="floatingCard cardKakao"><span className="miniLogo yellow">K</span><div><b>카카오</b><small>마케팅 인턴</small></div><strong>92%</strong></div>
          <div className="floatingCard cardToss"><span className="miniLogo blue">T</span><div><b>토스</b><small>Product Assistant</small></div><strong>96%</strong></div>
          <div className="matchCenter"><span>✦</span><strong>나와 잘 맞는<br />공고를 발견했어요</strong><small>AI 추천 매칭</small></div>
          <span className="spark sparkOne">✦</span><span className="spark sparkTwo">✦</span>
        </div>
      </section>

      <div className="pageGrid" id="jobs">
        <section className="jobSection">
          <div className="sectionHeading"><div><p className="eyebrow">FOR YOU</p><h2>김대학생님을 위한 추천 공고</h2><p>프로필을 바탕으로 잘 맞는 공고를 모았어요.</p></div><button className="sortButton">추천순⌄</button></div>
          <div className="categoryTabs" role="group" aria-label="직무 필터">{categories.map((item) => <button key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
          <div className="jobList" aria-live="polite">
            {filtered.map((job) => (
              <article className="jobCard" key={job.id}>
                <div className={`companyLogo ${job.tone}`}>{job.logo}</div>
                <div className="jobMain"><div className="companyName">{job.company}<span className="verified">✓</span></div><h3>{job.title}</h3><p className="jobMeta"><span>⌖ {job.location}</span><span>◷ {job.type}</span></p><div className="tags">{job.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
                <div className="jobSide"><button className={`bookmark ${saved.includes(job.id) ? "saved" : ""}`} onClick={() => toggleSaved(job.id)} aria-label={`${job.company} 공고 ${saved.includes(job.id) ? "저장 취소" : "저장"}`}>{saved.includes(job.id) ? "♥" : "♡"}</button><span className="deadline">{job.deadline}</span><div className="match"><b>{job.match}%</b><span>매칭</span></div><small>{job.reason}</small></div>
              </article>
            ))}
            {filtered.length === 0 && <div className="emptyState"><b>검색 결과가 없어요.</b><span>다른 키워드나 직무를 선택해 보세요.</span></div>}
          </div>
        </section>

        <aside>
          <section className="statusCard" id="career"><div className="asideTitle"><h3>나의 지원 현황</h3><button>전체보기 ›</button></div><div className="statusGrid"><div><strong>3</strong><span>지원 완료</span></div><div><strong>1</strong><span>서류 통과</span></div><div><strong>{saved.length}</strong><span>관심 공고</span></div></div><div className="progressLabel"><span>이번 달 목표</span><b>3 / 5개 지원</b></div><div className="progress"><span /></div></section>
          <section className="profileCard"><span className="profileIcon">↗</span><p className="eyebrow">추천 정확도 높이기</p><h3>프로필을 2가지만<br />더 채워주세요!</h3><p>희망 직무와 보유 스킬을 추가하면<br />더 잘 맞는 공고를 추천해 드려요.</p><button>프로필 완성하기 <span>→</span></button></section>
          <section className="activityCard" id="activity"><div className="asideTitle"><h3>요즘 인기 대외활동</h3><button>더보기 ›</button></div><a href="#activity"><span className="activityIcon coral">A</span><div><b>대학생 마케팅 서포터즈</b><small>아모레퍼시픽 · D-9</small></div></a><a href="#activity"><span className="activityIcon navy">S</span><div><b>소셜벤처 아이디어톤</b><small>서울창업허브 · D-13</small></div></a></section>
        </aside>
      </div>
      <footer><div className="brand"><span className="brandMark">C</span><span>커리어캠퍼스</span></div><p>대학생의 가능성과 좋은 기회를 연결합니다.</p><span>© 2026 Career Campus</span></footer>
    </main>
  );
}
