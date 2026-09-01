export type BenefitStatus = "신청 가능" | "신청 예정" | "마감" | "확인 필요";

export interface Benefit {
  id: number;
  tag: string;
  title: string;
  org: string;
  summary: string;
  target?: string;
  status: BenefitStatus;
  deadline?: number;
  amount?: string;
  categories: string[];
}

export const ALL_BENEFITS: Benefit[] = [
  {
    id: 1,
    tag: "사업화지원",
    title: "소상공인 경영안정 특별자금",
    org: "소상공인시장진흥공단",
    summary: "경영 위기 소상공인에게 최대 2천만원 무이자 긴급 지원",
    target: "사업자등록 1년 이상",
    status: "신청 가능",
    deadline: 3,
    amount: "최대 2,000만원",
    categories: ["소상공인"],
  },
  {
    id: 2,
    tag: "창업",
    title: "예비창업자 창업도약패키지",
    org: "중소벤처기업부",
    summary: "만 39세 이하 예비창업자·초기창업자 대상 사업화 자금 최대 1억원 지원",
    target: "만 39세 이하 예비창업자",
    status: "신청 가능",
    deadline: 14,
    amount: "최대 1억원",
    categories: ["예비창업자"],
  },
  {
    id: 3,
    tag: "기타",
    title: "서울 프리랜서 직무역량 바우처",
    org: "서울특별시",
    summary: "프리랜서 직업훈련비 최대 200만원 지원, 온·오프라인 강좌 모두 가능",
    target: "서울 거주 프리랜서",
    status: "신청 가능",
    deadline: 7,
    amount: "최대 200만원",
    categories: ["프리랜서"],
  },
  {
    id: 4,
    tag: "사업화지원",
    title: "소상공인 디지털 전환 지원사업",
    org: "소상공인시장진흥공단",
    summary: "온라인 판매채널 구축·스마트기기 도입 비용 최대 400만원 보조",
    target: "오프라인 소상공인",
    status: "신청 예정",
    amount: "최대 400만원",
    categories: ["소상공인"],
  },
  {
    id: 5,
    tag: "예비창업자지원",
    title: "예비창업패키지 2025",
    org: "창업진흥원",
    summary: "사업화 자금 최대 1억원 + 전담 멘토링·교육 패키지 일괄 지원",
    target: "예비창업자",
    status: "신청 가능",
    deadline: 30,
    amount: "최대 1억원",
    categories: ["예비창업자"],
  },
  {
    id: 6,
    tag: "사업화지원",
    title: "경기도 소상공인 임차료 지원",
    org: "경기도",
    summary: "폐업 위기 소상공인 임차료 월 50만원, 최대 6개월 직접 지원",
    target: "경기도 소재 소상공인",
    status: "확인 필요",
    amount: "월 50만원 × 최대 6개월",
    categories: ["소상공인"],
  },
  {
    id: 7,
    tag: "기타",
    title: "프리랜서 고용보험 지원사업",
    org: "고용노동부",
    summary: "플랫폼·특수형태 종사자 고용보험료 최대 80% 지원, 상시 접수",
    target: "프리랜서·긱워커",
    status: "신청 가능",
    categories: ["프리랜서"],
  },
  {
    id: 8,
    tag: "창업공간지원",
    title: "창업보육센터 입주 지원",
    org: "창업진흥원",
    summary: "사무공간·멘토링·네트워킹 무상 제공, 최대 2년 입주 가능",
    target: "창업 3년 미만",
    status: "마감",
    categories: ["예비창업자", "소상공인"],
  },
];
