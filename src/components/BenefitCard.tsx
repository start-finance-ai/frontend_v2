import { useState } from "react";
import type { BenefitStatus } from "../data/benefits";

interface BenefitCardProps {
  id: string;
  tag: string;
  title: string;
  org: string;
  summary: string;
  target?: string;
  status: BenefitStatus;
  deadline?: number;
  amount?: string;
  liked: boolean;
  onToggleLike: () => void;
  showDetailBtn?: boolean;
  onDetailClick?: () => void;
}

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  창업: { bg: "#EEF2FF", text: "#1B4DFF" },
  사업화지원: { bg: "#ECFDF5", text: "#059669" },
  창업공간지원: { bg: "#F0F9FF", text: "#0284C7" },
  예비창업자지원: { bg: "#FFF7ED", text: "#EA580C" },
  기타: { bg: "#F3F4F6", text: "#6B7280" },
};

const STATUS_CONFIG: Record<BenefitStatus, { bg: string; text: string; label: string }> = {
  "신청 가능": { bg: "#059669", text: "#fff", label: "신청 가능" },
  "신청 예정": { bg: "#1B4DFF", text: "#fff", label: "신청 예정" },
  "마감": { bg: "#374151", text: "#fff", label: "마감" },
  "확인 필요": { bg: "#D97706", text: "#fff", label: "공고 확인 필요" },
};

export default function BenefitCard({
  tag,
  title,
  org,
  summary,
  target,
  status,
  deadline,
  amount,
  liked,
  onToggleLike,
  showDetailBtn = false,
  onDetailClick,
}: BenefitCardProps) {
  const [hovered, setHovered] = useState(false);
  const isUrgent = status === "신청 가능" && deadline != null && deadline <= 7;
  const tagStyle = TAG_COLORS[tag] ?? { bg: "#F0F2F7", text: "#7A849A" };
  const statusCfg = STATUS_CONFIG[status];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 14,
        border: `1px solid ${hovered ? "#C7D2FE" : "#E5E7EB"}`,
        display: "flex",
        flexDirection: "column",
        boxShadow: hovered ? "0 8px 28px rgba(27,77,255,0.11)" : "0 1px 4px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "box-shadow 0.18s, transform 0.18s, border-color 0.18s",
        position: "relative",
        overflow: "hidden",
        height: "100%",
        boxSizing: "border-box",
        cursor: "default",
      }}
    >
      {/* Badge row */}
      <div style={{ padding: "13px 15px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99,
          background: tagStyle.bg, color: tagStyle.text,
          letterSpacing: "0.2px", flexShrink: 0,
        }}>
          {tag}
        </span>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, flexWrap: "wrap" }}>
          {deadline != null && (
            <span style={{
              fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 99,
              background: isUrgent ? "#DC2626" : "rgba(0,0,0,0.50)",
              color: "#fff", letterSpacing: "0.3px",
            }}>
              D-{deadline}
            </span>
          )}
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99,
            background: statusCfg.bg,
            color: statusCfg.text,
            letterSpacing: "0.1px",
            opacity: status === "마감" ? 0.85 : 1,
          }}>
            {statusCfg.label}
          </span>

          <button
            onClick={(e) => { e.stopPropagation(); onToggleLike(); }}
            style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "#F9FAFB", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: liked ? "#E53E3E" : "#CBD5E0", transition: "color 0.15s, transform 0.15s",
              transform: liked ? "scale(1.15)" : "scale(1)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.12)", flexShrink: 0,
            }}
            aria-label={liked ? "찜 해제" : "찜하기"}
          >
            <svg width="15" height="15" viewBox="0 0 18 18" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
              <path d="M9 15.5C9 15.5 2 11 2 6.5C2 4.567 3.567 3 5.5 3C6.77 3 7.893 3.677 8.5 4.704C9.5 4.704 9.5 4.704 9.5 4.704C10.107 3.677 11.23 3 12.5 3C14.433 3 16 4.567 16 6.5C16 11 9 15.5 9 15.5Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "10px 15px 15px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.45, color: "#111827", margin: "0 0 2px" }}>
            {title}
          </p>
          <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0, fontWeight: 500 }}>{org}</p>
        </div>

        <p style={{ fontSize: 12, color: "#6B7280", margin: 0, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {summary}
        </p>

        {/* Amount + target row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 4, gap: 6 }}>
          {amount ? (
            <span style={{
              fontSize: 11, fontWeight: 700, color: "#1B4DFF",
              padding: "2px 8px", borderRadius: 5,
              background: "#EEF2FF", flexShrink: 0,
            }}>
              {amount}
            </span>
          ) : <span />}
          {target && (
            <span style={{ fontSize: 10, color: "#9CA3AF", textAlign: "right", lineHeight: 1.4, flexShrink: 1, minWidth: 0 }}>
              {target}
            </span>
          )}
        </div>

        {showDetailBtn && (
          <button
            onClick={(e) => { e.stopPropagation(); onDetailClick?.(); }}
            style={{
              padding: "9px 0", borderRadius: 9,
              border: `1.5px solid ${hovered ? "var(--color-primary)" : "#E5E7EB"}`,
              background: hovered ? "var(--color-primary)" : "transparent",
              color: hovered ? "#fff" : "#6B7280",
              fontWeight: 600, fontSize: 13,
              cursor: "pointer", fontFamily: "var(--font-sans)",
              transition: "all 0.18s",
            }}
          >
            자세히 보기
          </button>
        )}
      </div>
    </div>
  );
}
