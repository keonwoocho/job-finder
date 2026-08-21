import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(rootDir, ".env");
const outputPath = path.join(rootDir, "jobs.json");

function loadDotEnv(contents) {
  const values = {};
  for (const line of contents.split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 0) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

const env = loadDotEnv(await readFile(envPath, "utf8"));
const serviceKey = env.RECRUITMENT_API_KEY;
if (!serviceKey) throw new Error("RECRUITMENT_API_KEY가 .env에 없습니다.");
const decodedServiceKey = serviceKey.includes("%") ? decodeURIComponent(serviceKey) : serviceKey;

const endpoint = "https://apis.data.go.kr/1051000/recruitment/list";
const pageSize = 100;
const maxRows = 300;
const wantedHireTypes = new Set(["R1050", "R1060", "R1070"]);
const wantedRecruitmentTypes = new Set(["R2010", "R2030"]);

function asArray(value) {
  if (Array.isArray(value)) return value;
  return value == null ? [] : [value];
}

function splitCodes(value) {
  return String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
}

function isWanted(job) {
  const hireTypes = splitCodes(job.hireTypeLst);
  return hireTypes.some((code) => wantedHireTypes.has(code))
    || wantedRecruitmentTypes.has(String(job.recrutSe ?? ""));
}

function normalize(job) {
  return {
    recrutPblntSn: job.recrutPblntSn,
    institutionCode: job.pblntInstCd,
    institutionName: job.instNm,
    title: job.recrutPbancTtl,
    recruitmentType: job.recrutSe,
    recruitmentTypeName: job.recrutSeNm,
    hireTypes: splitCodes(job.hireTypeLst),
    hireTypeNames: String(job.hireTypeNmLst ?? "").split(",").map((item) => item.trim()).filter(Boolean),
    ncsCodes: splitCodes(job.ncsCdLst),
    ncsNames: String(job.ncsCdNmLst ?? "").split(",").map((item) => item.trim()).filter(Boolean),
    workRegionCodes: splitCodes(job.workRgnLst),
    workRegionNames: String(job.workRgnNmLst ?? "").split(",").map((item) => item.trim()).filter(Boolean),
    educationCodes: splitCodes(job.acbgCondLst),
    educationNames: String(job.acbgCondNmLst ?? "").split(",").map((item) => item.trim()).filter(Boolean),
    preferredConditions: job.prefCondCn ?? "",
    recruitmentCount: job.recrutNope ?? null,
    startDate: job.pbancBgngYmd,
    endDate: job.pbancEndYmd,
    ongoing: job.ongoingYn === "Y",
    replacementWorker: job.replmprYn === "Y",
    sourceUrl: job.srcUrl ?? "",
  };
}

const collected = [];
const seen = new Set();
let pageNo = 1;
let totalCount = Infinity;

while (collected.length < maxRows && (pageNo - 1) * pageSize < totalCount) {
  const params = new URLSearchParams({
    serviceKey: decodedServiceKey,
    resultType: "json",
    ongoingYn: "Y",
    numOfRows: String(pageSize),
    pageNo: String(pageNo),
  });
  const response = await fetch(endpoint + "?" + params.toString());
  if (!response.ok) throw new Error("채용 API 요청 실패: HTTP " + response.status);
  const payload = await response.json();
  if (payload?.resultCode && String(payload.resultCode) !== "200") {
    throw new Error("채용 API 오류: " + (payload.resultMsg ?? payload.resultCode));
  }
  totalCount = Number(payload.totalCount ?? payload.result?.totalCount ?? 0);
  const rows = asArray(payload.result ?? payload.items ?? payload.data);
  if (!rows.length) break;
  for (const job of rows) {
    if (!job || !isWanted(job)) continue;
    const id = String(job.recrutPblntSn ?? "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    collected.push(normalize(job));
    if (collected.length >= maxRows) break;
  }
  pageNo += 1;
}

collected.sort((a, b) => String(a.endDate ?? "").localeCompare(String(b.endDate ?? "")));
await writeFile(outputPath, JSON.stringify(collected.slice(0, maxRows), null, 2) + "\n", "utf8");
console.log("저장 건수: " + Math.min(collected.length, maxRows));
