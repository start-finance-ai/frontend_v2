import { useState } from "react";
import BenefitCard from "../components/BenefitCard";
import { ALL_BENEFITS, type Benefit } from "../data/benefits";

interface SearchPageProps {
  query: string;
  setQuery: (q: string) => void;
  likedIds: Set<number>;
  toggleLike: (id: number) => void;
  goDetail: (benefit: Benefit) => void;
}

export default function SearchPage({ query, setQuery, likedIds, toggleLike, goDetail }: SearchPageProps) {
  const [inputVal, setInputVal] = useState(query);

  const results = ALL_BENEFITS.filter((b) =>
    b.title.includes(query) ||
    b.summary.includes(query) ||
    b.tag.includes(query) ||
    (b.target ?? "").includes(query)
  );

  const handleSearch = () => {
    if (inputVal.trim()) setQuery(inputVal.trim());
  };

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* Search bar */}
      <div style={{ maxWidth: 640, marginBottom: 40 }}>
        <p style={{ fontSize: 13, color: "var(--color-muted-foreground)", margin: "0 0 12px" }}>
          검색어를 변경하거나 새로운 키워드를 입력하세요
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#fff",
            border: "2px solid var(--color-primary)",
            borderRadius: 14,
            padding: "0 16px",
            gap: 10,
            boxShadow: "0 0 0 4px rgba(27,77,255,0.08)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, color: "var(--color-muted-foreground)" }}>
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
      </div>

      {/* Result header */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 24 }}>
        <h1 style={{ fontWeight: 800, fontSize: 22, margin: 0, letterSpacing: "-0.4px" }}>
          "{query}"
        </h1>
        <span style={{ fontSize: 14, color: "var(--color-muted-foreground)" }}>
          검색 결과 {results.length}건
        </span>
      </div>

      {results.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {results.map((b) => (
            <BenefitCard
              key={b.id}
              {...b}
              liked={likedIds.has(b.id)}
              onToggleLike={() => toggleLike(b.id)}
              showDetailBtn
              onDetailClick={() => goDetail(b)}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            color: "var(--color-muted-foreground)",
          }}
        >
          <div style={{ width: 48, height: 48, margin: "0 auto 16px", borderRadius: 14, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="9" cy="9" r="6" stroke="#1B4DFF" strokeWidth="1.8"/><path d="M14 14L20 20" stroke="#1B4DFF" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
          <p style={{ fontWeight: 600, fontSize: 16, margin: "0 0 8px", color: "var(--color-foreground)" }}>
            검색 결과가 없습니다
          </p>
          <p style={{ fontSize: 14, margin: 0 }}>
            다른 키워드로 검색해보거나 카테고리에서 찾아보세요
          </p>
        </div>
      )}
    </main>
  );
}
