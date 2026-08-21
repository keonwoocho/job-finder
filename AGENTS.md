[RULES-OK]

# Agent Instructions

## Scope

- Keep the product to one job-search screen for a Chungnam National University Energy Engineering third-year student.
- Support internship and entry-level postings.
- Prioritize fuel cells and batteries/energy storage.
- Do not connect the project API; use only data explicitly available in the task or local mock data.

## Commands

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Start local preview | `npm run dev` |
| Build | `npm run build` |
| Test | `npm test` |
| Lint | `npm run lint` |

## UI Requirements

- Center the first view on recommended postings and each posting's recommendation reason.
- Show filters through a `필터` button and show the complete posting after selecting a posting.
- Show eligibility/deadline, duties/work conditions, and company introduction/size in posting details.
- Provide `바로 지원하기` and `관심 공고로 저장하기` actions.
- Keep the final posting-list presentation, filter-panel layout, support-screen details, and saved-posting screen as (모름).

## Recommendation Rules

- Include fuel-cell or battery/energy-storage postings in 수도권 or 대전.
- Include 대기업 postings for 인턴 or 신입 정규직 roles.
- Prefer 신입·경력무관 or 경력 1년 이하 eligibility.
- Include 재학생·졸업예정자·졸업자 eligibility.
- Prefer hybrid 출근·재택 roles and 에너지공학·관련 전공 필수/우대 roles.
- Prefer 연구·개발, 생산·품질·공정, and 설비 운영·현장 관리 roles.
- Require a displayed deadline and sort nearer deadlines higher.

## Interaction Rules

- Clicking `연료전지`, `배터리·에너지저장`, `인턴`, `신입`, `수도권`, or `대전` shows matching postings only.
- Clicking `대기업`, `신입·경력무관`, `경력 1년 이하`, or a work category shows matching postings only.
- Clicking `마감일 있음` shows postings with displayed deadlines only.
- Clicking `바로 지원하기` shows the support screen.
- Clicking `관심 공고로 저장하기` shows the saved state.

## References

| Need | File |
|------|------|
| Scripts and dependencies | `package.json` |
| Setup and project shape | `README.md` |
| Site bindings | `.openai/hosting.json` |
