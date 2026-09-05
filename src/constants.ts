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
  name: "사용자",
  userType: "예비창업자",
  stage: "",
  region: "",
  capital: "",
  industry: "",
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
