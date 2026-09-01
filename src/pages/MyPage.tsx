import { useState } from "react";
import { ALL_BENEFITS, type Benefit } from "../data/benefits";
import BenefitCard from "../components/BenefitCard";
import type { CategoryType, ProfileData } from "../constants";
import { TYPE_BADGE } from "../constants";

interface MyPageProps {
  likedIds: Set<number>;
  toggleLike: (id: number) => void;
  profile: ProfileData;
  setProfile: (p: ProfileData) => void;
}

interface SimForm {
  needed: string;
  owned: string;
  equity: string;
  sales: string;
  expense: string;
  loan: string;
  rate: string;
  period: string;
}

const INITIAL_SIM: SimForm = {
  needed: "",
  owned: "",
  equity: "",
  sales: "",
  expense: "",
  loan: "",
  rate: "",
  period: "",
};

const USER_TYPES: { type: CategoryType }[] = [
  { type: "예비창업자" },
  { type: "소상공인" },
  { type: "프리랜서" },
];

const STAGE_OPTIONS: Record<CategoryType, string[]> = {
  예비창업자: ["아이디어 구상 중", "사업계획 작성 중", "창업 준비 거의 완료"],
  소상공인:   ["창업 1년 미만", "창업 1~3년", "창업 3년 이상"],
  프리랜서:   ["활동 1년 미만", "활동 1~3년", "활동 3년 이상"],
};

/* ─── shared style helpers ─── */
const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 16,
  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
};

const labelSm: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#6B7280",
  margin: 0,
  letterSpacing: "-0.1px",
};

const inputBase: React.CSSProperties = {
  width: "100%",
  padding: "10px 13px",
  borderRadius: 9,
  border: "1.5px solid #E5E7EB",
  fontSize: 14,
  fontFamily: "var(--font-sans)",
  outline: "none",
  color: "#111827",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
  background: "#fff",
};

/* ─── SimField ─── */
interface SimFieldProps {
  label: string;
  unit: string;
  required?: boolean;
  tipKey: string;
  activeTip: string | null;
  setTip: (k: string | null) => void;
  tipText: string;
  value: string;
  onChange: (v: string) => void;
  inputBase: React.CSSProperties;
  labelSm: React.CSSProperties;
}
function SimField({ label, unit, required, tipKey, activeTip, setTip, tipText, value, onChange, inputBase, labelSm }: SimFieldProps) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
        <span style={{ ...labelSm }}>{label}</span>
        {required && <span style={{ fontSize: 9, fontWeight: 700, color: "#1B4DFF", background: "#EEF2FF", padding: "1px 5px", borderRadius: 4 }}>필수</span>}
        <div style={{ position: "relative", display: "inline-flex" }}>
          <button type="button" onClick={() => setTip(activeTip === tipKey ? null : tipKey)}
            style={{ width: 15, height: 15, borderRadius: "50%", border: "1.5px solid #D1D5DB", background: "#F9FAFB", color: "#9CA3AF", fontSize: 9, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, fontFamily: "var(--font-sans)", lineHeight: 1 }}
          >?</button>
          {activeTip === tipKey && (
            <div style={{ position: "absolute", left: 20, top: -4, zIndex: 200, background: "#1F2937", color: "#fff", fontSize: 11, lineHeight: 1.55, padding: "8px 12px", borderRadius: 8, width: 200, boxShadow: "0 4px 16px rgba(0,0,0,0.18)", whiteSpace: "normal" }}>
              {tipText}
              <div style={{ position: "absolute", left: -5, top: 10, width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderRight: "5px solid #1F2937" }} />
            </div>
          )}
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <input type="number" value={value} placeholder="0"
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputBase, paddingRight: 44 }}
          onFocus={(e) => (e.target.style.borderColor = "#1B4DFF")}
          onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
        />
        <span style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#9CA3AF", fontWeight: 500, pointerEvents: "none" }}>{unit}</span>
      </div>
    </div>
  );
}

/* ─── RunwayBar ─── */
function RunwayBar({ months }: { months: number }) {
  const stable = months >= 999;
  const displayMonths = stable ? 36 : Math.min(months, 48);
  const maxMonths = Math.max(Math.ceil(displayMonths / 6) * 6 + 6, 24);
  const pct = stable ? 98 : Math.min((displayMonths / maxMonths) * 100, 96);

  /* 눈금: 6개월 단위, 마지막 눈금은 소진 시점 */
  const ticksSet = new Set<number>();
  for (let m = 6; m < maxMonths; m += 6) ticksSet.add(m);
  if (!stable) ticksSet.add(displayMonths);
  const ticks = Array.from(ticksSet).sort((a, b) => a - b);

  const dangerColor = stable ? "#059669" : months < 6 ? "#DC2626" : months < 12 ? "#C2410C" : "#B45309";

  return (
    <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 16, padding: "24px 24px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 20px", letterSpacing: "-0.2px" }}>버티는 기간</p>

      {/* 눈금 라벨 — overflow hidden 방지용 padding */}
      <div style={{ position: "relative", height: 18, marginBottom: 6, overflow: "visible" }}>
        {ticks.map((t) => {
          const leftPct = (t / maxMonths) * 100;
          const isEnd = !stable && t === displayMonths;
          /* 오른쪽에 가까운 눈금은 왼쪽 정렬, 왼쪽은 중앙, 첫 눈금은 오른쪽 정렬 방지 */
          const align = leftPct >= 88 ? "translateX(-100%)" : leftPct <= 6 ? "translateX(0%)" : "translateX(-50%)";
          return (
            <span key={t} style={{
              position: "absolute",
              left: `${leftPct}%`,
              transform: align,
              fontSize: 10,
              fontWeight: isEnd ? 700 : 400,
              color: isEnd ? dangerColor : "#9CA3AF",
              whiteSpace: "nowrap",
              lineHeight: 1,
            }}>
              {t}개월{isEnd ? " ▼" : ""}
            </span>
          );
        })}
      </div>

      {/* 바 + 소진 배지 */}
      <div style={{ position: "relative" }}>
        {/* 소진 시점 배지 — 바 위에 floating */}
        {!stable && (
          <div style={{
            position: "absolute",
            left: `${pct}%`,
            transform: pct >= 80 ? "translateX(-100%)" : "translateX(-50%)",
            bottom: "calc(100% + 6px)",
            background: dangerColor,
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: 6,
            whiteSpace: "nowrap",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}>
            {months}개월 후 현금 소진
            <div style={{ position: "absolute", bottom: -4, left: pct >= 80 ? "auto" : "50%", right: pct >= 80 ? 12 : "auto", transform: pct >= 80 ? "none" : "translateX(-50%)", width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: `4px solid ${dangerColor}` }} />
          </div>
        )}

        {/* 막대 */}
        <div style={{ position: "relative", height: 22, borderRadius: 99, background: "#F3F4F6", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 99,
            background: stable
              ? "linear-gradient(90deg, #22C55E 0%, #059669 100%)"
              : "linear-gradient(90deg, #22C55E 0%, #DC2626 100%)",
            transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
          }} />
        </div>

        {/* 소진 마커 선 */}
        {!stable && (
          <div style={{
            position: "absolute",
            top: -2, bottom: -2,
            left: `${pct}%`,
            transform: "translateX(-1px)",
            width: 2,
            background: dangerColor,
            borderRadius: 2,
          }} />
        )}
      </div>

      {/* 축 라벨 */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>현재</span>
        <span style={{ fontSize: 11, color: dangerColor, fontWeight: 700, whiteSpace: "nowrap" }}>
          {stable ? "자금 여유 충분" : `${months}개월 후 소진`}
        </span>
      </div>
    </div>
  );
}

/* ─── RecommendedPrograms ─── */
interface Program { title: string; desc: string; target: string; tag: string; tagColor: string; tagBg: string; }

function RecommendedPrograms({ months, hasLoan }: { months: number; hasLoan: boolean }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const urgent = months < 12;
  const programs: Program[] = urgent ? [
    { title: "소상공인 경영위기 긴급자금", desc: "", target: "예비·초기창업자", tag: "긴급", tagColor: "#DC2626", tagBg: "#FEF2F2" },
    { title: "중소벤처기업부 재도전 지원", desc: "", target: "예비창업자", tag: "정부지원", tagColor: "#059669", tagBg: "#ECFDF5" },
    { title: "창업 초기 경영 컨설팅 지원", desc: "", target: "3년 미만 창업자", tag: "컨설팅", tagColor: "#7C3AED", tagBg: "#F3E8FF" },
  ] : hasLoan ? [
    { title: "소진공 소상공인 정책자금", desc: "", target: "예비·초기창업자", tag: "저금리대출", tagColor: "#1B4DFF", tagBg: "#EEF2FF" },
    { title: "신용보증기금 창업기업 보증", desc: "", target: "사업자등록 예정자", tag: "보증지원", tagColor: "#059669", tagBg: "#ECFDF5" },
    { title: "소상공인 창업패키지", desc: "", target: "예비창업자", tag: "정부지원", tagColor: "#D97706", tagBg: "#FFFBEB" },
  ] : [
    { title: "소상공인 창업패키지", desc: "", target: "예비창업자", tag: "정부지원", tagColor: "#D97706", tagBg: "#FFFBEB" },
    { title: "청년창업사관학교", desc: "", target: "만 39세 이하", tag: "청년", tagColor: "#1B4DFF", tagBg: "#EEF2FF" },
    { title: "창업 초기 경영 컨설팅 지원", desc: "", target: "3년 미만 창업자", tag: "컨설팅", tagColor: "#7C3AED", tagBg: "#F3E8FF" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0, letterSpacing: "-0.3px" }}>
        지금 상황에 도움이 될 수 있는 지원사업
      </p>
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, overflow: "hidden" }}>
        {programs.map((p, i) => {
          const hovered = hoveredIdx === i;
          return (
            <div key={p.title}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px",
                borderTop: i > 0 ? "1px solid #F3F4F6" : "none",
                background: hovered ? "#F8FAFF" : "#fff",
                transition: "background 0.13s",
                cursor: "default",
              }}
            >
              <div style={{ width: 28, height: 28, borderRadius: 7, background: p.tagBg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="2" stroke={p.tagColor} strokeWidth="1.3"/><path d="M4 6h4M6 4v4" stroke={p.tagColor} strokeWidth="1.3" strokeLinecap="round"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 7 }}>
                <p style={{ fontWeight: 600, fontSize: 12, margin: 0, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</p>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: p.tagBg, color: p.tagColor, flexShrink: 0 }}>{p.tag}</span>
                <span style={{ fontSize: 10, color: "#9CA3AF", whiteSpace: "nowrap", flexShrink: 0 }}>대상: {p.target}</span>
              </div>
              <button
                style={{
                  flexShrink: 0, padding: "4px 10px", borderRadius: 6,
                  border: "1.5px solid #C7D2FE", background: "#EEF2FF",
                  fontSize: 11, fontWeight: 600, color: "#1B4DFF",
                  cursor: "pointer", fontFamily: "var(--font-sans)", whiteSpace: "nowrap",
                  opacity: hovered ? 1 : 0,
                  transition: "opacity 0.15s",
                  pointerEvents: hovered ? "auto" : "none",
                }}
              >자세히 보기</button>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 10, color: "#B0B8C8", margin: "6px 0 0", lineHeight: 1.5 }}>
        위 추천은 참고용이며 실제 자격 여부는 공식 출처를 통해 확인해주세요.
      </p>
    </div>
  );
}

/* ─── Section / EmptyState ─── */
function Section({ title, sub, badge, children }: { title: string; sub: string; emoji?: string; badge?: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 52 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 4, height: 22, borderRadius: 2, background: "linear-gradient(180deg,#1B4DFF,#6366F1)", marginTop: 2, flexShrink: 0 }} />
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 style={{ fontWeight: 700, fontSize: 18, margin: 0, letterSpacing: "-0.4px", color: "#111827" }}>{title}</h2>
            {badge && <span style={{ padding: "2px 9px", borderRadius: 99, background: "#EEF2FF", color: "#1B4DFF", fontSize: 11, fontWeight: 700 }}>{badge}</span>}
          </div>
          <p style={{ fontSize: 12, color: "#6B7280", margin: "3px 0 0" }}>{sub}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "48px 24px", textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
      {msg}
    </div>
  );
}

/* ─── Main component ─── */
export default function MyPage({ likedIds, toggleLike, profile, setProfile }: MyPageProps) {
  const [selectedBenefitId, setSelectedBenefitId] = useState<number | null>(1);
  const [sim, setSim] = useState<SimForm>(INITIAL_SIM);
  const [simResult, setSimResult] = useState<{ debt: number; months: number; monthlyNet: number } | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [salesUploaded, setSalesUploaded] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [draftProfile, setDraftProfile] = useState<ProfileData>(profile);
  // 프리랜서 소득 안정성 분석 — 6개월 월별
  const MONTHS_KR = ["1월", "2월", "3월", "4월", "5월", "6월"];
  const [monthlyIncome, setMonthlyIncome] = useState<string[]>(["", "", "", "", "", ""]);
  const [freeResult, setFreeResult] = useState<{
    avg: number; cv: number; min: number; max: number; stability: string; color: string;
  } | null>(null);

  const likedBenefits = ALL_BENEFITS.filter((b) => likedIds.has(b.id));
  const selectedBenefit: Benefit | undefined =
    likedBenefits.find((b) => b.id === selectedBenefitId) ?? likedBenefits[0];

  const runSim = () => {
    const owned = Number(sim.owned) || 0;
    const sales = Number(sim.sales) || 0;
    const expense = Number(sim.expense) || 0;
    const loan = Number(sim.loan) || 0;
    const rate = Number(sim.rate) / 100 / 12;
    const period = Number(sim.period) || 0;
    const monthlyRepay = loan > 0 && period > 0
      ? loan / period + loan * rate
      : loan > 0 ? loan * rate : 0;
    const monthlyNet = sales - expense - monthlyRepay;
    const runway = monthlyNet >= 0 ? 999 : (owned > 0 ? Math.floor(owned / Math.abs(monthlyNet)) : 0);
    const totalDebt = loan + (monthlyNet < 0 ? Math.abs(monthlyNet) * Math.min(runway, 36) : 0);
    setSimResult({ debt: Math.round(totalDebt), months: Math.max(0, runway), monthlyNet: Math.round(monthlyNet) });
  };

  const simFilledCount = Object.values(sim).filter(v => v.trim() !== "").length;

  const openEdit = () => { setDraftProfile({ ...profile }); setEditingProfile(true); };
  const saveEdit = () => { setProfile({ ...draftProfile }); setEditingProfile(false); };

  const badge = TYPE_BADGE[profile.userType] ?? TYPE_BADGE["예비창업자"];

  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 24px 96px" }}>

      {/* ── Edit modal ── */}
      {editingProfile && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(10,16,30,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditingProfile(false); }}
        >
          <div style={{ background: "#fff", borderRadius: 20, padding: "36px 40px", width: "100%", maxWidth: 520, boxShadow: "0 32px 80px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <h2 style={{ fontWeight: 800, fontSize: 20, margin: 0, letterSpacing: "-0.5px" }}>내 정보 수정</h2>
              <button onClick={() => setEditingProfile(false)} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "#F3F4F6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280", transition: "background 0.15s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#E5E7EB")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6")}
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {/* 유형 */}
              <div>
                <p style={{ ...labelSm, marginBottom: 10 }}>사업자 유형</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {USER_TYPES.map(({ type }) => {
                    const sel = draftProfile.userType === type;
                    const c = TYPE_BADGE[type];
                    return (
                      <button key={type} onClick={() => setDraftProfile((p) => ({ ...p, userType: type, stage: STAGE_OPTIONS[type][0] }))}
                        style={{ flex: 1, padding: "12px 8px", borderRadius: 11, border: `2px solid ${sel ? c.color : "#E5E7EB"}`, background: sel ? c.bg : "#fff", cursor: "pointer", fontFamily: "var(--font-sans)", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, transition: "all 0.14s" }}>
                        <span style={{ fontSize: 12, fontWeight: sel ? 700 : 500, color: sel ? c.color : "#6B7280" }}>{type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 텍스트 필드 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[
                  { label: "이름", key: "name", full: true },
                  { label: "지역", key: "region", full: false },
                  { label: "업종", key: "industry", full: false },
                  { label: "예상 자본금", key: "capital", full: false },
                ].map(({ label, key, full }) => (
                  <div key={key} style={{ gridColumn: full ? "1 / -1" : "auto" }}>
                    <label style={{ ...labelSm, display: "block", marginBottom: 6 }}>{label}</label>
                    <input type="text" value={(draftProfile[key as keyof ProfileData] as string) ?? ""}
                      onChange={(e) => setDraftProfile((p) => ({ ...p, [key]: e.target.value }))}
                      style={inputBase}
                      onFocus={(e) => (e.target.style.borderColor = "#1B4DFF")}
                      onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                    />
                  </div>
                ))}
              </div>

              {/* 사업 단계 */}
              <div>
                <label style={{ ...labelSm, display: "block", marginBottom: 8 }}>사업 단계</label>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {STAGE_OPTIONS[draftProfile.userType].map((option) => {
                    const sel = draftProfile.stage === option;
                    const c = TYPE_BADGE[draftProfile.userType];
                    return (
                      <button key={option} type="button" onClick={() => setDraftProfile((p) => ({ ...p, stage: option }))}
                        style={{ padding: "8px 14px", borderRadius: 9, border: `1.5px solid ${sel ? c.color : "#E5E7EB"}`, background: sel ? c.bg : "#fff", color: sel ? c.color : "#6B7280", fontWeight: sel ? 700 : 500, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.14s", whiteSpace: "nowrap" }}>
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
              <button onClick={() => setEditingProfile(false)}
                style={{ flex: 1, padding: "13px", borderRadius: 11, border: "1.5px solid #E5E7EB", background: "transparent", color: "#6B7280", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.14s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "#D1D5DB")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB")}
              >취소</button>
              <button onClick={saveEdit}
                style={{ flex: 2, padding: "13px", borderRadius: 11, border: "none", background: "#1B4DFF", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "var(--font-sans)", letterSpacing: "-0.1px", transition: "background 0.14s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1640D6")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1B4DFF")}
              >저장하기</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Profile card ── */}
      <div style={{ ...card, padding: "28px 32px", display: "flex", alignItems: "center", gap: 24, marginBottom: 40 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: badge.bg, border: `2px solid ${badge.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22, fontWeight: 800, color: badge.color }}>
          {profile.name.slice(0, 1)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px" }}>{profile.name}</span>
            <span style={{ padding: "3px 10px", borderRadius: 99, background: badge.bg, color: badge.color, fontSize: 12, fontWeight: 700 }}>{profile.userType}</span>
          </div>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[
              { label: "사업 단계", value: profile.stage },
              { label: "지역", value: profile.region },
              { label: "예상 자본금", value: profile.capital },
              { label: "업종", value: profile.industry },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={labelSm}>{label}</p>
                <p style={{ fontSize: 14, fontWeight: 600, margin: "3px 0 0", color: "#111827", letterSpacing: "-0.1px" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
        <button onClick={openEdit}
          style={{ padding: "9px 18px", borderRadius: 9, border: "1.5px solid #E5E7EB", background: "transparent", fontSize: 13, fontWeight: 500, color: "#6B7280", cursor: "pointer", fontFamily: "var(--font-sans)", flexShrink: 0, transition: "all 0.14s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#1B4DFF"; (e.currentTarget as HTMLButtonElement).style.color = "#1B4DFF"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLButtonElement).style.color = "#6B7280"; }}
        >정보 수정</button>
      </div>



      {/* ── Section C — 리스크 계산기 (예비창업자) ── */}
      {profile.userType === "예비창업자" && (
        <Section title="리스크 계산기" sub="최악의 경우를 미리 계산해 준비하세요" badge="예비창업자 전용">
          {/* tooltip overlay */}
          {tooltip && (
            <div onClick={() => setTooltip(null)} style={{ position: "fixed", inset: 0, zIndex: 100 }} />
          )}
          <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 20, alignItems: "stretch", position: "relative" }}>

            {/* ─ 왼쪽: 입력 폼 ─ */}
            <div style={{ ...card, padding: "28px 28px 24px" }}>
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 5px", letterSpacing: "-0.3px" }}>재무 정보를 입력해주세요</p>
                <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0, lineHeight: 1.55 }}>핵심 항목 3개 이상만 입력해도 분석이 가능합니다</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                <SimField
                  label="필요 자금" unit="만원"
                  tipKey="needed" activeTip={tooltip} setTip={setTooltip}
                  tipText="사업에 필요한 총 자금입니다. 임차보증금, 초도비용 등을 합산해주세요."
                  value={sim.needed}
                  onChange={(v) => { setSim((p) => ({ ...p, needed: v })); setSimResult(null); }}
                  inputBase={inputBase} labelSm={labelSm}
                />

                <SimField
                  label="보유 자금" unit="만원"
                  tipKey="owned" activeTip={tooltip} setTip={setTooltip}
                  tipText="현재 본인이 보유한 사업 가용 현금성 자금입니다."
                  value={sim.owned}
                  onChange={(v) => { setSim((p) => ({ ...p, owned: v })); setSimResult(null); }}
                  inputBase={inputBase} labelSm={labelSm}
                />

                <SimField
                  label="자기자본" unit="만원"
                  tipKey="equity" activeTip={tooltip} setTip={setTooltip}
                  tipText="총 자산에서 부채를 뺀 순자산입니다. 부동산·설비 등 비유동자산 포함 가능합니다."
                  value={sim.equity}
                  onChange={(v) => { setSim((p) => ({ ...p, equity: v })); setSimResult(null); }}
                  inputBase={inputBase} labelSm={labelSm}
                />

                <SimField
                  label="월평균 매출·수입" unit="만원"
                  tipKey="sales" activeTip={tooltip} setTip={setTooltip}
                  tipText="최근 3개월 월평균 매출 또는 수입입니다. 예비창업자는 예상 수치를 입력하세요."
                  value={sim.sales}
                  onChange={(v) => { setSim((p) => ({ ...p, sales: v })); setSimResult(null); }}
                  inputBase={inputBase} labelSm={labelSm}
                />

                <SimField
                  label="월평균 지출" unit="만원"
                  tipKey="expense" activeTip={tooltip} setTip={setTooltip}
                  tipText="최근 3개월 월평균 사업 관련 총 지출입니다. 임차료, 인건비, 재료비 등."
                  value={sim.expense}
                  onChange={(v) => { setSim((p) => ({ ...p, expense: v })); setSimResult(null); }}
                  inputBase={inputBase} labelSm={labelSm}
                />

                <SimField
                  label="현재 대출금" unit="만원"
                  tipKey="loan" activeTip={tooltip} setTip={setTooltip}
                  tipText="현재 보유한 사업 관련 대출 잔액입니다. 없으면 0 또는 빈칸."
                  value={sim.loan}
                  onChange={(v) => { setSim((p) => ({ ...p, loan: v })); setSimResult(null); }}
                  inputBase={inputBase} labelSm={labelSm}
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <SimField
                    label="현재 대출 금리" unit="%"
                    tipKey="rate" activeTip={tooltip} setTip={setTooltip}
                    tipText="연 이자율입니다. 정책자금은 2~4%, 은행권은 4~7% 수준입니다."
                    value={sim.rate}
                    onChange={(v) => { setSim((p) => ({ ...p, rate: v })); setSimResult(null); }}
                    inputBase={inputBase} labelSm={labelSm}
                  />
                  <SimField
                    label="원하는 상환기간" unit="개월"
                    tipKey="period" activeTip={tooltip} setTip={setTooltip}
                    tipText="대출을 나눠 갚을 기간입니다. 36개월(3년)이 일반적입니다."
                    value={sim.period}
                    onChange={(v) => { setSim((p) => ({ ...p, period: v })); setSimResult(null); }}
                    inputBase={inputBase} labelSm={labelSm}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, marginBottom: 14 }}>
                <span style={{ fontSize: 11, color: simFilledCount >= 3 ? "#1B4DFF" : "#9CA3AF", fontWeight: 600 }}>
                  {simFilledCount} / 7 항목 입력됨
                </span>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setSim(INITIAL_SIM); setSimResult(null); }}
                  style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "transparent", color: "#6B7280", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.14s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#D1D5DB"; (e.currentTarget as HTMLButtonElement).style.color = "#374151"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLButtonElement).style.color = "#6B7280"; }}
                >입력 초기화</button>
                <button onClick={runSim} disabled={simFilledCount < 3}
                  style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: simFilledCount >= 3 ? "#1B4DFF" : "#E5E7EB", color: simFilledCount >= 3 ? "#fff" : "#9CA3AF", fontWeight: 700, fontSize: 14, cursor: simFilledCount >= 3 ? "pointer" : "default", fontFamily: "var(--font-sans)", transition: "all 0.14s" }}
                  onMouseEnter={(e) => { if (simFilledCount >= 3) (e.currentTarget as HTMLButtonElement).style.background = "#1640D6"; }}
                  onMouseLeave={(e) => { if (simFilledCount >= 3) (e.currentTarget as HTMLButtonElement).style.background = "#1B4DFF"; }}
                >결과 계산하기</button>
              </div>
            </div>

            {/* ─ 오른쪽: 결과 ─ */}
            {simResult ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, justifyContent: "space-between" }}>

                {/* 상단 강조 카드 2개 */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ ...card, padding: "16px 18px", borderColor: "#FECACA" }}>
                    <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0, fontWeight: 600 }}>예상 총 부채</p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: "#DC2626", margin: "5px 0 3px", letterSpacing: "-0.7px" }}>
                      {simResult.debt > 0 ? `${simResult.debt.toLocaleString()}만원` : "없음"}
                    </p>
                    <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>
                      {simResult.monthlyNet < 0 ? `월 ${Math.abs(simResult.monthlyNet).toLocaleString()}만원 적자 기준` : "월 흑자 구조"}
                    </p>
                  </div>
                  <div style={{ ...card, padding: "16px 18px", borderColor: simResult.months < 12 ? "#FECACA" : "#FDE68A" }}>
                    <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0, fontWeight: 600 }}>버틸 수 있는 기간</p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: simResult.months >= 999 ? "#059669" : simResult.months < 12 ? "#DC2626" : "#D97706", margin: "5px 0 3px", letterSpacing: "-0.7px" }}>
                      {simResult.months >= 999 ? "안정적" : `${simResult.months}개월`}
                    </p>
                    <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>
                      보유 자금 {Number(sim.owned).toLocaleString()}만원 소진 기준
                    </p>
                  </div>
                </div>

                {/* 런웨이 바 */}
                <RunwayBar months={simResult.months} />

                {/* 인사이트 */}
                <div style={{ ...card, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    simResult.monthlyNet < 0
                      ? `📌 월 ${Math.abs(simResult.monthlyNet).toLocaleString()}만원 적자가 예상됩니다. 지출 항목을 점검해보세요.`
                      : "현재 입력 기준으로는 월 흑자 구조입니다.",
                    simResult.months < 6
                      ? "버티는 기간이 6개월 미만입니다. 초기 비용 절감 또는 외부 자금 조달을 검토하세요."
                      : simResult.months < 18
                        ? "버티는 기간이 18개월 미만입니다. 정부지원 자금을 적극 활용하는 것을 권장합니다."
                        : "버티는 기간이 충분한 편입니다. 매출 성장 계획을 구체화해보세요.",
                  ].map((txt, i) => (
                    <p key={i} style={{ fontSize: 12, color: "#374151", margin: 0, lineHeight: 1.6 }}>{txt}</p>
                  ))}
                </div>

                {/* 면책 문구 — 인사이트 바로 아래 */}
                <p style={{ fontSize: 10, color: "#A8AFBC", margin: "-4px 0 0", lineHeight: 1.5 }}>
                  본 계산기는 최악의 시나리오 기준으로 산출된 결과이며, 정확한 상담은 전문가와 진행하시기 바랍니다.
                </p>

                {/* 추천 지원사업 */}
                <RecommendedPrograms months={simResult.months} hasLoan={Number(sim.loan) > 0} />
              </div>
            ) : (
              <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 32px", gap: 12, textAlign: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="10" width="4" height="8" rx="1" fill="#1B4DFF" opacity="0.4"/><rect x="8" y="6" width="4" height="12" rx="1" fill="#1B4DFF" opacity="0.7"/><rect x="14" y="2" width="4" height="16" rx="1" fill="#1B4DFF"/></svg>
                </div>
                <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: "#111827" }}>조건을 입력하고 계산해보세요</p>
                <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0, lineHeight: 1.6 }}>최악의 시나리오를 미리 파악하면<br />훨씬 단단한 창업 준비가 가능합니다.</p>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ── Section D — 매출장표 분석 (소상공인) ── */}
      {profile.userType === "소상공인" && (
        <Section title="매출장표 분석" sub="매출 데이터를 업로드하면 AI가 패턴을 분석해드려요" badge="소상공인 전용">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div onClick={() => setSalesUploaded(true)}
              style={{ ...card, padding: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, cursor: "pointer", border: salesUploaded ? "1.5px solid #1B4DFF" : "2px dashed #E5E7EB", transition: "all 0.2s" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: salesUploaded ? "#EEF2FF" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {salesUploaded
                  ? <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 11L9 16L18 7" stroke="#1B4DFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 14v3a1 1 0 001 1h12a1 1 0 001-1v-3M11 4v10M8 7l3-3 3 3" stroke="#9CA3AF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                }
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: salesUploaded ? "#1B4DFF" : "#111827" }}>
                  {salesUploaded ? "매출장표 업로드 완료" : "매출장표 파일 업로드"}
                </p>
                <p style={{ fontSize: 12, color: "#6B7280", margin: "5px 0 0", lineHeight: 1.5 }}>
                  {salesUploaded ? "2025년 1월~6월 데이터 (6개월)" : "엑셀, CSV, 국세청 자료 지원"}
                </p>
              </div>
              {!salesUploaded && (
                <button style={{ padding: "9px 22px", borderRadius: 9, border: "none", background: "#1B4DFF", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                  파일 선택
                </button>
              )}
            </div>

            <div style={{ ...card, padding: 24, opacity: salesUploaded ? 1 : 0.4, transition: "opacity 0.3s" }}>
              <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 16px" }}>분석 요약</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "월 평균 매출", value: "287만원", trend: "+3.2%", up: true },
                  { label: "매출 최고월", value: "3월 (412만원)", trend: "", up: true },
                  { label: "매출 최저월", value: "6월 (198만원)", trend: "-12%", up: false },
                  { label: "전년 동기 대비", value: "+8.4%", trend: "성장세", up: true },
                ].map(({ label, value, trend, up }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 9, background: "#F9FAFB" }}>
                    <span style={{ fontSize: 13, color: "#6B7280" }}>{label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{value}</span>
                      {trend && <span style={{ fontSize: 11, fontWeight: 600, color: up ? "#059669" : "#DC2626" }}>{trend}</span>}
                    </div>
                  </div>
                ))}
              </div>
              {salesUploaded && (
                <div style={{ marginTop: 14, padding: "13px 16px", borderRadius: 10, background: "#EEF2FF", border: "1px solid #C7D2FE" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#1B4DFF", margin: "0 0 3px" }}>AI 추천</p>
                  <p style={{ fontSize: 12, color: "#374151", margin: 0, lineHeight: 1.6 }}>6월 매출 하락 패턴 감지. 경영안정자금 또는 소상공인 긴급자금 신청을 검토해보세요.</p>
                </div>
              )}
              <p style={{ fontSize: 10, color: "#B0B8C8", margin: "14px 0 0", lineHeight: 1.6 }}>
                AI 분석 결과는 참고용이며, 실제 매출 상황과 차이가 있을 수 있습니다.
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* ── Section E — 소득 안정성 분석 (프리랜서) ── */}
      {profile.userType === "프리랜서" && (
        <Section title="소득 안정성 분석" sub="최근 6개월 월별 소득을 입력하면 안정성을 분석해드려요" badge="프리랜서 전용">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>

            {/* 왼쪽: 월별 입력 */}
            <div style={{ ...card, padding: "24px 26px" }}>
              <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 18px", letterSpacing: "-0.2px" }}>수입 현황 입력</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {MONTHS_KR.map((mo, i) => (
                  <div key={mo} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", width: 28, flexShrink: 0 }}>{mo}</span>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#F9FAFB", border: "1.5px solid #E5E7EB", borderRadius: 9, overflow: "hidden", transition: "border-color 0.15s" }}>
                      <input
                        type="number"
                        placeholder="0"
                        value={monthlyIncome[i] ?? ""}
                        onChange={(e) => {
                          const next = [...monthlyIncome];
                          next[i] = e.target.value;
                          setMonthlyIncome(next);
                          setFreeResult(null);
                        }}
                        onFocus={(e) => { (e.currentTarget.parentElement as HTMLDivElement).style.borderColor = "#7C3AED"; (e.currentTarget.parentElement as HTMLDivElement).style.background = "#fff"; }}
                        onBlur={(e) => { (e.currentTarget.parentElement as HTMLDivElement).style.borderColor = "#E5E7EB"; (e.currentTarget.parentElement as HTMLDivElement).style.background = "#F9FAFB"; }}
                        style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, padding: "10px 12px", fontFamily: "var(--font-sans)", color: "#111827" }}
                      />
                      <span style={{ padding: "0 12px", fontSize: 12, color: "#9CA3AF", fontWeight: 500 }}>만원</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  const vals = monthlyIncome.map(Number).filter((v) => v > 0);
                  if (vals.length === 0) return;
                  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
                  const min = Math.min(...vals);
                  const max = Math.max(...vals);
                  const stddev = Math.sqrt(vals.reduce((a, b) => a + (b - avg) ** 2, 0) / vals.length);
                  const cv = Math.round((stddev / avg) * 100);
                  let stability = "안정적";
                  let color = "#059669";
                  if (cv >= 40) { stability = "변동 큼"; color = "#DC2626"; }
                  else if (cv >= 20) { stability = "보통"; color = "#D97706"; }
                  setFreeResult({ avg: Math.round(avg), cv, min, max, stability, color });
                }}
                style={{ marginTop: 18, width: "100%", padding: "13px", borderRadius: 10, border: "none", background: "#7C3AED", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "background 0.15s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#6D28D9")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#7C3AED")}
              >
                분석하기
              </button>
            </div>

            {/* 오른쪽: 결과 */}
            <div style={{ ...card, padding: "24px 26px" }}>
              {freeResult ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, margin: 0, letterSpacing: "-0.2px" }}>소득 안정성 분석 결과</p>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 99, background: freeResult.color + "18", color: freeResult.color, border: `1px solid ${freeResult.color}30` }}>
                      {freeResult.stability}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                    {[
                      { label: "최근 6개월 평균 소득", value: `${freeResult.avg.toLocaleString()}만원` },
                      { label: "소득 변동성 (CV)", value: `${freeResult.cv}%` },
                      { label: "최저 월 소득", value: `${freeResult.min.toLocaleString()}만원` },
                      { label: "최고 월 소득", value: `${freeResult.max.toLocaleString()}만원` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: 10, background: "#F9FAFB", border: "1px solid #F0F1F4" }}>
                        <span style={{ fontSize: 13, color: "#6B7280" }}>{label}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  {/* 변동성 바 */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}>안정적</span>
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}>변동 큼</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 99, background: "#F0F1F4", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(freeResult.cv * 1.5, 100)}%`, background: `linear-gradient(90deg, #059669, ${freeResult.color})`, borderRadius: 99, transition: "width 0.5s" }} />
                    </div>
                  </div>
                  <p style={{ fontSize: 10, color: "#B0B8C8", margin: 0, lineHeight: 1.6 }}>
                    AI 분석 결과는 참고용이며, 실제 소득 상황과 차이가 있을 수 있습니다.
                  </p>
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280, gap: 12, textAlign: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.686 2 6 4.686 6 8c0 2.21 1.13 4.16 2.84 5.29L9 15h6l.16-1.71A6 6 0 0012 2z" fill="#7C3AED" opacity="0.7"/><path d="M9 15v1a3 3 0 006 0v-1" stroke="#7C3AED" strokeWidth="1.5"/></svg>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: "#111827" }}>6개월 소득을 입력하고<br />분석하기를 눌러보세요</p>
                  <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0, lineHeight: 1.6 }}>평균 소득, 변동성, 최저·최고 소득을<br />한눈에 확인할 수 있어요</p>
                </div>
              )}
            </div>
          </div>
        </Section>
      )}
      {/* ── Section B — 나한테 맞게 풀어보면 (찜 기능 통합) ── */}
      <Section title="나한테 맞게 풀어보면" sub="찜한 혜택을 내 상황에 대입해서 해석해드려요">
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 14 }}>
          {/* 혜택 리스트 — 하트 통합 */}
          <div style={{ ...card, overflow: "hidden" }}>
            <div style={{ padding: "11px 16px", borderBottom: "1px solid #E5E7EB", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ ...labelSm }}>혜택 선택</p>
              <span style={{ fontSize: 10, color: "#9CA3AF" }}>총 {likedBenefits.length}개</span>
            </div>
            {likedBenefits.length === 0 ? (
              <p style={{ fontSize: 13, color: "#9CA3AF", padding: 16, margin: 0, lineHeight: 1.5 }}>지원사업 탭에서 마음에 드는<br />혜택을 찜해보세요</p>
            ) : likedBenefits.map((b) => {
              const active = selectedBenefit?.id === b.id;
              const liked = likedIds.has(b.id);
              return (
                <div key={b.id} style={{ display: "flex", alignItems: "stretch", borderLeft: `3px solid ${active ? "#1B4DFF" : "transparent"}`, background: active ? "#EEF2FF" : "transparent", transition: "all 0.13s" }}>
                  <button onClick={() => setSelectedBenefitId(b.id)}
                    style={{ flex: 1, padding: "12px 14px", border: "none", background: "transparent", textAlign: "left", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: active ? "#1B4DFF" : "#111827", lineHeight: 1.4 }}>{b.title}</p>
                    <p style={{ fontSize: 11, color: "#9CA3AF", margin: "3px 0 0" }}>{b.tag}</p>
                  </button>
                  <button onClick={() => toggleLike(b.id)}
                    style={{ padding: "0 13px", border: "none", background: "transparent", cursor: "pointer", color: liked ? "#E53E3E" : "#D1D5DB", transition: "color 0.15s, transform 0.15s", flexShrink: 0, display: "flex", alignItems: "center", transform: liked ? "scale(1.15)" : "scale(1)" }}
                    aria-label="찜 해제"
                  >
                    <svg width="14" height="14" viewBox="0 0 18 18" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
                      <path d="M9 15.5C9 15.5 2 11 2 6.5C2 4.567 3.567 3 5.5 3C6.77 3 7.893 3.677 8.5 4.704C9.5 4.704 9.5 4.704 9.5 4.704C10.107 3.677 11.23 3 12.5 3C14.433 3 16 4.567 16 6.5C16 11 9 15.5 9 15.5Z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* 분석 패널 */}
          {selectedBenefit ? (
            <div style={{ ...card, padding: 28, borderColor: "#C7D2FE", borderWidth: 1.5 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ padding: "3px 10px", borderRadius: 99, background: "#EEF2FF", color: "#1B4DFF", fontSize: 11, fontWeight: 700 }}>{profile.name}님의 경우</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{selectedBenefit.title}</span>
                </div>
                <button onClick={() => toggleLike(selectedBenefit.id)}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${likedIds.has(selectedBenefit.id) ? "#FECACA" : "#E5E7EB"}`, background: likedIds.has(selectedBenefit.id) ? "#FFF5F5" : "transparent", color: likedIds.has(selectedBenefit.id) ? "#E53E3E" : "#9CA3AF", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s", flexShrink: 0 }}
                >
                  <svg width="13" height="13" viewBox="0 0 18 18" fill={likedIds.has(selectedBenefit.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
                    <path d="M9 15.5C9 15.5 2 11 2 6.5C2 4.567 3.567 3 5.5 3C6.77 3 7.893 3.677 8.5 4.704C9.5 4.704 9.5 4.704 9.5 4.704C10.107 3.677 11.23 3 12.5 3C14.433 3 16 4.567 16 6.5C16 11 9 15.5 9 15.5Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {likedIds.has(selectedBenefit.id) ? "찜됨" : "찜하기"}
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { q: "신청 자격이 되나요?", a: `됩니다. 사업자등록 전 ${profile.userType}도 신청 가능하며, ${profile.region} 거주 조건을 충족합니다.`, ok: true },
                  { q: `내 업종(${profile.industry})이 포함되나요?`, a: "IT 서비스업은 지원 대상 업종에 포함됩니다.", ok: true },
                  { q: "자본금 기준으로 받을 수 있는 금액은?", a: `자본금 ${profile.capital} 기준 권장 한도는 약 3,000만원입니다.`, ok: false },
                  { q: "언제까지 신청해야 하나요?", a: `📅 현재 상태: ${selectedBenefit.status}${selectedBenefit.deadline != null ? ` (D-${selectedBenefit.deadline})` : ""}. 서류 준비에 약 1주일이 필요합니다.`, ok: true },
                ].map(({ q, a, ok }) => (
                  <div key={q} style={{ padding: "12px 16px", borderRadius: 10, background: ok ? "#F0FDF4" : "#FFFBEB", border: `1px solid ${ok ? "#BBF7D0" : "#FDE68A"}` }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: "#111827" }}>{q}</p>
                    <p style={{ fontSize: 13, color: "#374151", margin: "4px 0 0", lineHeight: 1.55 }}>{a}</p>
                  </div>
                ))}
              </div>
              <button style={{ marginTop: 18, width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "#1B4DFF", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "background 0.14s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1640D6")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1B4DFF")}
              >신청 페이지로 이동 →</button>
            </div>
          ) : (
            <EmptyState msg="좌측에서 혜택을 선택하세요" />
          )}
        </div>
      </Section>

    </main>
  );
}

