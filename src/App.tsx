import { useState } from "react";
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import MyPage from "./pages/MyPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import BenefitDetailPage from "./pages/BenefitDetailPage";
import AgentPage from "./pages/AgentPage";
import Navbar from "./components/Navbar";
import type { Program } from "./api/types";
import type { Benefit } from "./data/benefits";
import { INITIAL_PROFILE } from "./constants";
import type { CategoryType, ProfileData } from "./constants";

export type Screen = "home" | "category" | "mypage" | "search" | "detail" | "agent";
export type { CategoryType, ProfileData } from "./constants";
export { TYPE_EMOJI, TYPE_BADGE } from "./constants";

export default function App() {
  const [screen, setScreen] = useState<Screen>("agent");
  const [largeFontSize, setLargeFontSize] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("소상공인");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [agentInitQuery, setAgentInitQuery] = useState<string | null>(null);
  const [agentProgramId, setAgentProgramId] = useState<string | null>(null);

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const goCategory = (cat: CategoryType) => {
    setSelectedCategory(cat);
    setScreen("category");
  };

  const goSearch = (q: string) => {
    setSearchQuery(q);
    setScreen("search");
  };

  const goDetail = (benefit: Benefit) => {
    setSelectedProgramId(benefit.id);
    setScreen("detail");
  };

  const goAgentWithProgram = (program: Program) => {
    setAgentProgramId(program.program_id);
    setAgentInitQuery(`"${program.program_name}" 공고의 신청 대상과 준비사항을 알려주세요.`);
    setScreen("agent");
  };

  return (
    <div className={largeFontSize ? "large-font" : ""} style={{ minHeight: "100vh", background: "var(--color-background)", fontFamily: "var(--font-sans)" }}>
      <Navbar screen={screen} setScreen={setScreen} largeFontSize={largeFontSize} setLargeFontSize={setLargeFontSize} />
      {screen === "home" && (
        <HomePage likedIds={likedIds} toggleLike={toggleLike} goCategory={goCategory} goSearch={goSearch} goDetail={goDetail} />
      )}
      {screen === "category" && (
        <CategoryPage
          category={selectedCategory}
          likedIds={likedIds}
          toggleLike={toggleLike}
          setScreen={setScreen}
          goDetail={goDetail}
          goSearch={goSearch}
          goCategory={goCategory}
        />
      )}
      {screen === "mypage" && (
        <MyPage likedIds={likedIds} toggleLike={toggleLike} profile={profile} setProfile={setProfile} />
      )}
      {screen === "search" && (
        <SearchResultsPage query={searchQuery} likedIds={likedIds} toggleLike={toggleLike} goDetail={goDetail} goSearch={goSearch} />
      )}
      {screen === "detail" && selectedProgramId && (
        <BenefitDetailPage
          programId={selectedProgramId}
          liked={likedIds.has(selectedProgramId)}
          onToggleLike={() => toggleLike(selectedProgramId)}
          goBack={() => setScreen("category")}
          goAgent={goAgentWithProgram}
        />
      )}
      {screen === "agent" && (
        <AgentPage
          profile={profile}
          initQuery={agentInitQuery}
          programId={agentProgramId}
          onOpenProgram={(programId) => {
            setSelectedProgramId(programId);
            setScreen("detail");
          }}
          onInitQueryConsumed={() => setAgentInitQuery(null)}
        />
      )}
    </div>
  );
}
