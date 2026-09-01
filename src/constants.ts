export type CategoryType = "예비창업자" | "소상공인" | "프리랜서";

export interface ProfileData {
  name: string;
  userType: CategoryType;
  stage: string;
  region: string;
  capital: string;
  industry: string;
}

export const INITIAL_PROFILE: ProfileData = {
  name: "김민준",
  userType: "예비창업자",
  stage: "아이디어 검증 중",
  region: "서울 마포구",
  capital: "5,000만원",
  industry: "IT·소프트웨어",
};

export const TYPE_EMOJI: Record<CategoryType, string> = {
  예비창업자: "🚀",
  소상공인: "🏪",
  프리랜서: "💻",
};

export const TYPE_BADGE: Record<CategoryType, { bg: string; color: string }> = {
  예비창업자: { bg: "#EEF2FF", color: "#1B4DFF" },
  소상공인:   { bg: "#ECFDF5", color: "#059669" },
  프리랜서:   { bg: "#F3E8FF", color: "#7C3AED" },
};
