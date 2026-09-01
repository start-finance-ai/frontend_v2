import { ALL_BENEFITS } from "../data/benefits";

interface DetailPageProps {
  benefitId: number;
  likedIds: Set<number>;
  toggleLike: (id: number) => void;
  onBack: () => void;
}

const DETAIL_EXTRA: Record<number, { period: string; method: string; link: string; fullDesc: string }> = {
  1: {
    period: "2025. 06. 01 ~ 2025. 08. 24 (D-3)",
    method: "온라인 신청 (소상공인마당) 또는 관할 소상공인지원센터 방문",
    link: "https://www.sbiz.or.kr",
    fullDesc:
      "코로나19 이후 경영 위기를 겪고 있는 소상공인의 경영 안정을 위해 정부가 운영하는 특별 자금입니다. 무이자로 최대 2천만원을 지원하며, 상환 기간은 최장 5년입니다. 신용등급 및 매출 규모와 관계없이 소상공인이라면 누구나 신청 가능합니다.",
  },
  2: {
    period: "2025. 07. 15 ~ 2025. 09. 05 (D-14)",
    method: "중소기업진흥공단 온라인 신청시스템(bizstart.go.kr)",
    link: "https://www.bizstart.go.kr",
    fullDesc:
      "만 39세 이하 청년 예비창업자 및 3년 미만 초기창업자를 대상으로 최대 1억원을 연 2% 이하의 저금리로 지원합니다. 사업계획서 심사를 통해 선정되며, 창업 준비금·운영자금 모두 사용 가능합니다.",
  },
  3: {
    period: "2025. 08. 01 ~ 2025. 08. 28 (D-7)",
    method: "서울시 일자리포털 온라인 신청",
    link: "https://job.seoul.go.kr",
    fullDesc:
      "서울특별시에 거주하는 프리랜서를 대상으로 직업훈련비를 바우처 형태로 지원합니다. 온라인·오프라인 강좌 모두 사용 가능하며, 프리랜서 등록 후 1개월 이내 신청 가능합니다.",
  },
};

const DEFAULT_EXTRA = {
  period: "2025. 07. 01 ~ 2025. 09. 30",
  method: "각 지원 기관 홈페이지 또는 방문 신청",
  link: "#",
  fullDesc: "해당 지원사업의 세부 내용은 공식 홈페이지에서 확인하세요. 신청 자격, 제출 서류, 심사 기준 등을 미리 검토하고 준비하시기 바랍니다.",
};

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  대출: { bg: "#EEF2FF", text: "#1B4DFF" },
  정부지원: { bg: "#ECFDF5", text: "#059669" },
  은행상품: { bg: "#FEF3C7", text: "#D97706" },
  지자체: { bg: "#F3E8FF", text: "#7C3AED" },
};

export default function DetailPage({ benefitId, likedIds, toggleLike, onBack }: DetailPageProps) {
  const benefit = ALL_BENEFITS.find((b) => b.id === benefitId);
  if (!benefit) return null;

  const extra = DETAIL_EXTRA[benefitId] ?? DEFAULT_EXTRA;
  const liked = likedIds.has(benefitId);
  const tagStyle = TAG_COLORS[benefit.tag] ?? { bg: "#F0F2F7", text: "#7A849A" };
  const isUrgent = benefit.status === "신청 가능" && benefit.deadline != null && benefit.deadline <= 7;

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--color-muted-foreground)",
          fontSize: 14,
          fontFamily: "var(--font-sans)",
          padding: 0,
          marginBottom: 28,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        목록으로 돌아가기
      </button>

      {/* Card */}
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--color-border)",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "32px 36px 28px",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 7,
                    background: tagStyle.bg,
                    color: tagStyle.text,
                  }}
                >
                  {benefit.tag}
                </span>
                {isUrgent && (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 7,
                      background: "#FEF2F2",
                      color: "#DC2626",
                    }}
                  >
                    마감임박 D-{benefit.deadline}
                  </span>
                )}
                {!isUrgent && (
                  <span style={{ fontSize: 13, color: "var(--color-muted-foreground)" }}>
                    {benefit.status}{benefit.deadline != null ? ` · D-${benefit.deadline}` : ""}
                  </span>
                )}
              </div>
              <h1
                style={{
                  fontWeight: 800,
                  fontSize: 24,
                  margin: 0,
                  lineHeight: 1.3,
                  letterSpacing: "-0.5px",
                }}
              >
                {benefit.title}
              </h1>
              <p style={{ fontSize: 15, color: "var(--color-muted-foreground)", margin: "10px 0 0", lineHeight: 1.6 }}>
                {benefit.summary}
              </p>
            </div>

            {/* Like button */}
            <button
              onClick={() => toggleLike(benefitId)}
              style={{
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "12px 16px",
                borderRadius: 12,
                border: `1.5px solid ${liked ? "#FECACA" : "var(--color-border)"}`,
                background: liked ? "#FFF5F5" : "transparent",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                transition: "all 0.2s",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill={liked ? "#E53E3E" : "none"} stroke={liked ? "#E53E3E" : "#9CA3AF"} strokeWidth="1.8">
                <path d="M11 19C11 19 3 14 3 8.5C3 6.015 5.015 4 7.5 4C8.98 4 10.297 4.727 11 5.854C11.703 4.727 13.02 4 14.5 4C16.985 4 19 6.015 19 8.5C19 14 11 19 11 19Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: 11, fontWeight: 600, color: liked ? "#E53E3E" : "#9CA3AF" }}>
                {liked ? "찜됨" : "찜하기"}
              </span>
            </button>
          </div>
        </div>

        {/* Details */}
        <div style={{ padding: "28px 36px", display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Full description */}
          <InfoSection title="사업 개요">
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "#374151", margin: 0 }}>
              {extra.fullDesc}
            </p>
          </InfoSection>

          <Divider />

          {/* Target */}
          <InfoSection title="지원 대상">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {benefit.categories.map((c) => (
                <span
                  key={c}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 99,
                    background: "var(--color-secondary)",
                    color: "var(--color-primary)",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {c}
                </span>
              ))}
              {benefit.target && (
                <span
                  style={{
                    padding: "5px 12px",
                    borderRadius: 99,
                    background: "var(--color-muted)",
                    color: "var(--color-muted-foreground)",
                    fontSize: 13,
                  }}
                >
                  {benefit.target}
                </span>
              )}
            </div>
          </InfoSection>

          <Divider />

          {/* Period */}
          <InfoSection title="신청 기간">
            <p style={{ fontSize: 14, color: "#374151", margin: 0, fontWeight: 500 }}>
              {extra.period}
            </p>
          </InfoSection>

          <Divider />

          {/* Method */}
          <InfoSection title="신청 방법">
            <p style={{ fontSize: 14, color: "#374151", margin: 0, lineHeight: 1.7 }}>
              {extra.method}
            </p>
          </InfoSection>

          <Divider />

          {/* CTA */}
          <div style={{ paddingTop: 28, display: "flex", gap: 12 }}>
            <button
              style={{
                flex: 1,
                padding: "15px",
                borderRadius: 12,
                border: "none",
                background: "var(--color-primary)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              신청 페이지로 이동 →
            </button>
            <button
              onClick={() => toggleLike(benefitId)}
              style={{
                padding: "15px 24px",
                borderRadius: 12,
                border: `1.5px solid ${liked ? "#FECACA" : "var(--color-border)"}`,
                background: liked ? "#FFF5F5" : "transparent",
                color: liked ? "#DC2626" : "var(--color-muted-foreground)",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                transition: "all 0.2s",
              }}
            >
              {liked ? "찜됨" : "찜하기"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "20px 0", display: "flex", gap: 24 }}>
      <div style={{ width: 100, flexShrink: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-muted-foreground)", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {title}
        </p>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--color-border)" }} />;
}
