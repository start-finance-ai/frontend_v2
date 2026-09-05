import { useEffect, useState } from "react";
import { getProgram } from "../api/client";
import type { Program } from "../api/types";
import { toPlainText } from "../data/benefits";

interface BenefitDetailPageProps {
  programId: string;
  liked: boolean;
  onToggleLike: () => void;
  goBack: () => void;
  goAgent: (program: Program) => void;
}

function displayValue(value: string | null | undefined) {
  return toPlainText(value) || "공식 공고에서 확인 필요";
}

function formatDateTime(value: string | null) {
  if (!value) return "확인 필요";
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(value));
}

export default function BenefitDetailPage({
  programId,
  liked,
  onToggleLike,
  goBack,
  goAgent,
}: BenefitDetailPageProps) {
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getProgram(programId)
      .then((result) => {
        if (!cancelled) setProgram(result);
      })
      .catch((reason: Error) => {
        if (!cancelled) setError(reason.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [programId, reloadKey]);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px" }}>
      <div style={{ padding: "24px 0 18px" }}>
        <button onClick={goBack} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: "1px solid var(--color-border)", background: "#fff", fontSize: 13, color: "var(--color-muted-foreground)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          목록으로
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "96px 24px", textAlign: "center", color: "var(--color-muted-foreground)" }}>공고 상세를 불러오는 중입니다…</div>
      ) : error ? (
        <div style={{ padding: "72px 24px", textAlign: "center", background: "#fff", border: "1px solid #FECACA", borderRadius: 16 }}>
          <p style={{ color: "#B91C1C", margin: "0 0 14px" }}>{error}</p>
          <button onClick={() => setReloadKey((value) => value + 1)} style={{ padding: "8px 14px", border: 0, borderRadius: 8, background: "#1B4DFF", color: "#fff", cursor: "pointer" }}>다시 시도</button>
        </div>
      ) : !program ? (
        <div style={{ padding: "96px 24px", textAlign: "center", color: "var(--color-muted-foreground)" }}>공고 정보를 찾을 수 없습니다.</div>
      ) : (
        <>
          <div style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: 16, padding: 32, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 6, background: "#EEF2FF", color: "#1B4DFF" }}>
                  {program.subcategory || program.category || "지원사업"}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 6, background: "#F3F4F6", color: "#6B7280" }}>
                  {program.source}
                </span>
              </div>
              <button onClick={onToggleLike} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, border: `1.5px solid ${liked ? "#FCA5A5" : "var(--color-border)"}`, background: liked ? "#FEF2F2" : "#fff", color: liked ? "#DC2626" : "var(--color-muted-foreground)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                <span aria-hidden>{liked ? "♥" : "♡"}</span>{liked ? "찜 완료" : "찜하기"}
              </button>
            </div>

            <h1 style={{ fontWeight: 800, fontSize: 24, margin: "0 0 10px", letterSpacing: "-0.5px", lineHeight: 1.35 }}>{program.program_name}</h1>
            <p style={{ fontSize: 15, color: "var(--color-muted-foreground)", margin: "0 0 24px", lineHeight: 1.7 }}>{displayValue(program.summary_raw)}</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { label: "주관 기관", value: displayValue(program.provider) },
                { label: "수행 기관", value: displayValue(program.executing_organization) },
                { label: "신청 기간", value: displayValue(program.apply_period_text) },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: "14px 16px", borderRadius: 10, background: "var(--color-muted)", border: "1px solid var(--color-border)" }}>
                  <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", margin: "0 0 4px" }}>{label}</p>
                  <p style={{ fontWeight: 700, fontSize: 14, margin: 0, lineHeight: 1.5 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <DetailSection title="지원 대상"><p style={{ fontSize: 14, margin: 0, lineHeight: 1.7 }}>{displayValue(program.target_type_raw)}</p></DetailSection>
            <DetailSection title="신청 방법"><p style={{ fontSize: 14, margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{displayValue(program.application_method_raw)}</p></DetailSection>
            <DetailSection title="문의처"><p style={{ fontSize: 14, margin: 0, lineHeight: 1.7 }}>{displayValue(program.contact_raw)}</p></DetailSection>
            <DetailSection title="데이터 기준">
              <p style={{ fontSize: 13, margin: 0, lineHeight: 1.7, color: "var(--color-muted-foreground)" }}>수집일 {formatDateTime(program.collected_at)} · 원문에 없는 지원금액이나 자격조건은 표시하지 않습니다.</p>
            </DetailSection>
          </div>

          <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {program.source_url && (
              <a href={program.source_url} target="_blank" rel="noreferrer" style={{ flex: 2, minWidth: 180, padding: 14, borderRadius: 12, background: "var(--color-primary)", color: "#fff", fontWeight: 700, fontSize: 15, textAlign: "center", textDecoration: "none" }}>공식 공고 확인 →</a>
            )}
            {program.document_url && (
              <a href={program.document_url} target="_blank" rel="noreferrer" style={{ padding: "14px 18px", borderRadius: 12, border: "1.5px solid var(--color-border)", background: "#fff", color: "var(--color-foreground)", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>첨부 문서</a>
            )}
            <button onClick={() => goAgent(program)} style={{ flex: 1, minWidth: 180, padding: "14px 16px", borderRadius: 12, border: "1.5px solid #C7D2FE", background: "#EEF2FF", color: "#1B4DFF", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              AI에게 이 공고 물어보기
            </button>
          </div>
        </>
      )}
    </main>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--color-border)", background: "var(--color-muted)" }}><h2 style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{title}</h2></div>
      <div style={{ padding: "18px 20px" }}>{children}</div>
    </section>
  );
}
