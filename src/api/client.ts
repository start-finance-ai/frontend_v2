import type {
  BusinessStatus,
  ChatRequest,
  ChatResponse,
  Program,
  ProgramSearchResponse,
  UserType,
} from "./types";

const DEFAULT_API_BASE_URL = "https://backend-production-1620.up.railway.app";
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number | null = null,
    public readonly code: string | null = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ProgramQuery {
  query?: string;
  region?: string;
  business_status?: BusinessStatus;
  user_type?: UserType;
  category?: string;
  provider?: string;
  industry?: string;
  limit?: number;
}

async function apiRequest<T>(path: string, init?: RequestInit, timeoutMs = 15_000): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
      signal: controller.signal,
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const detail = body?.detail ?? body;
      throw new ApiError(
        detail?.message || body?.message || "요청을 처리하지 못했습니다.",
        response.status,
        detail?.error_code || body?.error_code || null,
      );
    }
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.");
    }
    throw new ApiError("서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.");
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function getPrograms(query: ProgramQuery = {}): Promise<ProgramSearchResponse> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const suffix = params.size ? `?${params.toString()}` : "";
  return apiRequest<ProgramSearchResponse>(`/programs${suffix}`);
}

export function getProgram(programId: string): Promise<Program> {
  return apiRequest<Program>(`/programs/${encodeURIComponent(programId)}`);
}

export function postChat(payload: ChatRequest): Promise<ChatResponse> {
  return apiRequest<ChatResponse>(
    "/chat",
    { method: "POST", body: JSON.stringify(payload) },
    45_000,
  );
}

