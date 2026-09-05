import { useEffect, useState } from "react";
import type { CategoryType } from "../App";
import { getPrograms } from "../api/client";
import BenefitCard from "../components/BenefitCard";
import { searchResultToBenefit, type Benefit } from "../data/benefits";

interface HomePageProps {
  likedIds: Set<string>;
  toggleLike: (id: string) => void;
  goCategory: (cat: CategoryType) => void;
  goSearch: (q: string) => void;
  goDetail: (benefit: Benefit) => void;
}

const CATEGORIES: { type: CategoryType; label: string; desc: string; color: string; bg: string }[] = [
  {
    type: "예비창업자",
    label: "예비창업자",
    desc: "아직 시작 전이지만 단단하게 준비하고 있어요",
    color: "#1B4DFF",
    bg: "#EEF2FF",
  },
  {
    type: "소상공인",
    label: "소상공인",
    desc: "지금 운영 중인 내 가게, 더 오래 잘 버티고 싶어요",
    color: "#059669",
    bg: "#ECFDF5",
  },
  {
    type: "프리랜서",
    label: "프리랜서",
    desc: "월급 없이 혼자 일하는데 지원받을 수 있을까요",
    color: "#7C3AED",
    bg: "#F3E8FF",
  },
];

export default function HomePage({ likedIds, toggleLike, goCategory, goSearch, goDetail }: HomePageProps) {
  const [query, setQuery] = useState("");
  const [programs, setPrograms] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPrograms = () => {
    setLoading(true);
    setError(null);
    getPrograms({ limit: 8 })
      .then((response) => setPrograms(response.results.map(searchResultToBenefit)))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadPrograms, []);

  const handleSearch = () => {
    if (query.trim()) goSearch(query.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
      {/* Hero search section */}
      <section
        style={{
          padding: "72px 0 56px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >

        <h1
          style={{
            fontSize: "clamp(26px, 4vw, 40px)",
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.25,
            letterSpacing: "-0.8px",
            color: "var(--color-foreground)",
            margin: 0,
          }}
        >
          내 상황에 맞는 지원사업,<br />한 번에 찾아보세요
        </h1>

        <p style={{ fontSize: 16, color: "var(--color-muted-foreground)", margin: 0, textAlign: "center" }}>
          실제 기업마당 지원사업을 복잡한 공문서 없이 쉽게 확인
        </p>

        <div style={{ width: "100%", maxWidth: 640, marginTop: 12, position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#fff",
              border: "2px solid",
              borderColor: query ? "var(--color-primary)" : "var(--color-border)",
              borderRadius: 14,
              padding: "0 16px",
              gap: 10,
              boxShadow: query ? "0 0 0 4px rgba(27,77,255,0.08)" : "0 2px 8px rgba(0,0,0,0.06)",
              transition: "all 0.2s",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, color: "var(--color-muted-foreground)" }}>
              <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="궁금한 지원사업을 검색해보세요"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 15,
                padding: "16px 0",
                background: "transparent",
                color: "var(--color-foreground)",
                fontFamily: "var(--font-sans)",
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                flexShrink: 0,
                padding: "8px 18px",
                borderRadius: 9,
                border: "none",
                background: "var(--color-primary)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              검색
            </button>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {["경영안정", "창업", "교육", "사업화"].map((kw) => (
              <button
                key={kw}
                onClick={() => { setQuery(kw); goSearch(kw); }}
                style={{
                  padding: "4px 12px",
                  borderRadius: 99,
                  border: "1px solid var(--color-border)",
                  background: "#fff",
                  fontSize: 12,
                  color: "var(--color-muted-foreground)",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  transition: "border-color 0.15s",
                }}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category cards */}
      <section style={{ marginBottom: 64 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.type}
              onClick={() => goCategory(cat.type)}
              style={{
                background: "#fff",
                border: "1.5px solid var(--color-border)",
                borderRadius: 16,
                padding: "28px 24px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                fontFamily: "var(--font-sans)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = cat.color;
                el.style.boxShadow = `0 8px 24px ${cat.color}18`;
                el.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "var(--color-border)";
                el.style.boxShadow = "none";
                el.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 13,
                  background: cat.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  color: cat.color,
                  letterSpacing: "-0.5px",
                }}
              >
                {cat.label.slice(0, 2)}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 17, margin: 0, color: "var(--color-foreground)" }}>{cat.label}</p>
                <p style={{ fontSize: 13, color: "var(--color-muted-foreground)", margin: "5px 0 0", lineHeight: 1.5 }}>
                  {cat.desc}
                </p>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: cat.color }}>
                혜택 보러가기
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6H9.5M6.5 3L9.5 6L6.5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Popular benefits */}
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 20, margin: 0, letterSpacing: "-0.3px" }}>확인할 지원사업</h2>
            <p style={{ fontSize: 13, color: "var(--color-muted-foreground)", margin: "4px 0 0" }}>기업마당 공식 데이터 기준</p>
          </div>
          <button
            onClick={() => goSearch("")}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              background: "transparent",
              fontSize: 13,
              color: "var(--color-muted-foreground)",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
            }}
          >
            전체 보기
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "64px 24px", textAlign: "center", color: "var(--color-muted-foreground)" }}>지원사업을 불러오는 중입니다…</div>
        ) : error ? (
          <div style={{ padding: "48px 24px", textAlign: "center", background: "#fff", border: "1px solid #FECACA", borderRadius: 14 }}>
            <p style={{ margin: "0 0 12px", color: "#B91C1C" }}>{error}</p>
            <button onClick={loadPrograms} style={{ padding: "8px 14px", border: 0, borderRadius: 8, background: "#1B4DFF", color: "#fff", cursor: "pointer" }}>다시 시도</button>
          </div>
        ) : programs.length === 0 ? (
          <div style={{ padding: "64px 24px", textAlign: "center", color: "var(--color-muted-foreground)", background: "#fff", borderRadius: 14 }}>현재 확인된 지원사업이 없습니다.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
            {programs.map((benefit) => (
              <div key={benefit.id} onClick={() => goDetail(benefit)} style={{ cursor: "pointer" }}>
                <BenefitCard
                  {...benefit}
                  liked={likedIds.has(benefit.id)}
                  onToggleLike={() => toggleLike(benefit.id)}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
