export type DeadlineType =
  | "FIXED_DATE"
  | "UNTIL_BUDGET_EXHAUSTED"
  | "ALWAYS_OPEN"
  | "SEE_ANNOUNCEMENT"
  | "VARIABLE"
  | "UNKNOWN";

export type ApplicationStatus = "OPEN" | "UPCOMING" | "CLOSED" | "NEEDS_CONFIRMATION";
export type ChatMode = "GENERAL" | "FOCUS";
export type ReplySource = "LLM" | "TEMPLATE_FALLBACK";
export type MatchStatus = "MATCH" | "NO_MATCH" | "NEEDS_REVIEW" | "UNKNOWN";
export type UserType = "PRE_FOUNDER" | "SMALL_BUSINESS_OWNER" | "FREELANCER";
export type BusinessStatus = "PRE_FOUNDER" | "REGISTERED" | "UNREGISTERED" | "EXISTING_BUSINESS";
export type Intent = "SUPPORT_PROGRAM" | "POLICY_LOAN" | "FINANCIAL_RISK";

export interface ProgramSearchProgram {
  program_id: string;
  program_name: string;
  provider: string | null;
  executing_organization: string | null;
  category: string | null;
  subcategory: string | null;
  target_text: string | null;
  summary_text: string | null;
  apply_start: string | null;
  apply_end: string | null;
  apply_period_text: string | null;
  deadline_type: DeadlineType;
  application_status: ApplicationStatus;
  application_status_note: string | null;
}

export interface ProgramSearchResult {
  program: ProgramSearchProgram;
  retrieval_score: number;
  matched_fields: string[];
  source: string;
  source_url: string | null;
}

export interface ProgramSearchResponse {
  results: ProgramSearchResult[];
  result_count: number;
  limit: number;
  score_semantics: "DETERMINISTIC_RANKING_ONLY";
}

export interface Program {
  program_id: string;
  program_name: string;
  provider: string | null;
  executing_organization: string | null;
  category: string | null;
  subcategory: string | null;
  target_type_raw: string | null;
  hashtags_raw: string | null;
  summary_raw: string | null;
  application_method_raw: string | null;
  contact_raw: string | null;
  apply_start: string | null;
  apply_end: string | null;
  apply_period_text: string | null;
  deadline_type: DeadlineType;
  source: string;
  source_url: string | null;
  document_url: string | null;
  document_name: string | null;
  source_created_at: string | null;
  source_updated_at: string | null;
  collected_at: string | null;
  raw_source: Record<string, unknown>;
}

export interface UserProfile {
  user_type?: UserType;
  region?: string;
  business_region?: string;
  age?: number;
  pre_founder?: boolean;
  business_status?: BusinessStatus;
  business_age?: number;
  business_age_unit?: "YEAR" | "MONTH";
  industry?: string;
  capital?: number;
  intents?: Intent[];
}

export interface ChatRequest {
  mode: ChatMode;
  message: string;
  focus_profile: UserProfile | null;
  program_id: string | null;
  session_id: string | null;
}

export interface ChatProgram extends ProgramSearchProgram {
  application_method_text: string | null;
  source_url: string | null;
}

export interface ConditionResult {
  condition_id: string;
  condition_type: string;
  status: MatchStatus;
  is_exclusion: boolean;
  actual_value: unknown | null;
  raw_expected_value: string;
  reason: string;
  evidence: {
    condition_id: string;
    condition_type: string;
    source_field: string;
    evidence_text: string;
  };
}

export interface ChatMatch {
  program_id: string;
  match_status: MatchStatus;
  condition_results: ConditionResult[];
  reason: string;
}

export interface ChatEvidence {
  program_id: string;
  condition_id: string;
  condition_type: string;
  source_field: string;
  evidence_text: string;
}

export interface ChatSource {
  program_id: string;
  source: string;
  source_url: string | null;
}

export interface ChatAction {
  action_type: string;
  label: string;
  program_id: string | null;
  href: string | null;
}

export interface ChatResponse {
  mode: ChatMode;
  reply: string;
  reply_source: ReplySource;
  model: string | null;
  programs: ChatProgram[];
  matches: ChatMatch[];
  evidence: ChatEvidence[];
  sources: ChatSource[];
  actions: ChatAction[];
  suggest_focus_mode: boolean;
  program_context_id: string | null;
}

