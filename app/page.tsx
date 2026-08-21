"use client";

import { useMemo, useState } from "react";
import jobsData from "../jobs.json";

type Job = {
  id: number;
  company: string;
  logo: string;
  tone: string;
  title: string;
  field: string;
  function: string;
  location: string;
  locationGroup: string;
  companyType: string;
  employment: string;
  experience: string;
  education: string;
  major: string;
  workMode: string;
  deadline: string;
  days: number;
  posted: number;
  tags: string[];
  match: number;
  reason: string;
};

const tones = ["navy", "red", "pink", "orange", "teal", "green"];
const daysUntil = (yyyymmdd: string) => {
  const end = new Date(Number(yyyymmdd.slice(0, 4)), Number(yyyymmdd.slice(4, 6)) - 1, Number(yyyymmdd.slice(6, 8)));
  return Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000));
};
const jobs: Job[] = jobsData.map((item, index) => {
  const text = [item.title, ...(item.ncsNames ?? [])].join(" ");
  const isFuelCell = /연료전지|수소/u.test(text);
  const isBattery = /배터리|ESS|에너지저장/u.test(text);
  const field = isFuelCell ? "연료전지" : isBattery ? "배터리·에너지저장" : "공공기관 채용";
  const fn = (item.ncsNames ?? []).join(" ");
  const jobFunction = /연구|과학/u.test(fn) ? "연구·개발" : /기계|전기|환경|건설/u.test(fn) ? "설비 운영·현장 관리" : "생산·품질·공정";
  const region = (item.workRegionNames ?? []).join(", ") || "지역 미정";
  const employment = (item.hireTypeNames ?? []).some((name) => name.includes("청년인턴")) ? "인턴" : item.recruitmentTypeName?.includes("신입") ? "신입 정규직" : (item.hireTypeNames ?? []).join(", ") || "고용형태 미정";
  const days = daysUntil(item.endDate);
  return {
    id: Number(item.recrutPblntSn),
    company: item.institutionName,
    logo: (item.institutionName || "공").slice(0, 1),
    tone: tones[index % tones.length],
    title: item.title,
    field,
    function: jobFunction,
    location: region,
    locationGroup: region.includes("대전") ? "대전" : region.match(/서울|인천|경기/) ? "수도권" : region,
    companyType: "공공기관",
    employment,
    experience: item.recruitmentTypeName || "지원 조건 확인",
    education: (item.educationNames ?? []).join(", ") || "학력 조건 확인",
    major: (item.ncsNames ?? []).join(", ") || "직무 조건 확인",
    workMode: "출근",
    deadline: item.endDate ? "D-" + days : "마감일 미정",
    days,
    posted: index,
    tags: (item.ncsNames ?? []).slice(0, 2),
    match: isFuelCell || isBattery ? 90 : 78,
    reason: "공공데이터포털에서 수집한 진행 중 실제 공고입니다.",
  };
});

type Filters = {
  fields: string[];
  locations: string[];
  employment: string[];
  functions: string[];
  majors: string[];
  workMode: string[];
  deadlineOnly: boolean;
};

const blankFilters: Filters = { fields: [], locations: [], employment: [], functions: [], majors: [], workMode: [], deadlineOnly: false };
const filterGroups = [
  { key: "fields", title: "관심 분야", values: ["연료전지", "배터리·에너지저장"] },
  { key: "locations", title: "근무 지역", values: ["수도권", "대전"] },
  { key: "employment", title: "고용 형태", values: ["인턴", "신입 정규직"] },
  { key: "functions", title: "업무 분야", values: ["연구·개발", "생산·품질·공정", "설비 운영·현장 관리"] },
  { key: "majors", title: "전공 조건", values: ["관련 전공 필수", "관련 전공 우대"] },
  { key: "workMode", title: "근무 형태", values: ["혼합형"] },
] as const;

const scoreJob = (job: Job) => job.match + (job.days <= 7 ? 8 : job.days <= 14 ? 4 : 0) + (job.locationGroup === "대전" ? 2 : 0);

export default function Home() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(blankFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortMode, setSortMode] = useState<"recommend" | "deadline" | "latest">("recommend");
  const [saved, setSaved] = useState<number[]>([]);
  const [detail, setDetail] = useState<Job | null>(null);
  const [applied, setApplied] = useState(false);

  const toggleFilter = (key: keyof Omit<Filters, "deadlineOnly">, value: string) => {
    setFilters((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] }));
  };

  const filteredJobs = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const matches = jobs.filter((job) => {
      const searchable = [job.company, job.title, job.field, job.function, job.location, ...job.tags].join(" ").toLowerCase();
      return (!keyword || searchable.includes(keyword))
        && (!filters.fields.length || filters.fields.includes(job.field))
        && (!filters.locations.length || filters.locations.includes(job.locationGroup))
        && (!filters.employment.length || filters.employment.includes(job.employment))
        && (!filters.functions.length || filters.functions.includes(job.function))
        && (!filters.majors.length || filters.majors.includes(job.major))
        && (!filters.workMode.length || filters.workMode.includes(job.workMode))
        && (!filters.deadlineOnly || Boolean(job.deadline));
    });
    return [...matches].sort((a, b) => sortMode === "deadline" ? a.days - b.days : sortMode === "latest" ? b.posted - a.posted : scoreJob(b) - scoreJob(a));
  }, [filters, query, sortMode]);

  const activeFilterCount = Object.values(filters).reduce((total, value) => total + (Array.isArray(value) ? value.length : value ? 1 : 0), 0);
  const clearFilters = () => setFilters(blankFilters);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="에너지 커리어 파인더 홈"><span className="brandMark">E</span><span>에너지 커리어 파인더</span></a>
        <div className="studentBadge"><span className="studentAvatar">충</span><div><b>충남대 에너지공학과</b><small>3학년 · 맞춤 추천</small></div></div>
        <button className="savedHeader" onClick={() => setFilters((current) => ({ ...current }))}>관심 공고 <strong>{saved.length}</strong></button>
      </header>

      <section className="hero" id="top">
        <div className="heroCopy"><p className="eyebrow">ENERGY JOB FINDER</p><h1>에너지 커리어,<br /><em>지원할 타이밍</em>을 찾다.</h1><p className="heroText">연료전지와 배터리 분야에서<br />지금 지원할 만한 공고를 모았어요.</p>
          <div className="searchBox"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="회사, 직무, 분야를 검색해 보세요" aria-label="채용공고 검색" /><button type="button" onClick={() => setQuery(query.trim())}>검색</button></div>
          <div className="heroMeta"><span><b>{filteredJobs.length}</b>개 공고</span><span>오늘 기준 업데이트</span><span className="liveDot">● 실시간 추천</span></div>
        </div>
        <div className="heroVisual" aria-hidden="true"><div className="energyOrb"><span>⚡</span><b>ENERGY<br />MATCH</b><small>맞춤 추천</small></div><div className="energyRing ringOne" /><div className="energyRing ringTwo" /><span className="heroChip chipOne">연료전지 <b>3</b></span><span className="heroChip chipTwo">배터리·ESS <b>2</b></span><span className="heroChip chipThree">마감 임박 <b>2</b></span></div>
      </section>

      <div className="contentWrap" id="jobs">
        <section className="resultsSection">
          <div className="sectionHeading"><div><p className="eyebrow">RECOMMENDED FOR YOU</p><h2>지원할 만한 공고</h2><p>전공, 희망 분야, 마감일을 함께 반영해 추천순으로 정렬했어요.</p></div><div className="headingActions"><button className={`filterTrigger ${activeFilterCount ? "hasFilter" : ""}`} onClick={() => setFilterOpen(true)}>☷ 필터 {activeFilterCount > 0 && <b>{activeFilterCount}</b>}</button><select className="sortSelect" value={sortMode} onChange={(event) => setSortMode(event.target.value as typeof sortMode)} aria-label="공고 정렬"><option value="recommend">추천순</option><option value="deadline">마감 임박순</option><option value="latest">최신순</option></select></div></div>
          <div className="activeChips">{filters.fields.concat(filters.locations, filters.employment, filters.functions, filters.majors, filters.workMode).map((item) => <button key={item} onClick={() => { for (const group of filterGroups) if (group.values.includes(item as never)) toggleFilter(group.key, item); }}>{item} ×</button>)}{filters.deadlineOnly && <button onClick={() => setFilters((current) => ({ ...current, deadlineOnly: false }))}>마감일 있음 ×</button>}</div>
          <div className="resultSummary"><span><b>{filteredJobs.length}</b>개의 공고</span><span className="ruleHint">추천점수 = 분야 적합도 + 마감 임박도 + 지역 일치도</span></div>
          <div className="jobList" aria-live="polite">{filteredJobs.map((job, index) => <article className="jobCard" key={job.id} role="button" tabIndex={0} onClick={() => { setDetail(job); setApplied(false); }} onKeyDown={(event) => { if (event.key === "Enter") { setDetail(job); setApplied(false); } }}>
            <div className="rankBadge">{String(index + 1).padStart(2, "0")}</div><div className={`companyLogo ${job.tone}`}>{job.logo}</div><div className="jobMain"><div className="companyName">{job.company}<span className="companyType">{job.companyType}</span></div><h3>{job.title}</h3><div className="jobMeta"><span>⌖ {job.location}</span><span>◷ {job.employment}</span><span>▣ {job.function}</span></div><div className="tags">{job.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><div className="jobSide"><button className={`bookmark ${saved.includes(job.id) ? "saved" : ""}`} onClick={(event) => { event.stopPropagation(); setSaved((current) => current.includes(job.id) ? current.filter((id) => id !== job.id) : [...current, job.id]); }} aria-label={`${job.company} 관심 공고 ${saved.includes(job.id) ? "저장 취소" : "저장"}`}>{saved.includes(job.id) ? "♥" : "♡"}</button><span className="deadline">{job.deadline}</span><div className="match"><b>{job.match}%</b><span>적합도</span></div><small>{job.reason}</small></div>
          </article>)}{filteredJobs.length === 0 && <div className="emptyState"><b>조건에 맞는 공고가 없어요.</b><span>필터를 줄이거나 다른 키워드로 검색해 보세요.</span><button onClick={clearFilters}>필터 초기화</button></div>}</div>
        </section>

        <aside className="sideRail"><section className="profileCard"><div className="profileTop"><span className="profileIcon">E</span><span className="profileState">프로필 반영 중</span></div><h3>충남대 에너지공학과<br />3학년 맞춤 추천</h3><p>연료전지·배터리 분야와<br />연구·개발, 공정 업무를 우선해요.</p><div className="profileTags"><span>연료전지</span><span>배터리·ESS</span><span>수도권·대전</span></div></section><section className="quickCard"><div className="asideTitle"><h3>추천 순서 안내</h3><span>?</span></div><ol><li><b>분야 적합도</b><small>연료전지·배터리 일치</small></li><li><b>마감 임박도</b><small>가까운 마감일 우선</small></li><li><b>지역 일치도</b><small>수도권·대전 우선</small></li></ol></section><section className="savedCard"><div className="asideTitle"><h3>관심 공고</h3><span>{saved.length}개</span></div>{saved.length === 0 ? <p>하트 버튼으로 공고를 저장해 보세요.</p> : jobs.filter((job) => saved.includes(job.id)).map((job) => <div className="savedRow" key={job.id}><span className={`miniLogo ${job.tone}`}>{job.logo}</span><div><b>{job.company}</b><small>{job.title}</small></div></div>)}</section></aside>
      </div>

      {filterOpen && <div className="drawerBackdrop" role="presentation" onClick={() => setFilterOpen(false)}><section className="filterDrawer" role="dialog" aria-modal="true" aria-label="채용공고 필터" onClick={(event) => event.stopPropagation()}><div className="drawerHeader"><div><p className="eyebrow">FILTERS</p><h2>공고 필터</h2></div><button className="closeButton" onClick={() => setFilterOpen(false)} aria-label="필터 닫기">×</button></div><div className="drawerBody">{filterGroups.map((group) => <fieldset key={group.key}><legend>{group.title}</legend><div className="filterOptions">{group.values.map((value) => { const selected = filters[group.key].includes(value); return <button key={value} className={selected ? "selected" : ""} onClick={() => toggleFilter(group.key, value)}>{value}<span>{selected ? "✓" : "+"}</span></button>; })}</div></fieldset>)}<fieldset><legend>마감일</legend><div className="filterOptions"><button className={filters.deadlineOnly ? "selected" : ""} onClick={() => setFilters((current) => ({ ...current, deadlineOnly: !current.deadlineOnly }))}>마감일 있음<span>{filters.deadlineOnly ? "✓" : "+"}</span></button></div></fieldset></div><div className="drawerFooter"><button className="clearButton" onClick={clearFilters}>초기화</button><button className="applyFilter" onClick={() => setFilterOpen(false)}>공고 {filteredJobs.length}개 보기</button></div></section></div>}

      {detail && <div className="modalBackdrop" role="presentation" onClick={() => setDetail(null)}><section className="detailModal" role="dialog" aria-modal="true" aria-label={`${detail.company} 공고 상세`} onClick={(event) => event.stopPropagation()}><button className="closeButton modalClose" onClick={() => setDetail(null)} aria-label="공고 상세 닫기">×</button><div className={`detailLogo ${detail.tone}`}>{detail.logo}</div><span className="detailCompany">{detail.company} · {detail.companyType}</span><h2>{detail.title}</h2><div className="detailPills"><span>{detail.field}</span><span>{detail.function}</span><span>{detail.location}</span><span>{detail.employment}</span></div><div className="detailGrid"><div><b>지원 자격</b><p>{detail.experience}<br />{detail.education}<br />{detail.major}</p></div><div><b>근무 조건</b><p>{detail.location}<br />{detail.workMode} 근무<br />마감 {detail.deadline}</p></div><div><b>추천 이유</b><p>{detail.reason}</p></div><div><b>회사 소개</b><p>{detail.company}의 {detail.field} 관련 {detail.function} 포지션입니다.</p></div></div><div className="detailActions"><button className={`saveDetail ${saved.includes(detail.id) ? "saved" : ""}`} onClick={() => setSaved((current) => current.includes(detail.id) ? current.filter((id) => id !== detail.id) : [...current, detail.id])}>{saved.includes(detail.id) ? "♥ 저장됨" : "♡ 관심 공고 저장"}</button><button className="applyButton" onClick={() => setApplied(true)}>바로 지원하기 <span>→</span></button></div>{applied && <div className="applyNotice">지원 준비 화면이에요. 공고 원문에서 제출 전 지원 자격을 한 번 더 확인해 주세요.</div>}</section></div>}
    </main>
  );
}
