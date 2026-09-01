import { useState } from "react";
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import MyPage from "./pages/MyPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import BenefitDetailPage from "./pages/BenefitDetailPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AgentPage from "./pages/AgentPage";
import Navbar from "./components/Navbar";
import type { Benefit } from "./data/benefits";
import { INITIAL_PROFILE } from "./constants";
import type { CategoryType, ProfileData } from "./constants";

export type Screen = "home" | "category" | "mypage" | "search" | "detail" | "login" | "signup" | "agent";
export type { CategoryType, ProfileData } from "./constants";
export { TYPE_EMOJI, TYPE_BADGE } from "./constants";

export default function App() {
  const [screen, setScreen] = useState<Screen>("agent");
  const [largeFontSize, setLargeFontSize] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("소상공인");
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set([1, 3]));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null);
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [agentInitQuery, setAgentInitQuery] = useState<string | null>(null);

  const toggleLike = (id: number) => {
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
    setSelectedBenefit(benefit);
    setScreen("detail");
  };

  const goAgentWithBenefit = (benefit: Benefit) => {
    setAgentInitQuery(`"${benefit.title}"에 대해 궁금한 점이 있어요. 신청 대상은 "${benefit.target ?? "확인 필요"}"이고 현재 상태는 ${benefit.status}${benefit.deadline != null ? ` (D-${benefit.deadline})` : ""}이에요. 이 혜택에 대해 더 자세히 알려주세요.`);
    setScreen("agent");
  };

  return (
    <div className={largeFontSize ? "large-font" : ""} style={{ minHeight: "100vh", background: "var(--color-background)", fontFamily: "var(--font-sans)" }}>
      <Navbar screen={screen} setScreen={setScreen} largeFontSize={largeFontSize} setLargeFontSize={setLargeFontSize} />
      {screen === "home" && (
        <HomePage likedIds={likedIds} toggleLike={toggleLike} goCategory={goCategory} goSearch={goSearch} />
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
      {screen === "detail" && selectedBenefit && (
        <BenefitDetailPage
          benefit={selectedBenefit}
          liked={likedIds.has(selectedBenefit.id)}
          onToggleLike={() => toggleLike(selectedBenefit.id)}
          goBack={() => setScreen("category")}
          goAgent={() => goAgentWithBenefit(selectedBenefit)}
        />
      )}
      {screen === "login" && <LoginPage setScreen={setScreen} />}
      {screen === "signup" && <SignupPage setScreen={setScreen} />}
      {screen === "agent" && (
        <AgentPage
          profile={profile}
          initQuery={agentInitQuery}
          onInitQueryConsumed={() => setAgentInitQuery(null)}
        />
      )}
    </div>
  );
}
