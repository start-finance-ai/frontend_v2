export type BannerStatus = "empty" | "needs-review" | "error" | "ai-fallback" | "file-error";

interface StatusBannerProps {
  status: BannerStatus;
  isAdvanced?: boolean;
  onRetry: () => void;
  onDismiss: () => void;
}

const BANNER_CONFIG: Record<BannerStatus, {
  icon: React.ReactNode;
  accentLight: string;
  accentDark: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  label: string;
  message: string;
}> = {
  empty: {
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5.5 8h5M8 5.5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    accentLight: "#6B7280", accentDark: "#9CA3AF",
    bgLight: "#F9FAFB", bgDark: "rgba(255,255,255,0.06)",
    borderLight: "#E5E7EB", borderDark: "rgba(255,255,255,0.12)",
    label: "결과 없음",
    message: "현재 조건에서 확인된 지원사업이 없습니다. 조건을 조금 넓혀 다시 찾아보세요.",
  },
  "needs-review": {
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    accentLight: "#D97706", accentDark: "#FCD34D",
    bgLight: "#FFFBEB", bgDark: "rgba(251,191,36,0.08)",
    borderLight: "#FDE68A", borderDark: "rgba(251,191,36,0.25)",
    label: "추가 확인 필요",
    message: "일부 조건은 공식 공고에서 추가 확인이 필요합니다.",
  },
  error: {
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    accentLight: "#DC2626", accentDark: "#FCA5A5",
    bgLight: "#FEF2F2", bgDark: "rgba(220,38,38,0.1)",
    borderLight: "#FECACA", borderDark: "rgba(220,38,38,0.25)",
    label: "오류",
    message: "요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.",
  },
  "ai-fallback": {
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <path d="M8 2L9.5 6H14L10.5 8.5L12 13L8 10.5L4 13L5.5 8.5L2 6H6.5L8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    ),
    accentLight: "#2563EB", accentDark: "#93C5FD",
    bgLight: "#EFF6FF", bgDark: "rgba(37,99,235,0.1)",
    borderLight: "#BFDBFE", borderDark: "rgba(37,99,235,0.25)",
    label: "AI 응답 오류",
    message: "AI 설명을 불러오지 못했지만 확인된 지원사업과 조건은 아래에서 볼 수 있습니다.",
  },
  "file-error": {
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M9 2v4h4M6.5 9.5l3 3M9.5 9.5l-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    accentLight: "#7C3AED", accentDark: "#C4B5FD",
    bgLight: "#F5F3FF", bgDark: "rgba(124,58,237,0.1)",
    borderLight: "#DDD6FE", borderDark: "rgba(124,58,237,0.25)",
    label: "파일 오류",
    message: "지원하지 않는 파일 형식이거나 필수 데이터가 없습니다.",
  },
};

export default function StatusBanner({ status, isAdvanced = false, onRetry, onDismiss }: StatusBannerProps) {
  const cfg = BANNER_CONFIG[status];
  const accent = isAdvanced ? cfg.accentDark : cfg.accentLight;
  const bg = isAdvanced ? cfg.bgDark : cfg.bgLight;
  const border = isAdvanced ? cfg.borderDark : cfg.borderLight;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "12px 16px",
      borderRadius: 12,
      background: bg,
      border: `1.5px solid ${border}`,
      marginBottom: 10,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 9, flex: 1, minWidth: 0 }}>
        <span style={{ color: accent, flexShrink: 0, marginTop: 1 }}>{cfg.icon}</span>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: accent, margin: "0 0 2px", letterSpacing: "0.1px" }}>{cfg.label}</p>
          <p style={{ fontSize: 12, color: isAdvanced ? "rgba(200,215,255,0.75)" : "#6B7280", margin: 0, lineHeight: 1.5 }}>{cfg.message}</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {status === "error" && (
          <button onClick={onRetry}
            style={{ padding: "6px 12px", borderRadius: 7, border: "none", background: accent, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)", whiteSpace: "nowrap", letterSpacing: "-0.1px" }}>
            다시 시도
          </button>
        )}
        <button onClick={onDismiss}
          style={{ width: 22, height: 22, borderRadius: "50%", border: "none", background: isAdvanced ? "rgba(255,255,255,0.1)" : "#F3F4F6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: isAdvanced ? "rgba(200,215,255,0.5)" : "#9CA3AF", transition: "background 0.15s" }}>
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
