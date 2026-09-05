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

const THUMBNAILS = [
  "https://images.unsplash.com/photo-1526199119161-4be1e3368d52?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=520&q=80",
  "https://images.unsplash.com/photo-1549221428-495f00892696?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=520&q=80",
  "https://images.unsplash.com/photo-1528291781122-cd7443caef8f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=520&q=80",
  "https://images.unsplash.com/photo-1603031682537-ea6729c9d1bc?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=520&q=80",
  "https://images.unsplash.com/photo-1497215842964-222b430dc094?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=520&q=80",
  "https://images.unsplash.com/photo-1553801613-932c79d34aa8?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=520&q=80",
  "https://images.unsplash.com/photo-1532540859745-7b3954001b75?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=520&q=80",
  "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=520&q=80",
];

export default function BenefitCard({
  id,
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
  const thumbIndex = Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0) % THUMBNAILS.length;
  const thumb = THUMBNAILS[thumbIndex];

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
      {/* Thumbnail */}
      <div style={{ width: "100%", height: 190, overflow: "hidden", flexShrink: 0, position: "relative", borderRadius: "13px 13px 0 0" }}>
        <img
          src={thumb}
          alt=""
          style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            transition: "transform 0.35s",
            transform: hovered ? "scale(1.04)" : "scale(1)",
            filter: status === "마감" ? "grayscale(60%) brightness(0.85)" : "none",
          }}
          loading="lazy"
        />

        {/* Tag pill — top left */}
        <span style={{
          position: "absolute", top: 10, left: 10,
          fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99,
          background: "rgba(255,255,255,0.92)", color: tagStyle.text,
          backdropFilter: "blur(6px)", letterSpacing: "0.2px",
        }}>
          {tag}
        </span>

        {/* Status + deadline stack — top right */}
        <div style={{ position: "absolute", top: 10, right: 10, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          {deadline != null && (
            <span style={{
              fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 99,
              background: isUrgent ? "#DC2626" : "rgba(0,0,0,0.50)",
              color: "#fff", letterSpacing: "0.3px",
              backdropFilter: "blur(4px)",
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
        </div>

        {/* Like button — bottom right */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleLike(); }}
          style={{
            position: "absolute", bottom: 10, right: 10,
            width: 30, height: 30, borderRadius: "50%",
            background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: liked ? "#E53E3E" : "#CBD5E0", transition: "color 0.15s, transform 0.15s",
            transform: liked ? "scale(1.15)" : "scale(1)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
          }}
          aria-label={liked ? "찜 해제" : "찜하기"}
        >
          <svg width="15" height="15" viewBox="0 0 18 18" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
            <path d="M9 15.5C9 15.5 2 11 2 6.5C2 4.567 3.567 3 5.5 3C6.77 3 7.893 3.677 8.5 4.704C9.5 4.704 9.5 4.704 9.5 4.704C10.107 3.677 11.23 3 12.5 3C14.433 3 16 4.567 16 6.5C16 11 9 15.5 9 15.5Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Card body */}
      <div style={{ padding: "13px 15px 15px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
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
