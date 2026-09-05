import type {
  ApplicationStatus,
  Program,
  ProgramSearchResult,
} from "../api/types";

export type BenefitStatus = "신청 가능" | "신청 예정" | "마감" | "확인 필요";

export interface Benefit {
  id: string;
  tag: string;
  title: string;
  org: string;
  summary: string;
  target?: string;
  status: BenefitStatus;
  deadline?: number;
  source: string;
  sourceUrl?: string;
}

const STATUS_LABEL: Record<ApplicationStatus, BenefitStatus> = {
  OPEN: "신청 가능",
  UPCOMING: "신청 예정",
  CLOSED: "마감",
  NEEDS_CONFIRMATION: "확인 필요",
};

export function toPlainText(value: string | null | undefined): string {
  return (value || "")
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function daysUntil(dateText: string | null, status: ApplicationStatus): number | undefined {
  if (!dateText || status !== "OPEN") return undefined;
  const end = new Date(`${dateText}T23:59:59+09:00`).getTime();
  const seoulDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
  const start = new Date(`${seoulDate}T00:00:00+09:00`).getTime();
  const days = Math.ceil((end - start) / 86_400_000);
  return days >= 0 ? days : undefined;
}

function applicationStatus(program: Program): ApplicationStatus {
  if (program.deadline_type === "ALWAYS_OPEN") return "OPEN";
  if (program.deadline_type !== "FIXED_DATE" || !program.apply_start || !program.apply_end) return "NEEDS_CONFIRMATION";
  const seoulDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
  if (seoulDate < program.apply_start) return "UPCOMING";
  if (seoulDate > program.apply_end) return "CLOSED";
  return "OPEN";
}

export function searchResultToBenefit(result: ProgramSearchResult): Benefit {
  const { program } = result;
  return {
    id: program.program_id,
    tag: program.subcategory || program.category || "지원사업",
    title: program.program_name,
    org: program.executing_organization || program.provider || "기관 정보 확인 필요",
    summary: toPlainText(program.summary_text) || "상세 내용은 공식 공고에서 확인해주세요.",
    target: toPlainText(program.target_text) || undefined,
    status: STATUS_LABEL[program.application_status],
    deadline: daysUntil(program.apply_end, program.application_status),
    source: result.source,
    sourceUrl: result.source_url || undefined,
  };
}

export function programToBenefit(program: Program): Benefit {
  const status = applicationStatus(program);
  return {
    id: program.program_id,
    tag: program.subcategory || program.category || "지원사업",
    title: program.program_name,
    org: program.executing_organization || program.provider || "기관 정보 확인 필요",
    summary: toPlainText(program.summary_raw) || "상세 내용은 공식 공고에서 확인해주세요.",
    target: toPlainText(program.target_type_raw) || undefined,
    status: STATUS_LABEL[status],
    deadline: daysUntil(program.apply_end, status),
    source: program.source,
    sourceUrl: program.source_url || undefined,
  };
}
