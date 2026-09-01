import { useState } from "react";
import type { CategoryType } from "../App";
import BenefitCard from "../components/BenefitCard";
import { ALL_BENEFITS } from "../data/benefits";

interface HomePageProps {
  likedIds: Set<number>;
  toggleLike: (id: number) => void;
  goCategory: (cat: CategoryType) => void;
  goSearch: (q: string) => void;
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

export default function HomePage({ likedIds, toggleLike, goCategory, goSearch }: HomePageProps) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) goSearch(query.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const popular = ALL_BENEFITS.slice(0, 8);

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
          대출, 정부지원금, 은행상품을 복잡한 공문서 없이 쉽게 확인
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
              placeholder="궁금한 대출이나 지원사업을 검색해보세요"
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
            {["경영안정자금", "창업패키지", "임차료 지원", "무이자 대출"].map((kw) => (
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
            <h2 style={{ fontWeight: 700, fontSize: 20, margin: 0, letterSpacing: "-0.3px" }}>지금 마감 임박</h2>
            <p style={{ fontSize: 13, color: "var(--color-muted-foreground)", margin: "4px 0 0" }}>기간 내 놓치지 마세요</p>
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {popular.map((b) => (
            <BenefitCard
              key={b.id}
              {...b}
              liked={likedIds.has(b.id)}
              onToggleLike={() => toggleLike(b.id)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
