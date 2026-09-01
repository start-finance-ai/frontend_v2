import { useState } from "react";
import type { CategoryType, Screen } from "../App";
import BenefitCard from "../components/BenefitCard";
import { ALL_BENEFITS, type Benefit } from "../data/benefits";

interface CategoryPageProps {
  category: CategoryType;
  likedIds: Set<number>;
  toggleLike: (id: number) => void;
  setScreen: (s: Screen) => void;
  goDetail: (benefit: Benefit) => void;
  goSearch: (q: string) => void;
  goCategory: (cat: CategoryType) => void;
}

const REGIONS = ["전체 지역", "서울", "경기", "부산", "인천", "대구", "광주", "대전"];
const INDUSTRIES = ["전체 업종", "음식·요식업", "도소매", "서비스업", "제조업", "IT·기술", "교육", "예술·창작"];
const SORTS = ["마감일순", "등록일순", "인기순"];

const CAT_INFO: Record<CategoryType, { desc: string; count: number; color: string; bg: string }> = {
  예비창업자: { desc: "창업을 준비 중인 분들을 위한 지원사업 모음", count: 84, color: "#1B4DFF", bg: "#EEF2FF" },
  소상공인: { desc: "운영 중인 사업장을 위한 경영안정 지원사업", count: 142, color: "#059669", bg: "#ECFDF5" },
  프리랜서: { desc: "1인 사업자·긱워커를 위한 생활안정·교육 지원사업", count: 61, color: "#7C3AED", bg: "#F3E8FF" },
};

const FILTER_TAGS = ["전체", "창업", "사업화지원", "창업공간지원", "예비창업자지원", "기타"];

const CATEGORY_CARDS: { type: CategoryType; label: string; desc: string; color: string; bg: string }[] = [
  { type: "예비창업자", label: "예비창업자", desc: "아직 시작 전이지만 단단하게 준비하고 있어요", color: "#1B4DFF", bg: "#EEF2FF" },
  { type: "소상공인", label: "소상공인", desc: "지금 운영 중인 내 가게, 더 오래 잘 버티고 싶어요", color: "#059669", bg: "#ECFDF5" },
  { type: "프리랜서", label: "프리랜서", desc: "월급 없이 혼자 일하는데 지원받을 수 있을까요", color: "#7C3AED", bg: "#F3E8FF" },
];

const CAT_ABBR: Record<CategoryType, string> = {
  예비창업자: "창업",
  소상공인: "상인",
  프리랜서: "1인",
};

const PAGE_SIZE = 9;

export default function CategoryPage({ category, likedIds, toggleLike, goDetail, goSearch, goCategory }: CategoryPageProps) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("전체 지역");
  const [industry, setIndustry] = useState("전체 업종");
  const [sort, setSort] = useState("마감일순");
  const [activeTag, setActiveTag] = useState<string>("전체");
  const [page, setPage] = useState(1);

  const handleSearch = () => { if (query.trim()) goSearch(query.trim()); };
  const resetPage = () => setPage(1);

  const info = CAT_INFO[category];
  const benefits = ALL_BENEFITS.filter((b) => b.categories.includes(category));
  const filledBenefits = benefits.length < 6
    ? [...benefits, ...ALL_BENEFITS.filter((b) => !b.categories.includes(category)).slice(0, 6 - benefits.length)]
    : benefits;
  const filtered = activeTag === "전체" ? filledBenefits : filledBenefits.filter((b) => b.tag === activeTag);
  const extras = ALL_BENEFITS.filter((b) => !b.categories.includes(category)).slice(0, 6);
  const display = filtered.length > 0 ? [...filtered, ...extras] : [];
  const popular = ALL_BENEFITS.slice(0, 8);

  const totalPages = Math.ceil(display.length / PAGE_SIZE);
  const paginated = display.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>

      {/* ── Hero search (old home) ── */}
      <section
        style={{
          padding: "56px 0 48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >

        <h1
          style={{
            fontSize: "clamp(24px, 3.5vw, 36px)",
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.25,
            letterSpacing: "-0.7px",
            color: "var(--color-foreground)",
            margin: 0,
          }}
        >
          내 상황에 맞는 지원사업,<br />한 번에 찾아보세요
        </h1>

        <p style={{ fontSize: 15, color: "var(--color-muted-foreground)", margin: 0, textAlign: "center" }}>
          정부지원사업·창업지원을 복잡한 공문서 없이 쉽게 확인
        </p>

        <div style={{ width: "100%", maxWidth: 640, marginTop: 12 }}>
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
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="지원사업명 또는 키워드를 검색해보세요"
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
            {["경영안정", "창업패키지", "임차료 지원", "사업화지원"].map((kw) => (
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
                }}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category cards ── */}
      <section style={{ marginBottom: 56 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {CATEGORY_CARDS.map((cat) => (
            <button
              key={cat.type}
              onClick={() => goCategory(cat.type)}
              style={{
                background: cat.type === category ? cat.bg : "#fff",
                border: `1.5px solid ${cat.type === category ? cat.color : "var(--color-border)"}`,
                borderRadius: 16,
                padding: "24px 20px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                fontFamily: "var(--font-sans)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = cat.color;
                el.style.boxShadow = `0 8px 24px ${cat.color}18`;
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = cat.type === category ? cat.color : "var(--color-border)";
                el.style.boxShadow = "none";
                el.style.transform = "translateY(0)";
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: cat.color, letterSpacing: "-0.4px" }}>
                {CAT_ABBR[cat.type]}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16, margin: 0, color: cat.type === category ? cat.color : "var(--color-foreground)" }}>{cat.label}</p>
                <p style={{ fontSize: 12, color: "var(--color-muted-foreground)", margin: "4px 0 0", lineHeight: 1.5 }}>{cat.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Category detail (selected type) ── */}
      <section style={{ marginBottom: 56 }}>
        {/* Selected category header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div style={{ width: 50, height: 50, borderRadius: 13, background: info.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: info.color, letterSpacing: "-0.5px" }}>
            {CAT_ABBR[category]}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontWeight: 800, fontSize: 20, margin: 0, letterSpacing: "-0.4px" }}>{category} 지원사업</h2>
            <p style={{ fontSize: 13, color: "var(--color-muted-foreground)", margin: "3px 0 0" }}>{info.desc}</p>
          </div>
        </div>

        {/* Filter bar */}
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "지역", value: region, options: REGIONS, setter: (v: string) => { setRegion(v); resetPage(); } },
            { label: "업종", value: industry, options: INDUSTRIES, setter: (v: string) => { setIndustry(v); resetPage(); } },
            { label: "정렬", value: sort, options: SORTS, setter: (v: string) => { setSort(v); resetPage(); } },
          ].map(({ label, value, options, setter }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "var(--color-muted-foreground)", fontWeight: 500 }}>{label}</span>
              <select
                value={value}
                onChange={(e) => setter(e.target.value)}
                style={{
                  padding: "6px 28px 6px 10px",
                  borderRadius: 8,
                  border: "1.5px solid var(--color-border)",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--color-foreground)",
                  background: "#fff",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%237A849A' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 10px center",
                  outline: "none",
                }}
              >
                {options.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}

          <div style={{ width: 1, height: 20, background: "var(--color-border)", margin: "0 4px" }} />

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FILTER_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => { setActiveTag(tag); resetPage(); }}
                style={{
                  padding: "5px 11px",
                  borderRadius: 99,
                  border: "1.5px solid",
                  borderColor: activeTag === tag ? "var(--color-primary)" : "var(--color-border)",
                  background: activeTag === tag ? "var(--color-secondary)" : "transparent",
                  color: activeTag === tag ? "var(--color-primary)" : "var(--color-muted-foreground)",
                  fontSize: 12,
                  fontWeight: activeTag === tag ? 600 : 400,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  transition: "all 0.15s",
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 13, color: "var(--color-muted-foreground)", marginBottom: 16 }}>
          <strong style={{ color: "var(--color-foreground)", fontWeight: 700 }}>{display.length}개</strong>의 결과
        </p>

        {display.length > 0 ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {paginated.map((b, idx) => (
                <div key={`${b.id}-${idx}`}>
                  <BenefitCard
                    {...b}
                    liked={likedIds.has(b.id)}
                    onToggleLike={() => toggleLike(b.id)}
                    showDetailBtn
                    onDetailClick={() => goDetail(b)}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 32 }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ width: 36, height: 36, borderRadius: 9, border: "1.5px solid var(--color-border)", background: "transparent", color: page === 1 ? "#C4C9D4" : "var(--color-foreground)", cursor: page === 1 ? "default" : "pointer", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.14s" }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    style={{ width: 36, height: 36, borderRadius: 9, border: "1.5px solid", borderColor: p === page ? "var(--color-primary)" : "var(--color-border)", background: p === page ? "var(--color-secondary)" : "transparent", color: p === page ? "var(--color-primary)" : "var(--color-foreground)", fontWeight: p === page ? 700 : 400, fontSize: 14, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.14s" }}
                  >{p}</button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ width: 36, height: 36, borderRadius: 9, border: "1.5px solid var(--color-border)", background: "transparent", color: page === totalPages ? "#C4C9D4" : "var(--color-foreground)", cursor: page === totalPages ? "default" : "pointer", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.14s" }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--color-muted-foreground)" }}>
            <p style={{ fontSize: 15 }}>해당하는 혜택이 없습니다.</p>
            <p style={{ fontSize: 13 }}>필터 조건을 변경해 보세요.</p>
          </div>
        )}
      </section>

      {/* ── 마감 임박 ── */}
      <section style={{ marginTop: 56 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 18, margin: 0, letterSpacing: "-0.3px" }}>지금 마감 임박</h2>
            <p style={{ fontSize: 13, color: "var(--color-muted-foreground)", margin: "4px 0 0" }}>기간 내 놓치지 마세요</p>
          </div>
          <button
            onClick={() => goSearch("")}
            style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--color-border)", background: "transparent", fontSize: 13, color: "var(--color-muted-foreground)", cursor: "pointer", fontFamily: "var(--font-sans)" }}
          >
            전체 보기
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {popular.map((b) => (
            <BenefitCard key={b.id} {...b} liked={likedIds.has(b.id)} onToggleLike={() => toggleLike(b.id)} />
          ))}
        </div>
      </section>
    </main>
  );
}
