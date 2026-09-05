import { useEffect, useState } from "react";
import { getProgram, postIncomeStability, postRiskCalculation, postSalesAnalysis } from "../api/client";
import { programToBenefit, type Benefit } from "../data/benefits";
import type { CategoryType, ProfileData } from "../constants";
import { TYPE_BADGE } from "../constants";
import type { IncomeStabilityResponse, RiskCalculationResponse, SalesAnalysisResponse } from "../api/types";

interface MyPageProps {
  likedIds: Set<string>;
  toggleLike: (id: string) => void;
  profile: ProfileData;
  setProfile: (p: ProfileData) => void;
}

interface SimForm {
  initialCost: string;
  ownCapital: string;
  monthlyRevenue: string;
  monthlyExpense: string;
  loanAmount: string;
  annualInterestRate: string;
  loanTermMonths: string;
}

const INITIAL_SIM: SimForm = {
  initialCost: "",
  ownCapital: "",
  monthlyRevenue: "",
  monthlyExpense: "",
  loanAmount: "",
  annualInterestRate: "",
  loanTermMonths: "",
};

const WON_PER_MANWON = 10_000;
const MAX_SALES_FILE_BYTES = 5 * 1024 * 1024;

const formatKrw = (value: number) => `${Math.round(value).toLocaleString("ko-KR")}원`;
const formatManwon = (value: number) => `${(value / WON_PER_MANWON).toLocaleString("ko-KR", { maximumFractionDigits: 2 })}만원`;
const formatPercent = (value: number | null) => value === null ? "계산 불가" : `${value.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}%`;
const trendLabel: Record<SalesAnalysisResponse["recent_trend"]["direction"], string> = {
  UP: "상승",
  DOWN: "하락",
  FLAT: "보합",
  UNKNOWN: "계산 불가",
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
  disabled?: boolean;
  inputBase: React.CSSProperties;
  labelSm: React.CSSProperties;
}
function SimField({ label, unit, required, tipKey, activeTip, setTip, tipText, value, onChange, disabled, inputBase, labelSm }: SimFieldProps) {
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
        <input type="number" min="0" value={value} placeholder="0" disabled={disabled}
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
  const [selectedBenefitId, setSelectedBenefitId] = useState<string | null>(null);
  const [sim, setSim] = useState<SimForm>(INITIAL_SIM);
  const [simResult, setSimResult] = useState<RiskCalculationResponse | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simValidation, setSimValidation] = useState<string | null>(null);
  const [simError, setSimError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [salesFile, setSalesFile] = useState<File | null>(null);
  const [salesResult, setSalesResult] = useState<SalesAnalysisResponse | null>(null);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesValidation, setSalesValidation] = useState<string | null>(null);
  const [salesError, setSalesError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [draftProfile, setDraftProfile] = useState<ProfileData>(profile);
  const MONTHS_KR = ["1월", "2월", "3월", "4월", "5월", "6월"];
  const [monthlyIncome, setMonthlyIncome] = useState<string[]>(["", "", "", "", "", ""]);
  const [incomeResult, setIncomeResult] = useState<IncomeStabilityResponse | null>(null);
  const [incomeLoading, setIncomeLoading] = useState(false);
  const [incomeValidation, setIncomeValidation] = useState<string | null>(null);
  const [incomeError, setIncomeError] = useState<string | null>(null);
  const [likedBenefits, setLikedBenefits] = useState<Benefit[]>([]);
  const [likedLoading, setLikedLoading] = useState(false);
  const [likedError, setLikedError] = useState<string | null>(null);

  const selectedBenefit: Benefit | undefined =
    likedBenefits.find((b) => b.id === selectedBenefitId) ?? likedBenefits[0];

  useEffect(() => {
    const ids = Array.from(likedIds);
    if (ids.length === 0) {
      setLikedBenefits([]);
      setSelectedBenefitId(null);
      setLikedError(null);
      return;
    }
    let cancelled = false;
    setLikedLoading(true);
    setLikedError(null);
    Promise.all(ids.map((id) => getProgram(id)))
      .then((programs) => {
        if (cancelled) return;
        const benefits = programs.map(programToBenefit);
        setLikedBenefits(benefits);
        setSelectedBenefitId((current) => current && ids.includes(current) ? current : benefits[0]?.id || null);
      })
      .catch((reason: Error) => {
        if (!cancelled) setLikedError(reason.message);
      })
      .finally(() => {
        if (!cancelled) setLikedLoading(false);
      });
    return () => { cancelled = true; };
  }, [likedIds]);

  const clearSimFeedback = () => {
    setSimResult(null);
    setSimValidation(null);
    setSimError(null);
  };

  const runSim = async () => {
    if (simLoading) return;
    clearSimFeedback();
    const values = Object.values(sim).map(Number);
    if (Object.values(sim).some((value) => value.trim() === "") || values.some((value) => !Number.isFinite(value) || value < 0)) {
      setSimValidation("7개 항목을 모두 0 이상의 숫자로 입력해주세요.");
      return;
    }
    const loanTermMonths = Number(sim.loanTermMonths);
    if (!Number.isInteger(loanTermMonths) || (Number(sim.loanAmount) > 0 && loanTermMonths < 1)) {
      setSimValidation("대출금액이 있으면 대출기간을 1개월 이상의 정수로 입력해주세요.");
      return;
    }
    setSimLoading(true);
    try {
      setSimResult(await postRiskCalculation({
        initial_cost: Number(sim.initialCost) * WON_PER_MANWON,
        own_capital: Number(sim.ownCapital) * WON_PER_MANWON,
        monthly_revenue: Number(sim.monthlyRevenue) * WON_PER_MANWON,
        monthly_expense: Number(sim.monthlyExpense) * WON_PER_MANWON,
        loan_amount: Number(sim.loanAmount) * WON_PER_MANWON,
        annual_interest_rate: Number(sim.annualInterestRate),
        loan_term_months: loanTermMonths,
      }));
    } catch (error) {
      setSimError(error instanceof Error ? error.message : "요청을 처리하지 못했습니다.");
    } finally {
      setSimLoading(false);
    }
  };

  const simFilledCount = Object.values(sim).filter(v => v.trim() !== "").length;

  const selectSalesFile = (file: File | null) => {
    setSalesResult(null);
    setSalesError(null);
    setSalesValidation(null);
    setSalesFile(null);
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension !== "csv" && extension !== "xlsx") {
      setSalesValidation("CSV 또는 XLSX 파일만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > MAX_SALES_FILE_BYTES) {
      setSalesValidation("파일 크기는 5MB 이하여야 합니다.");
      return;
    }
    setSalesFile(file);
  };

  const runSalesAnalysis = async () => {
    if (salesLoading) return;
    setSalesResult(null);
    setSalesError(null);
    setSalesValidation(null);
    if (!salesFile) {
      setSalesValidation("분석할 CSV 또는 XLSX 파일을 선택해주세요.");
      return;
    }
    setSalesLoading(true);
    try {
      setSalesResult(await postSalesAnalysis(salesFile));
    } catch (error) {
      setSalesError(error instanceof Error ? error.message : "요청을 처리하지 못했습니다.");
    } finally {
      setSalesLoading(false);
    }
  };

  const runIncomeAnalysis = async () => {
    if (incomeLoading) return;
    setIncomeResult(null);
    setIncomeError(null);
    setIncomeValidation(null);
    const values = monthlyIncome.map(Number);
    if (monthlyIncome.some((value) => value.trim() === "") || values.some((value) => !Number.isFinite(value) || value < 0)) {
      setIncomeValidation("최근 6개월 소득을 모두 0 이상의 숫자로 입력해주세요.");
      return;
    }
    setIncomeLoading(true);
    try {
      setIncomeResult(await postIncomeStability({
        monthly_incomes: values.map((value) => value * WON_PER_MANWON),
      }));
    } catch (error) {
      setIncomeError(error instanceof Error ? error.message : "요청을 처리하지 못했습니다.");
    } finally {
      setIncomeLoading(false);
    }
  };

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
              <h2 style={{ fontWeight: 800, fontSize: 20, margin: 0, letterSpacing: "-0.5px" }}>조건 수정</h2>
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
              >조건 적용</button>
            </div>
            <p style={{ fontSize: 11, color: "#9CA3AF", margin: "12px 0 0", textAlign: "center" }}>입력한 조건은 현재 화면에만 적용됩니다.</p>
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
        >조건 수정</button>
      </div>



      {/* ── Section C — 리스크 계산기 (예비창업자) ── */}
      {profile.userType === "예비창업자" && (
        <Section title="리스크 계산기" sub="입력값을 Backend의 결정론적 계산식으로 분석합니다" badge="예비창업자 전용">
          {tooltip && <div onClick={() => setTooltip(null)} style={{ position: "fixed", inset: 0, zIndex: 100 }} />}
          <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 20, alignItems: "stretch", position: "relative" }}>
            <div style={{ ...card, padding: "28px 28px 24px" }}>
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 5px", letterSpacing: "-0.3px" }}>재무 정보를 입력해주세요</p>
                <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0, lineHeight: 1.55 }}>Backend 계산에 필요한 7개 항목을 모두 입력합니다</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <SimField label="초기비용" unit="만원" required tipKey="initialCost" activeTip={tooltip} setTip={setTooltip}
                  tipText="사업 시작에 필요한 전체 초기비용입니다." value={sim.initialCost} disabled={simLoading}
                  onChange={(v) => { setSim((p) => ({ ...p, initialCost: v })); clearSimFeedback(); }} inputBase={inputBase} labelSm={labelSm} />
                <SimField label="자기자본" unit="만원" required tipKey="ownCapital" activeTip={tooltip} setTip={setTooltip}
                  tipText="초기비용에 사용할 수 있는 자기자본입니다." value={sim.ownCapital} disabled={simLoading}
                  onChange={(v) => { setSim((p) => ({ ...p, ownCapital: v })); clearSimFeedback(); }} inputBase={inputBase} labelSm={labelSm} />
                <SimField label="월매출" unit="만원" required tipKey="monthlyRevenue" activeTip={tooltip} setTip={setTooltip}
                  tipText="월 기준 예상 또는 실제 매출입니다." value={sim.monthlyRevenue} disabled={simLoading}
                  onChange={(v) => { setSim((p) => ({ ...p, monthlyRevenue: v })); clearSimFeedback(); }} inputBase={inputBase} labelSm={labelSm} />
                <SimField label="월지출" unit="만원" required tipKey="monthlyExpense" activeTip={tooltip} setTip={setTooltip}
                  tipText="월 기준 사업 관련 전체 지출입니다." value={sim.monthlyExpense} disabled={simLoading}
                  onChange={(v) => { setSim((p) => ({ ...p, monthlyExpense: v })); clearSimFeedback(); }} inputBase={inputBase} labelSm={labelSm} />
                <SimField label="대출금액" unit="만원" required tipKey="loanAmount" activeTip={tooltip} setTip={setTooltip}
                  tipText="계산에 반영할 대출 원금입니다. 없으면 0을 입력하세요." value={sim.loanAmount} disabled={simLoading}
                  onChange={(v) => { setSim((p) => ({ ...p, loanAmount: v })); clearSimFeedback(); }} inputBase={inputBase} labelSm={labelSm} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <SimField label="연이율" unit="%" required tipKey="annualInterestRate" activeTip={tooltip} setTip={setTooltip}
                    tipText="연 단위 이자율을 퍼센트로 입력합니다." value={sim.annualInterestRate} disabled={simLoading}
                    onChange={(v) => { setSim((p) => ({ ...p, annualInterestRate: v })); clearSimFeedback(); }} inputBase={inputBase} labelSm={labelSm} />
                  <SimField label="대출기간" unit="개월" required tipKey="loanTermMonths" activeTip={tooltip} setTip={setTooltip}
                    tipText="대출 상환기간을 개월 단위 정수로 입력합니다." value={sim.loanTermMonths} disabled={simLoading}
                    onChange={(v) => { setSim((p) => ({ ...p, loanTermMonths: v })); clearSimFeedback(); }} inputBase={inputBase} labelSm={labelSm} />
                </div>
              </div>
              <div style={{ marginTop: 16, marginBottom: 14 }}>
                <span style={{ fontSize: 11, color: simFilledCount === 7 ? "#1B4DFF" : "#9CA3AF", fontWeight: 600 }}>{simFilledCount} / 7 항목 입력됨</span>
                {(simValidation || simError) && <p role="alert" style={{ fontSize: 12, color: "#B91C1C", margin: "8px 0 0", lineHeight: 1.5 }}>{simValidation || simError}</p>}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setSim(INITIAL_SIM); clearSimFeedback(); }} disabled={simLoading}
                  style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "transparent", color: "#6B7280", fontWeight: 600, fontSize: 14, cursor: simLoading ? "default" : "pointer", fontFamily: "var(--font-sans)" }}>입력 초기화</button>
                <button onClick={runSim} disabled={simLoading}
                  style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: simLoading ? "#A5B4FC" : "#1B4DFF", color: "#fff", fontWeight: 700, fontSize: 14, cursor: simLoading ? "default" : "pointer", fontFamily: "var(--font-sans)" }}>
                  {simLoading ? "계산 중…" : simError ? "다시 계산하기" : "결과 계산하기"}
                </button>
              </div>
            </div>

            {simResult ? (
              <div style={{ ...card, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Backend 계산 결과</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "초기 가용 현금", value: formatManwon(simResult.available_cash) },
                    { label: "월 원리금 상환액", value: formatManwon(simResult.monthly_loan_payment) },
                    { label: "월 현금흐름", value: formatManwon(simResult.monthly_cash_flow) },
                    { label: "Cash Burn", value: formatManwon(simResult.monthly_cash_burn) },
                    { label: "Runway", value: simResult.runway_months === null ? "현재 입력 기준 현금 소진 없음" : `${simResult.runway_months.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}개월` },
                    { label: "Runway 시점 잔존채무", value: simResult.remaining_debt_at_runway === null ? "해당 없음" : formatManwon(simResult.remaining_debt_at_runway) },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ padding: "13px 14px", borderRadius: 10, background: "#F9FAFB", border: "1px solid #F0F1F4" }}>
                      <p style={{ fontSize: 11, color: "#6B7280", margin: "0 0 5px" }}>{label}</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>{value}</p>
                    </div>
                  ))}
                </div>
                {simResult.assumptions.length > 0 && (
                  <div style={{ padding: "12px 14px", borderRadius: 10, background: "#F9FAFB" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", margin: "0 0 5px" }}>계산 가정</p>
                    {simResult.assumptions.map((assumption) => <p key={assumption} style={{ fontSize: 11, color: "#6B7280", margin: "3px 0", lineHeight: 1.5 }}>• {assumption}</p>)}
                  </div>
                )}
                <p style={{ fontSize: 10, color: "#A8AFBC", margin: 0, lineHeight: 1.6 }}>{simResult.disclaimer}</p>
              </div>
            ) : (
              <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 32px", gap: 12, textAlign: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="10" width="4" height="8" rx="1" fill="#1B4DFF" opacity="0.4"/><rect x="8" y="6" width="4" height="12" rx="1" fill="#1B4DFF" opacity="0.7"/><rect x="14" y="2" width="4" height="16" rx="1" fill="#1B4DFF"/></svg>
                </div>
                <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: "#111827" }}>{simLoading ? "Backend에서 계산 중입니다…" : "조건을 입력하고 계산해보세요"}</p>
                {simError && <button onClick={runSim} disabled={simLoading} style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: "#1B4DFF", color: "#fff", fontWeight: 700, cursor: "pointer" }}>재시도</button>}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ── Section D — 매출장표 분석 (소상공인) ── */}
      {profile.userType === "소상공인" && (
        <Section title="매출장표 분석" sub="CSV 또는 XLSX 매출 자료를 Backend에서 집계합니다" badge="소상공인 전용">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
            <div style={{ ...card, padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, border: salesFile ? "1.5px solid #1B4DFF" : "2px dashed #E5E7EB" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: salesFile ? "#EEF2FF" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 14v3a1 1 0 001 1h12a1 1 0 001-1v-3M11 4v10M8 7l3-3 3 3" stroke={salesFile ? "#1B4DFF" : "#9CA3AF"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: salesFile ? "#1B4DFF" : "#111827" }}>{salesFile ? salesFile.name : "매출장표 파일 업로드"}</p>
                <p style={{ fontSize: 12, color: "#6B7280", margin: "5px 0 0" }}>CSV 또는 XLSX · 최대 5MB</p>
              </div>
              <label htmlFor="sales-file" style={{ padding: "9px 22px", borderRadius: 9, background: "#1B4DFF", color: "#fff", fontWeight: 600, fontSize: 13, cursor: salesLoading ? "default" : "pointer" }}>파일 선택</label>
              <input id="sales-file" type="file" accept=".csv,.xlsx" disabled={salesLoading} onChange={(event) => selectSalesFile(event.target.files?.[0] ?? null)} style={{ display: "none" }} />
              {(salesValidation || salesError) && <p role="alert" style={{ fontSize: 12, color: "#B91C1C", margin: 0, lineHeight: 1.5, textAlign: "center" }}>{salesValidation || salesError}</p>}
              <button onClick={runSalesAnalysis} disabled={salesLoading}
                style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: salesLoading ? "#A5B4FC" : "#1B4DFF", color: "#fff", fontWeight: 700, fontSize: 14, cursor: salesLoading ? "default" : "pointer", fontFamily: "var(--font-sans)" }}>
                {salesLoading ? "분석 중…" : salesError ? "다시 분석하기" : "분석하기"}
              </button>
            </div>

            <div style={{ ...card, padding: 24 }}>
              <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 16px" }}>분석 결과</p>
              {salesResult ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { label: "평균 월매출", value: formatKrw(salesResult.summary.average_monthly_sales) },
                      { label: "최신 월매출", value: formatKrw(salesResult.summary.latest_month_sales) },
                      { label: "최고 매출월", value: `${salesResult.summary.highest_month.month} · ${formatKrw(salesResult.summary.highest_month.sales)}` },
                      { label: "최저 매출월", value: `${salesResult.summary.lowest_month.month} · ${formatKrw(salesResult.summary.lowest_month.sales)}` },
                      { label: "최근 추세", value: `${trendLabel[salesResult.recent_trend.direction]} · ${formatPercent(salesResult.recent_trend.percent)}` },
                      { label: "변동계수", value: formatPercent(salesResult.variability.coefficient_of_variation_percent) },
                      { label: "전월 대비 변화", value: formatPercent(salesResult.mom_change_percent) },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 14px", borderRadius: 9, background: "#F9FAFB" }}>
                        <span style={{ fontSize: 12, color: "#6B7280" }}>{label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, textAlign: "right" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", margin: "0 0 7px" }}>월별 데이터</p>
                    <div style={{ maxHeight: 190, overflowY: "auto", border: "1px solid #E5E7EB", borderRadius: 9 }}>
                      {salesResult.monthly_series.map((month) => (
                        <div key={month.month} style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", gap: 10, padding: "9px 12px", borderBottom: "1px solid #F0F1F4", fontSize: 12 }}>
                          <span style={{ color: "#6B7280" }}>{month.month}</span><strong style={{ textAlign: "right" }}>{formatKrw(month.sales)}</strong><span style={{ color: "#9CA3AF" }}>{month.transaction_count}건</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {(salesResult.recent_trend.reason || salesResult.mom_change_reason) && (
                    <p style={{ fontSize: 11, color: "#6B7280", margin: 0, lineHeight: 1.5 }}>{salesResult.recent_trend.reason || salesResult.mom_change_reason}</p>
                  )}
                  {salesResult.warnings.length > 0 && (
                    <div style={{ padding: "11px 13px", borderRadius: 9, background: "#FFF7ED", color: "#9A3412" }}>
                      <p style={{ fontSize: 11, fontWeight: 700, margin: "0 0 4px" }}>데이터 경고</p>
                      {salesResult.warnings.map((warning) => <p key={warning} style={{ fontSize: 11, margin: "2px 0", lineHeight: 1.5 }}>• {warning}</p>)}
                    </div>
                  )}
                  <p style={{ fontSize: 10, color: "#B0B8C8", margin: 0, lineHeight: 1.6 }}>{salesResult.disclaimer}</p>
                </div>
              ) : (
                <div style={{ minHeight: 260, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>{salesLoading ? "Backend에서 매출 자료를 분석 중입니다…" : "파일을 선택한 뒤 분석하기를 눌러주세요."}</p>
                  {salesError && <button onClick={runSalesAnalysis} disabled={salesLoading} style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: "#1B4DFF", color: "#fff", fontWeight: 700, cursor: "pointer" }}>재시도</button>}
                </div>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* ── Section E — 소득 안정성 분석 (프리랜서) ── */}
      {profile.userType === "프리랜서" && (
        <Section title="소득 안정성 분석" sub="최근 정확히 6개월 소득을 Backend에서 계산합니다" badge="프리랜서 전용">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
            <div style={{ ...card, padding: "24px 26px" }}>
              <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 18px", letterSpacing: "-0.2px" }}>소득 현황 입력</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {MONTHS_KR.map((month, index) => (
                  <div key={month} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", width: 28, flexShrink: 0 }}>{month}</span>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#F9FAFB", border: "1.5px solid #E5E7EB", borderRadius: 9, overflow: "hidden" }}>
                      <input type="number" min="0" placeholder="0" value={monthlyIncome[index] ?? ""} disabled={incomeLoading}
                        onChange={(event) => {
                          const next = [...monthlyIncome];
                          next[index] = event.target.value;
                          setMonthlyIncome(next);
                          setIncomeResult(null);
                          setIncomeValidation(null);
                          setIncomeError(null);
                        }}
                        style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, padding: "10px 12px", fontFamily: "var(--font-sans)", color: "#111827" }} />
                      <span style={{ padding: "0 12px", fontSize: 12, color: "#9CA3AF", fontWeight: 500 }}>만원</span>
                    </div>
                  </div>
                ))}
              </div>
              {(incomeValidation || incomeError) && <p role="alert" style={{ fontSize: 12, color: "#B91C1C", margin: "12px 0 0", lineHeight: 1.5 }}>{incomeValidation || incomeError}</p>}
              <button onClick={runIncomeAnalysis} disabled={incomeLoading}
                style={{ marginTop: 18, width: "100%", padding: "13px", borderRadius: 10, border: "none", background: incomeLoading ? "#C4B5FD" : "#7C3AED", color: "#fff", fontWeight: 700, fontSize: 14, cursor: incomeLoading ? "default" : "pointer", fontFamily: "var(--font-sans)" }}>
                {incomeLoading ? "계산 중…" : incomeError ? "다시 계산하기" : "분석하기"}
              </button>
            </div>

            <div style={{ ...card, padding: "24px 26px" }}>
              {incomeResult ? (
                <>
                  <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 20px" }}>소득 안정성 계산 결과</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                    {[
                      { label: "평균 소득", value: formatManwon(incomeResult.average_income) },
                      { label: "표준편차", value: formatManwon(incomeResult.standard_deviation) },
                      { label: "변동계수", value: formatPercent(incomeResult.coefficient_of_variation_percent) },
                      { label: "최소 소득", value: formatManwon(incomeResult.minimum_income) },
                      { label: "최대 소득", value: formatManwon(incomeResult.maximum_income) },
                      { label: "기간", value: `${incomeResult.period_months}개월` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: 10, background: "#F9FAFB", border: "1px solid #F0F1F4" }}>
                        <span style={{ fontSize: 13, color: "#6B7280" }}>{label}</span><span style={{ fontSize: 14, fontWeight: 700 }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 10, color: "#B0B8C8", margin: 0, lineHeight: 1.6 }}>{incomeResult.disclaimer}</p>
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280, gap: 12, textAlign: "center" }}>
                  <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: "#111827" }}>{incomeLoading ? "Backend에서 계산 중입니다…" : "6개월 소득을 입력하고 분석하기를 눌러주세요"}</p>
                  <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>평균, 표준편차, 변동계수, 최소·최대 소득을 확인합니다.</p>
                  {incomeError && <button onClick={runIncomeAnalysis} disabled={incomeLoading} style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: "#7C3AED", color: "#fff", fontWeight: 700, cursor: "pointer" }}>재시도</button>}
                </div>
              )}
            </div>
          </div>
        </Section>
      )}
      {/* ── Section B — 나한테 맞게 풀어보면 (찜 기능 통합) ── */}
      <Section title="찜한 지원사업" sub="찜한 공고의 실제 Backend 데이터를 확인합니다">
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 14 }}>
          {/* 혜택 리스트 — 하트 통합 */}
          <div style={{ ...card, overflow: "hidden" }}>
            <div style={{ padding: "11px 16px", borderBottom: "1px solid #E5E7EB", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ ...labelSm }}>혜택 선택</p>
              <span style={{ fontSize: 10, color: "#9CA3AF" }}>총 {likedBenefits.length}개</span>
            </div>
            {likedLoading ? (
              <p style={{ fontSize: 13, color: "#9CA3AF", padding: 16, margin: 0 }}>불러오는 중…</p>
            ) : likedError ? (
              <p style={{ fontSize: 13, color: "#B91C1C", padding: 16, margin: 0, lineHeight: 1.5 }}>{likedError}</p>
            ) : likedBenefits.length === 0 ? (
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

          {/* 실제 공고 요약 */}
          {selectedBenefit ? (
            <div style={{ ...card, padding: 28, borderColor: "#C7D2FE", borderWidth: 1.5 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ padding: "3px 10px", borderRadius: 99, background: "#EEF2FF", color: "#1B4DFF", fontSize: 11, fontWeight: 700 }}>공식 데이터</span>
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
                <div style={{ padding: "12px 16px", borderRadius: 10, background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                  <p style={{ fontSize: 11, color: "#6B7280", margin: "0 0 4px" }}>지원 대상</p>
                  <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.6 }}>{selectedBenefit.target || "공식 공고에서 확인 필요"}</p>
                </div>
                <div style={{ padding: "12px 16px", borderRadius: 10, background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                  <p style={{ fontSize: 11, color: "#6B7280", margin: "0 0 4px" }}>공고 요약</p>
                  <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.6 }}>{selectedBenefit.summary}</p>
                </div>
              </div>
              {selectedBenefit.sourceUrl && (
                <a href={selectedBenefit.sourceUrl} target="_blank" rel="noreferrer" style={{ display: "block", marginTop: 18, width: "100%", padding: 12, boxSizing: "border-box", borderRadius: 10, background: "#1B4DFF", color: "#fff", fontWeight: 700, fontSize: 14, textAlign: "center", textDecoration: "none" }}>공식 공고 확인 →</a>
              )}
            </div>
          ) : (
            <EmptyState msg="좌측에서 혜택을 선택하세요" />
          )}
        </div>
      </Section>

    </main>
  );
}

