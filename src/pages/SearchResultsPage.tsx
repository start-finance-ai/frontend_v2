import { useEffect, useState } from "react";
import { getPrograms } from "../api/client";
import BenefitCard from "../components/BenefitCard";
import { searchResultToBenefit, type Benefit } from "../data/benefits";

interface SearchResultsPageProps {
  query: string;
  likedIds: Set<string>;
  toggleLike: (id: string) => void;
  goDetail: (benefit: Benefit) => void;
  goSearch: (q: string) => void;
}

export default function SearchResultsPage({ query, likedIds, toggleLike, goDetail, goSearch }: SearchResultsPageProps) {
  const [localQuery, setLocalQuery] = useState(query);
  const [activeTag, setActiveTag] = useState("전체");
  const [programs, setPrograms] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => setLocalQuery(query), [query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setActiveTag("전체");
    getPrograms({ query: query || undefined, limit: 20 })
      .then((response) => {
        if (!cancelled) setPrograms(response.results.map(searchResultToBenefit));
      })
      .catch((reason: Error) => {
        if (!cancelled) setError(reason.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [query, reloadKey]);

  const tags = ["전체", ...Array.from(new Set(programs.map((program) => program.tag)))].slice(0, 8);
  const results = activeTag === "전체" ? programs : programs.filter((program) => program.tag === activeTag);

  const handleSearch = () => {
    if (localQuery.trim()) goSearch(localQuery.trim());
  };

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
      {/* Search bar */}
      <div style={{ padding: "32px 0 28px" }}>
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
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="검색어를 입력하세요"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 15,
              padding: "15px 0",
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

        {/* Result meta */}
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {query && (
            <span style={{ fontSize: 15, color: "var(--color-foreground)" }}>
              <strong style={{ color: "var(--color-primary)" }}>{query}</strong> 검색 결과
            </span>
          )}
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 99,
              background: "var(--color-secondary)",
              color: "var(--color-primary)",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {results.length}건
          </span>
        </div>
      </div>

      {/* Tag filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            style={{
              padding: "7px 16px",
              borderRadius: 99,
              border: "1.5px solid",
              borderColor: activeTag === tag ? "var(--color-primary)" : "var(--color-border)",
              background: activeTag === tag ? "var(--color-secondary)" : "#fff",
              color: activeTag === tag ? "var(--color-primary)" : "var(--color-muted-foreground)",
              fontSize: 13,
              fontWeight: activeTag === tag ? 700 : 400,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              transition: "all 0.15s",
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--color-muted-foreground)" }}>지원사업을 검색하는 중입니다…</div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "64px 24px", background: "#fff", borderRadius: 16, border: "1px solid #FECACA" }}>
          <p style={{ color: "#B91C1C", margin: "0 0 12px" }}>{error}</p>
          <button onClick={() => setReloadKey((value) => value + 1)} style={{ padding: "8px 14px", border: 0, borderRadius: 8, background: "#1B4DFF", color: "#fff", cursor: "pointer" }}>다시 시도</button>
        </div>
      ) : results.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 24px",
            background: "#fff",
            borderRadius: 16,
            border: "1px solid var(--color-border)",
          }}
        >
          <div style={{ width: 40, height: 40, margin: "0 auto 12px", borderRadius: 12, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7.5" cy="7.5" r="5" stroke="#1B4DFF" strokeWidth="1.6"/><path d="M11.5 11.5L16 16" stroke="#1B4DFF" strokeWidth="1.6" strokeLinecap="round"/></svg></div>
          <p style={{ fontWeight: 700, fontSize: 16, margin: "0 0 6px" }}>검색 결과가 없습니다</p>
          <p style={{ fontSize: 14, color: "var(--color-muted-foreground)", margin: 0 }}>
            다른 검색어로 시도해보거나 카테고리에서 찾아보세요
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {results.map((b) => (
            <div key={b.id} onClick={() => goDetail(b)} style={{ cursor: "pointer" }}>
              <BenefitCard
                {...b}
                liked={likedIds.has(b.id)}
                onToggleLike={() => toggleLike(b.id)}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
