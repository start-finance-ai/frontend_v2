import type { Benefit } from "../data/benefits";

interface BenefitDetailPageProps {
  benefit: Benefit;
  liked: boolean;
  onToggleLike: () => void;
  goBack: () => void;
  goAgent?: () => void;
}

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  대출: { bg: "#EEF2FF", text: "#1B4DFF" },
  정부지원: { bg: "#ECFDF5", text: "#059669" },
  은행상품: { bg: "#FEF3C7", text: "#D97706" },
  지자체: { bg: "#F3E8FF", text: "#7C3AED" },
};

const DETAIL_DATA: Record<number, {
  fullDesc: string;
  eligibility: string[];
  period: string;
  deadline: string;
  howToApply: string[];
  institution: string;
  amount: string;
}> = {
  1: {
    fullDesc: "경영 위기를 겪고 있는 소상공인에게 긴급 운전자금을 지원하여 사업 지속성을 확보하고 고용 유지를 돕는 정부 직접 지원 사업입니다.",
    eligibility: ["사업자등록 후 1년 이상 운영한 소상공인", "매출액 10억원 이하 사업체", "국세·지방세 체납이 없는 사업자", "금융기관 연체 이력이 없는 자"],
    period: "2025년 1월 2일 ~ 2025년 8월 24일",
    deadline: "D-3",
    howToApply: ["소상공인시장진흥공단 홈페이지 접속", "온라인 신청서 작성 및 제출", "사업자등록증, 매출 증빙 서류 첨부", "심사 후 14일 이내 결과 통보"],
    institution: "소상공인시장진흥공단",
    amount: "최대 2,000만원 (무이자)",
  },
  2: {
    fullDesc: "만 39세 이하 청년 예비창업자 및 초기창업자의 도전적 창업을 장려하고 사업화 역량을 강화하기 위해 저금리 정책 융자를 지원합니다.",
    eligibility: ["만 39세 이하 예비창업자 또는 창업 3년 이내 초기창업자", "업력 3년 미만 중소기업 해당 업종", "대표자 본인이 주된 사업 운영자"],
    period: "상시 접수 (예산 소진 시 마감)",
    deadline: "D-14",
    howToApply: ["중소벤처기업부 창업지원포털 접속", "청년창업사관학교 신청서 제출", "사업계획서 작성 및 발표 심사", "선정 후 자금 지원 협약 체결"],
    institution: "중소기업진흥공단",
    amount: "최대 1억원 (연 2.5% 고정금리)",
  },
  3: {
    fullDesc: "서울시 거주 프리랜서의 직업역량 강화를 위해 교육훈련비를 바우처 형태로 지원합니다. 온·오프라인 강좌 모두 활용 가능합니다.",
    eligibility: ["서울시 거주 프리랜서", "최근 1년 이내 프리랜서 활동 증빙 가능한 자", "연 소득 5,000만원 이하"],
    period: "2025년 3월 1일 ~ 2025년 8월 28일",
    deadline: "D-7",
    howToApply: ["서울일자리포털 회원가입 및 로그인", "프리랜서 직무역량 바우처 신청 클릭", "활동 증빙 서류 업로드", "선정 후 바우처 코드 발급"],
    institution: "서울특별시",
    amount: "최대 200만원 (바우처)",
  },
};

export default function BenefitDetailPage({ benefit, liked, onToggleLike, goBack, goAgent }: BenefitDetailPageProps) {
  const tagStyle = TAG_COLORS[benefit.tag] ?? { bg: "#F0F2F7", text: "#7A849A" };
  const detail = DETAIL_DATA[benefit.id] ?? {
    fullDesc: benefit.summary,
    eligibility: ["신청 대상: " + benefit.target],
    period: "공고 참조",
    deadline: benefit.deadline != null ? `D-${benefit.deadline}` : "공고 참조",
    howToApply: ["해당 기관 홈페이지 또는 방문 신청"],
    institution: "주관 기관 확인 필요",
    amount: benefit.amount ?? "공고 참조",
  };

  const isUrgent = benefit.status === "신청 가능" && benefit.deadline != null && benefit.deadline <= 7;

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 80px" }}>
      {/* Back button */}
      <div style={{ padding: "28px 0 20px" }}>
        <button
          onClick={goBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            background: "#fff",
            fontSize: 13,
            color: "var(--color-muted-foreground)",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          목록으로
        </button>
      </div>

      {/* Header card */}
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--color-border)",
          borderRadius: 16,
          padding: "32px",
          marginBottom: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 6,
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
                  borderRadius: 6,
                  background: "#FEF2F2",
                  color: "#DC2626",
                }}
              >
                마감 임박 D-{benefit.deadline}
              </span>
            )}
          </div>

          <button
            onClick={onToggleLike}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 9,
              border: `1.5px solid ${liked ? "#FCA5A5" : "var(--color-border)"}`,
              background: liked ? "#FEF2F2" : "#fff",
              color: liked ? "#DC2626" : "var(--color-muted-foreground)",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              transition: "all 0.15s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
              <path d="M9 15.5C9 15.5 2 11 2 6.5C2 4.567 3.567 3 5.5 3C6.77 3 7.893 3.677 8.5 4.704C8.5 4.704 8.5 4.704 9 5.5C9.5 4.704 9.5 4.704 9.5 4.704C10.107 3.677 11.23 3 12.5 3C14.433 3 16 4.567 16 6.5C16 11 9 15.5 9 15.5Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {liked ? "찜 완료" : "찜하기"}
          </button>
        </div>

        <h1 style={{ fontWeight: 800, fontSize: 24, margin: "0 0 10px", letterSpacing: "-0.5px", lineHeight: 1.3 }}>
          {benefit.title}
        </h1>
        <p style={{ fontSize: 15, color: "var(--color-muted-foreground)", margin: "0 0 24px", lineHeight: 1.6 }}>
          {detail.fullDesc}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "지원 금액", value: detail.amount },
            { label: "주관 기관", value: detail.institution },
            { label: "신청 상태", value: isUrgent ? `D-${benefit.deadline} (마감 임박)` : benefit.status },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                padding: "14px 16px",
                borderRadius: 10,
                background: "var(--color-muted)",
                border: "1px solid var(--color-border)",
              }}
            >
              <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", margin: "0 0 4px" }}>{label}</p>
              <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detail sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <DetailSection title="지원 대상">
          <ul style={{ margin: 0, padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: 8 }}>
            {detail.eligibility.map((item, i) => (
              <li key={i} style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-foreground)" }}>{item}</li>
            ))}
          </ul>
        </DetailSection>

        <DetailSection title="신청 기간">
          <p style={{ fontSize: 14, margin: 0, color: "var(--color-foreground)", fontWeight: 500 }}>{detail.period}</p>
        </DetailSection>

        <DetailSection title="신청 방법">
          <ol style={{ margin: 0, padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: 10 }}>
            {detail.howToApply.map((step, i) => (
              <li key={i} style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-foreground)" }}>
                <span style={{ fontWeight: 600 }}>단계 {i + 1}.</span> {step}
              </li>
            ))}
          </ol>
        </DetailSection>
      </div>

      {/* CTA */}
      <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          style={{
            flex: 2, minWidth: 160,
            padding: "14px",
            borderRadius: 12,
            border: "none",
            background: "var(--color-primary)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1640D6")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-primary)")}
        >
          신청 페이지로 이동 →
        </button>
        <button
          onClick={goAgent}
          style={{
            flex: 1, minWidth: 140,
            padding: "14px 16px",
            borderRadius: 12,
            border: "1.5px solid #C7D2FE",
            background: "#EEF2FF",
            color: "#1B4DFF",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "#1B4DFF"; el.style.color = "#fff"; el.style.borderColor = "#1B4DFF"; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "#EEF2FF"; el.style.color = "#1B4DFF"; el.style.borderColor = "#C7D2FE"; }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 2L9.5 6.5H14.5L10.5 9.5L12 14L8 11L4 14L5.5 9.5L1.5 6.5H6.5L8 2Z" fill="currentColor" /></svg>
          AI에게 물어보기
        </button>
        <button
          style={{
            padding: "14px 18px",
            borderRadius: 12,
            border: "1.5px solid var(--color-border)",
            background: "#fff",
            color: "var(--color-foreground)",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
          }}
        >
          공유하기
        </button>
      </div>
    </main>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--color-border)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-muted)",
        }}
      >
        <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{title}</p>
      </div>
      <div style={{ padding: "18px 20px" }}>{children}</div>
    </div>
  );
}
