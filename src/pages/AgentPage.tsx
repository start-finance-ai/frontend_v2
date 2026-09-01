import { useState, useRef, useEffect } from "react";
import type { ProfileData } from "../constants";
import { TYPE_EMOJI, TYPE_BADGE } from "../constants";
import StatusBanner, { type BannerStatus } from "../components/StatusBanner";

interface AgentPageProps {
  profile: ProfileData;
  initQuery?: string | null;
  onInitQueryConsumed?: () => void;
}

interface Source {
  name: string;
  url: string;
}

interface Message {
  role: "user" | "agent";
  text: string;
  id: number;
  sources?: Source[];
  suggestAdvanced?: boolean;
}

interface Conversation {
  id: number;
  title: string;
  date: string;
  messages: Message[];
  mode: "normal" | "advanced";
}

const SUGGESTED_NORMAL = [
  { label: "대구에서 창업을 준비 중인데 받을 수 있는 지원사업을 알려줘" },
  { label: "지금 신청 가능한 창업 지원사업을 알려줘" },
  { label: "제가 지원할 수 있는 사업의 조건과 부족한 정보를 알려줘" },
  { label: "이 공고에 제가 지원할 수 있는지 확인해줘" },
];

const SUGGESTED_ADVANCED = [
  { label: "입력한 조건에서 지원 가능성이 가장 높은 사업을 알려줘" },
  { label: "내 상황에서 조건이 맞는 창업 지원사업이 있는지 확인해줘" },
  { label: "비슷한 조건의 다른 사람들이 많이 신청하는 지원사업은?" },
  { label: "내 업종·지역에서 신청 가능한 사업화 지원을 찾아줘" },
];

// 자격·우선순위 등 조건 정확도가 중요한 질문 패턴
const CONDITION_CHECK_RE = /자격|될까|해당\s*될|우선순위|내가\s*받을|가능할까|신청\s*가능한지|조건이\s*맞|대상이\s*될|나도\s*받을|신청\s*될|받을\s*수\s*있을/;

const ADV_FIELD_KEYS = ["userType", "region", "age", "stage", "industry", "capital", "needs"];

const ADV_USER_TYPES = ["예비창업자", "소상공인", "프리랜서"];

const ADV_STAGE_OPTIONS: Record<string, string[]> = {
  "예비창업자": ["예비창업 단계", "사업계획 완성", "사업자등록 예정"],
  "소상공인": ["사업자등록 O / 업력 1년 미만", "업력 1~3년", "업력 3년 이상"],
  "프리랜서": ["활동 1년 미만", "활동 1~3년", "활동 3년 이상"],
};

const ADV_CAPITAL_RANGES = ["500만원 미만", "500만~1,000만원", "1,000만~3,000만원", "3,000만원 이상"];

const ADV_NEEDS_OPTIONS = ["지원사업", "정책자금·대출", "재무위험"];

interface ReplySet {
  texts: string[];
  sources: Source[];
}

const REPLIES: [RegExp, ReplySet][] = [
  [/카페|요식|음식|베이커리/, {
    texts: [
      "카페 창업을 준비 중이시군요! 요식업은 초기 자금과 입지가 중요한 만큼, 지원을 잘 활용하면 부담을 꽤 줄일 수 있어요.\n\n현재 정보 기준으로 우선 확인해볼 만한 지원들이에요.\n\n① 소상공인 창업패키지 (중소벤처기업부) — 우선 확인 1순위\n   최대 1억원 규모예요. 창업 3년 미만이면 해당될 수 있지만, 지역·업종 세부 조건이 있어 공고를 꼭 확인해보세요.\n\n② 청년창업사관학교 — 조건 확인 필요\n   교육과 자금을 함께 받을 수 있어요. 만 39세 이하 조건이 있으니 해당 여부를 먼저 확인해보세요.\n\n③ 지역신용보증재단 창업보증 — 추가 확인 필요\n   담보 없이 저금리 대출 보증을 받을 수 있어요. 신용 상태에 따라 조건이 달라질 수 있어요.\n\n더 구체적인 조건이 궁금하신 항목이 있으면 말씀해 주세요!",
    ],
    sources: [
      { name: "중소벤처기업부", url: "mss.go.kr" },
      { name: "소진공 창업지원", url: "semas.or.kr" },
      { name: "청년창업사관학교", url: "k-startup.go.kr" },
    ],
  }],
  [/대출|자금|융자|무이자/, {
    texts: [
      "대출이나 자금 조달을 알아보고 계시는군요. 사업자 등록 여부나 업종에 따라 조건이 달라지기 때문에, 상황에 맞게 고르는 게 중요해요.\n\n현재 정보 기준으로 우선 확인해볼 만한 상품들이에요.\n\n① 소진공 소상공인 정책자금 — 우선 확인 1순위\n   연 2.5% 고정금리, 최대 7천만원 규모예요. 신용도와 업종 조건이 있어 공식 사이트에서 자세히 확인해보세요.\n\n② 신용보증기금 창업기업 보증 — 조건 확인 필요\n   무담보로 최대 1억원까지 보증이 가능해요. 업력·매출 기준 등 세부 조건이 있어요.\n\n③ 기업은행 소상공인 특별대출 — 추가 확인 필요\n   연 3.2% 수준으로 은행권 중 조건이 나은 편이에요. 심사 기준은 지점마다 다를 수 있어요.\n\n현재 사업자등록이 되어 있으신가요? 그에 따라 더 좁혀서 안내드릴 수 있어요.",
    ],
    sources: [
      { name: "소상공인진흥공단", url: "semas.or.kr" },
      { name: "신용보증기금", url: "kodit.co.kr" },
      { name: "IBK기업은행", url: "ibk.co.kr" },
    ],
  }],
  [/프리랜서|1인|긱/, {
    texts: [
      "프리랜서로 활동 중이시군요! 사실 프리랜서분들도 받을 수 있는 지원이 생각보다 꽤 많아요. 잘 알려지지 않아서 놓치는 경우가 많거든요.\n\n현재 정보 기준으로 우선 확인해볼 만한 혜택들이에요.\n\n① 고용보험 임의가입 — 우선 확인 1순위\n   월 2만 8천원 정도를 내면 실업급여나 육아휴직급여를 받을 수 있어요. 소득 기준 요건이 있으니 자세한 조건은 공식 사이트를 확인해 주세요.\n\n② 청년 내일채움공제 (프리랜서형) — 조건 확인 필요\n   2년 적립 시 최대 900만원을 돌려받을 수 있어요. 만 34세 이하 조건이 있어 해당 여부를 먼저 확인해보세요.\n\n③ 국민내일배움카드 — 추가 확인 필요\n   국비 최대 200만원으로 자격증·직업훈련을 받을 수 있어요. 소득 기준에 따라 지원 금액이 달라질 수 있어요.\n\n어떤 분야로 활동 중이신지 알려주시면 더 맞는 혜택을 찾아드릴게요.",
    ],
    sources: [
      { name: "고용노동부", url: "moel.go.kr" },
      { name: "HRD-Net", url: "hrd.go.kr" },
      { name: "근로복지공단", url: "comwel.or.kr" },
    ],
  }],
  [/폐업|위기|긴급|어려|힘들/, {
    texts: [
      "많이 힘드신 상황인 것 같아서 먼저 당장 확인해볼 수 있는 긴급 지원부터 안내드릴게요.\n\n① 소상공인 경영위기 긴급자금 — 우선 확인 1순위\n   최대 2천만원, 연 2.0% 금리로 상시 접수 중이에요. 세부 조건은 소진공 사이트에서 꼭 확인해보세요.\n\n② 중소벤처기업부 재도전 지원 — 조건 확인 필요\n   폐업 준비 비용 및 재창업 교육·컨설팅을 지원받을 수 있어요. 지원 대상 기준이 있으니 공고를 확인해 주세요.\n\n③ 지자체 생계 안정 지원금 — 추가 확인 필요\n   서울 기준 최대 150만원으로, 지역마다 조건이 달라요. 주민센터에 먼저 문의해보는 것이 가장 빠를 수 있어요.\n\n현재 어느 지역에 계신지 알려주시면 지역별 추가 지원도 찾아드릴게요.",
    ],
    sources: [
      { name: "소상공인진흥공단", url: "semas.or.kr" },
      { name: "중소벤처기업부", url: "mss.go.kr" },
      { name: "서울시 자영업지원센터", url: "seoulsbdc.or.kr" },
    ],
  }],
];

const DEFAULT_SOURCES: Source[] = [
  { name: "중소벤처기업부", url: "mss.go.kr" },
  { name: "소상공인진흥공단", url: "semas.or.kr" },
  { name: "기업마당", url: "bizinfo.go.kr" },
];

function getAdvancedAnalysis(form: Record<string, string>): ReplySet {
  const userType = form.userType || "예비창업자";
  const region = form.region || "해당 지역";
  const age = Number(form.age) || 0;
  const stage = form.stage || "";
  const industry = form.industry || "해당 업종";
  const capital = form.capital || "";
  const needs = form.needs || "";

  const isYoung = age > 0 && age <= 39;
  const wantsLoan = needs.includes("정책자금·대출");
  const wantsSupport = needs.includes("지원사업");
  const wantsRisk = needs.includes("재무위험");

  let analysis = `${userType} / ${region} / ${industry} 기준으로 지원 가능한 혜택을 찾아봤어요.\n\n`;
  if (stage) analysis += `• 사업 단계: ${stage}\n`;
  if (capital) analysis += `• 준비 자본금: ${capital}\n`;
  analysis += "\n";

  let recs = "현재 상황에서 참고로 추천드리는 지원사업이에요:\n\n";

  if (wantsRisk || userType === "소상공인") {
    recs += "① 소상공인 경영위기 긴급자금\n   — 최대 2천만원 / 연 2.0% / 상시 접수\n\n";
    recs += "② 소진공 소상공인 정책자금\n   — 연 2.5% 고정 / 최대 7천만원\n\n";
    recs += "③ 신용보증기금 창업기업 보증\n   — 무담보 최대 1억원\n";
  } else if (wantsLoan) {
    recs += "① 소진공 소상공인 정책자금\n   — 연 2.5% 고정 / 최대 7천만원\n\n";
    recs += "② 지역신용보증재단 창업보증\n   — 저금리 대출 보증 / 상시 접수\n\n";
    recs += "③ 신용보증기금 창업기업 보증\n   — 무담보 최대 1억원\n";
  } else if (wantsSupport && isYoung) {
    recs += "① 청년창업사관학교\n   — 교육·멘토링·자금 패키지 (만 39세 이하)\n\n";
    recs += "② 소상공인 창업패키지\n   — 최대 1억원 사업화 자금\n\n";
    recs += "③ 청년 내일채움공제\n   — 2년 적립 시 최대 900만원 환급\n";
  } else {
    recs += "① 소상공인 창업패키지\n   — 최대 1억원 사업화 자금 지원\n\n";
    recs += "② 지자체 창업 지원금\n   — ${region} 지역 맞춤 지원\n\n";
    recs += "③ 기업마당 통합 검색\n   — 업종·지역·나이별 필터로 더 찾아보세요\n";
  }

  return {
    texts: [analysis + recs],
    sources: DEFAULT_SOURCES,
  };
}

function getReply(text: string, isAdvanced: boolean): ReplySet {
  for (const [re, replySet] of REPLIES) {
    if (re.test(text)) return replySet;
  }
  if (isAdvanced) {
    return {
      texts: [
        "추가로 궁금한 내용이 있으신가요?\n\n입력하신 재무 정보 기반으로 더 구체적인 분석도 도와드릴 수 있어요.",
      ],
      sources: DEFAULT_SOURCES,
    };
  }
  return {
    texts: [
      "말씀하신 내용을 확인했어요. 조금 더 구체적으로 알려주시면 더 정확한 혜택을 찾아드릴 수 있어요.",
      "우선 현재 인기 혜택 Top 3를 알려드릴게요:\n\n① 소상공인 창업패키지 — 최대 1억원\n② 청년창업사관학교 — 교육 + 자금 연계\n③ 소진공 소상공인 정책자금 — 연 2.5% 저금리\n\n어떤 상황이신지 더 말씀해주시면 맞춤 추천을 드릴게요.",
    ],
    sources: DEFAULT_SOURCES,
  };
}

function formatDate(d: Date) {
  const today = new Date();
  const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "오늘";
  if (diff === 1) return "어제";
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

let globalMsgId = 0;
let globalConvId = 100;

type AppMode = "select" | "normal" | "advanced";

export default function AgentPage({ profile, initQuery, onInitQueryConsumed }: AgentPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [appMode, setAppMode] = useState<AppMode>("select");
  const [advForm, setAdvForm] = useState<Record<string, string>>({});
  const [advSubmitted, setAdvSubmitted] = useState(false);
  const [chatStatus, setChatStatus] = useState<BannerStatus | null>(null);
  const lastUserInputRef = useRef<string>("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages, isTyping]);

  useEffect(() => {
    if (initQuery) {
      setAppMode("normal");
      setTimeout(() => {
        send(initQuery);
        onInitQueryConsumed?.();
      }, 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNewConv = () => {
    setActiveConvId(null);
    setInput("");
    setAdvSubmitted(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const submitAdvancedForm = () => {
    const { texts, sources } = getAdvancedAnalysis(advForm);
    setAdvSubmitted(true);
    const convId = ++globalConvId;
    const autoMsg: Message = { role: "agent", text: texts[0], id: ++globalMsgId, sources };
    const conv: Conversation = {
      id: convId,
      title: "재무 분석 결과",
      date: formatDate(new Date()),
      messages: [autoMsg],
      mode: "advanced",
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveConvId(convId);
  };

  const resetToSelect = () => {
    setAppMode("select");
    setActiveConvId(null);
    setInput("");
    setAdvForm({});
    setAdvSubmitted(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const switchMode = (mode: AppMode) => {
    setAppMode(mode);
    setActiveConvId(null);
    setInput("");
    setAdvForm({});
    setAdvSubmitted(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const detectBannerStatus = (reply: string, userQuery: string): BannerStatus | null => {
    if (/조금 더 구체적으로|우선 현재 인기 혜택 Top/.test(reply)) return "empty";
    if (CONDITION_CHECK_RE.test(userQuery) && /추가 확인 필요/.test(reply)) return "needs-review";
    return null;
  };

  const send = (text: string) => {
    if (!text.trim() || isTyping) return;
    lastUserInputRef.current = text.trim();
    setChatStatus(null);
    const isAdv = appMode === "advanced";

    const userMsg: Message = { role: "user", text: text.trim(), id: ++globalMsgId };

    let convId = activeConvId;
    if (!convId) {
      convId = ++globalConvId;
      const newConv: Conversation = {
        id: convId,
        title: text.trim().slice(0, 28) + (text.trim().length > 28 ? "…" : ""),
        date: formatDate(new Date()),
        messages: [userMsg],
        mode: isAdv ? "advanced" : "normal",
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(convId);
    } else {
      setConversations((prev) =>
        prev.map((c) => c.id === convId ? { ...c, messages: [...c.messages, userMsg] } : c)
      );
    }

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsTyping(true);

    const { texts, sources } = getReply(text, isAdv);
    const needsAdvanced = !isAdv && CONDITION_CHECK_RE.test(text);
    let delay = 800;
    const capturedConvId = convId;
    texts.forEach((reply, i) => {
      setTimeout(() => {
        const isLast = i === texts.length - 1;
        const agentMsg: Message = { role: "agent", text: reply, id: ++globalMsgId, sources: isLast ? sources : undefined, suggestAdvanced: isLast && needsAdvanced };
        setConversations((prev) =>
          prev.map((c) => c.id === capturedConvId ? { ...c, messages: [...c.messages, agentMsg] } : c)
        );
        if (isLast) {
          setIsTyping(false);
          const detected = detectBannerStatus(reply, lastUserInputRef.current);
          if (detected) setChatStatus(detected);
        }
      }, delay);
      delay += 1300;
    });
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const badge = TYPE_BADGE[profile.userType] ?? TYPE_BADGE["예비창업자"];

  const advFilledCount = ADV_FIELD_KEYS.filter(k => (advForm[k] ?? "").trim() !== "").length;
  const canChat = appMode === "normal" || (appMode === "advanced" && advSubmitted);
  const isAdvanced = appMode === "advanced";

  // bg gradient based on mode
  const mainBg = isAdvanced
    ? "linear-gradient(145deg, #060D1F 0%, #0B1E52 45%, #0F2D7A 100%)"
    : "linear-gradient(145deg, #EBF0FF 0%, #F5F7FF 50%, #EEF2FF 100%)";

  const glassBg = isAdvanced
    ? "rgba(255,255,255,0.09)"
    : "rgba(255,255,255,0.82)";
  const glassBlur = isAdvanced ? "blur(32px) saturate(180%)" : "blur(18px) saturate(140%)";
  const glassBorder = isAdvanced ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.75)";
  const glassBoxShadow = isAdvanced
    ? "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)"
    : "0 4px 20px rgba(27,77,255,0.07), inset 0 1px 0 rgba(255,255,255,0.9)";
  const textColor = isAdvanced ? "#F0F4FF" : "#111827";
  const mutedColor = isAdvanced ? "rgba(180,200,255,0.65)" : "#6B7280";

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)", background: mainBg, transition: "background 0.4s" }}>

      {/* ══ Sidebar ══ */}
      <aside style={{
        width: 260, flexShrink: 0,
        background: isAdvanced ? "rgba(10,22,60,0.7)" : "rgba(255,255,255,0.75)",
        backdropFilter: glassBlur, WebkitBackdropFilter: glassBlur,
        borderRight: isAdvanced ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E5E7EB",
        display: "flex", flexDirection: "column", overflow: "hidden",
        transition: "background 0.4s",
      }}>

        {/* Mode toggle + new chat */}
        <div style={{ padding: "16px 14px 12px" }}>
          {appMode !== "select" && (
            <div style={{ display: "flex", marginBottom: 10 }}>
              <div style={{
                display: "flex", width: "100%",
                background: isAdvanced ? "rgba(255,255,255,0.07)" : "#F3F4F6",
                borderRadius: 99, padding: 3,
                border: isAdvanced ? "1px solid rgba(255,255,255,0.1)" : "none",
              }}>
                {(["normal", "advanced"] as AppMode[]).map((m) => {
                  const active = appMode === m;
                  return (
                    <button key={m} onClick={() => switchMode(m)} style={{
                      flex: 1, padding: "6px 0", borderRadius: 99, border: "none", cursor: "pointer",
                      fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: active ? 700 : 500,
                      transition: "all 0.18s",
                      background: active
                        ? (m === "advanced" ? "linear-gradient(90deg,#6366F1,#1B4DFF)" : "#fff")
                        : "transparent",
                      color: active
                        ? (m === "advanced" ? "#fff" : "#1B4DFF")
                        : mutedColor,
                      boxShadow: active ? "0 1px 5px rgba(0,0,0,0.12)" : "none",
                    }}>
                      {m === "normal" ? "일반" : "집중"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <button onClick={startNewConv}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10,
              border: isAdvanced ? "1.5px solid rgba(255,255,255,0.15)" : "1.5px solid #E5E7EB",
              background: activeConvId === null
                ? (isAdvanced ? "rgba(99,102,241,0.25)" : "#EEF2FF")
                : "transparent",
              color: activeConvId === null
                ? (isAdvanced ? "#A5B4FC" : "#1B4DFF")
                : mutedColor,
              fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            새 질문하기
          </button>
        </div>

        {/* History */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
          {conversations.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center" }}>
              <div style={{ width: 32, height: 32, margin: "0 auto 10px", borderRadius: 99, background: isAdvanced ? "rgba(255,255,255,0.08)" : "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v7a1 1 0 01-1 1H9l-3 3v-3H3a1 1 0 01-1-1V3z" stroke={isAdvanced ? "rgba(180,200,255,0.5)" : "#1B4DFF"} strokeWidth="1.4" strokeLinejoin="round"/></svg>
              </div>
              <p style={{ fontSize: 12, color: mutedColor, margin: 0, lineHeight: 1.7 }}>
                아직 질문한 기록이 없어요.<br />무엇이든 편하게 물어보세요.
              </p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 10, fontWeight: 700, color: mutedColor, padding: "4px 8px 8px", margin: 0, letterSpacing: "0.6px", textTransform: "uppercase" }}>대화 기록</p>
              {conversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                const convAdvanced = conv.mode === "advanced";
                return (
                  <div key={conv.id} style={{ position: "relative", marginBottom: 2 }}
                    onMouseEnter={(e) => { const btn = e.currentTarget.querySelector<HTMLElement>(".del-btn"); if (btn) btn.style.opacity = "1"; }}
                    onMouseLeave={(e) => { const btn = e.currentTarget.querySelector<HTMLElement>(".del-btn"); if (btn) btn.style.opacity = "0"; }}
                  >
                    <button onClick={() => { setActiveConvId(conv.id); setAppMode(conv.mode); }}
                      style={{
                        width: "100%", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3,
                        padding: "10px 36px 10px 12px", borderRadius: 9, border: "none",
                        background: isActive ? (isAdvanced ? "rgba(99,102,241,0.2)" : "#EEF2FF") : "transparent",
                        cursor: "pointer", fontFamily: "var(--font-sans)", textAlign: "left", transition: "background 0.12s",
                      }}
                      onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = isAdvanced ? "rgba(255,255,255,0.05)" : "#F9FAFB"; }}
                      onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 5, width: "100%" }}>
                        <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 99, background: convAdvanced ? "rgba(99,102,241,0.3)" : "#EEF2FF", color: convAdvanced ? "#A5B4FC" : "#1B4DFF", fontWeight: 600, flexShrink: 0 }}>
                          {convAdvanced ? "집중" : "일반"}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? (isAdvanced ? "#A5B4FC" : "#1B4DFF") : textColor, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {conv.title}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: mutedColor }}>{conv.date}</span>
                    </button>
                    <button className="del-btn"
                      onClick={(e) => { e.stopPropagation(); setConversations((prev) => prev.filter((c) => c.id !== conv.id)); if (activeConvId === conv.id) setActiveConvId(null); }}
                      style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", width: 24, height: 24, borderRadius: 6, border: "none", background: isAdvanced ? "rgba(255,255,255,0.1)" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: 0, transition: "opacity 0.15s, background 0.15s", color: mutedColor }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FEE2E2"; (e.currentTarget as HTMLButtonElement).style.color = "#DC2626"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = isAdvanced ? "rgba(255,255,255,0.1)" : "#F3F4F6"; (e.currentTarget as HTMLButtonElement).style.color = mutedColor; }}
                    >
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Profile footer */}
        <div style={{ borderTop: isAdvanced ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E5E7EB", padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 99, background: badge.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, border: `1.5px solid ${badge.color}28` }}>
              {TYPE_EMOJI[profile.userType]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: textColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.2px" }}>
                {profile.name}
              </p>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "1px 8px", borderRadius: 99, background: badge.bg, color: badge.color, display: "inline-block", marginTop: 2 }}>
                {profile.userType}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ══ Main content ══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 28px" }}>

            {/* ── Welcome / Form ── */}
            {!activeConv && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "calc(100vh - 180px)", justifyContent: "center", padding: "40px 0 60px" }}>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                  <h1 style={{ fontWeight: 800, fontSize: 30, margin: "0 0 12px", letterSpacing: "-0.7px", color: textColor, lineHeight: 1.2 }}>
                    무엇을 도와드릴까요?
                  </h1>
                  <p style={{ fontSize: 15, color: mutedColor, margin: 0, lineHeight: 1.7 }}>
                    {profile.name}님의 상황을 편하게 말씀해주세요.<br />맞춤 지원사업과 혜택을 바로 찾아드려요.
                  </p>
                </div>

                {/* 모드 선택 카드 */}
                {appMode === "select" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%" }}>
                    <button onClick={() => setAppMode("normal")}
                      style={{
                        padding: "26px 24px", borderRadius: 18, textAlign: "left", cursor: "pointer",
                        fontFamily: "var(--font-sans)",
                        background: "rgba(255,255,255,0.82)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
                        border: "1.5px solid rgba(255,255,255,0.8)",
                        boxShadow: "0 4px 24px rgba(27,77,255,0.07), inset 0 1px 0 rgba(255,255,255,1)",
                        transition: "all 0.2s", display: "flex", flexDirection: "column", gap: 14,
                      }}
                      onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = "#1B4DFF"; el.style.boxShadow = "0 10px 32px rgba(27,77,255,0.15), inset 0 1px 0 rgba(255,255,255,1)"; el.style.transform = "translateY(-3px)"; }}
                      onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = "rgba(255,255,255,0.8)"; el.style.boxShadow = "0 4px 24px rgba(27,77,255,0.07), inset 0 1px 0 rgba(255,255,255,1)"; el.style.transform = "translateY(0)"; }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 4a1 1 0 011-1h14a1 1 0 011 1v9a1 1 0 01-1 1H12l-4 4v-4H4a1 1 0 01-1-1V4z" fill="#C7D2FE"/><path d="M7 8h8M7 11h5" stroke="#1B4DFF" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 16, margin: "0 0 6px", color: "#111827", letterSpacing: "-0.3px" }}>일반 모드</p>
                        <p style={{ fontSize: 13, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>편하게 대화하듯 물어보고<br />필요한 정보를 찾아드려요</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#1B4DFF", fontSize: 12, fontWeight: 600 }}>
                        시작하기
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    </button>

                    <button onClick={() => setAppMode("advanced")}
                      style={{
                        padding: "26px 24px", borderRadius: 18, textAlign: "left", cursor: "pointer",
                        fontFamily: "var(--font-sans)",
                        background: "linear-gradient(145deg, #0B1E52 0%, #1B4DFF 100%)",
                        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                        border: "1.5px solid rgba(99,102,241,0.5)",
                        boxShadow: "0 4px 28px rgba(27,77,255,0.30), inset 0 1px 0 rgba(255,255,255,0.12)",
                        transition: "all 0.2s", display: "flex", flexDirection: "column", gap: 14,
                      }}
                      onMouseEnter={(e) => { const el = e.currentTarget; el.style.boxShadow = "0 12px 40px rgba(27,77,255,0.45), inset 0 1px 0 rgba(255,255,255,0.15)"; el.style.transform = "translateY(-3px)"; }}
                      onMouseLeave={(e) => { const el = e.currentTarget; el.style.boxShadow = "0 4px 28px rgba(27,77,255,0.30), inset 0 1px 0 rgba(255,255,255,0.12)"; el.style.transform = "translateY(0)"; }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(165,180,252,0.18)", border: "1px solid rgba(165,180,252,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="13" width="4" height="6" rx="1" fill="rgba(165,180,252,0.5)"/><rect x="9" y="9" width="4" height="10" rx="1" fill="rgba(165,180,252,0.75)"/><rect x="15" y="5" width="4" height="14" rx="1" fill="#A5B4FC"/></svg>
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 16, margin: "0 0 6px", color: "#fff", letterSpacing: "-0.3px" }}>집중 모드</p>
                        <p style={{ fontSize: 13, color: "rgba(200,215,255,0.75)", margin: 0, lineHeight: 1.6 }}>지원사업 매칭에 필요한 핵심 정보를<br />먼저 입력하면 더 구체적으로<br />조건을 확인해드려요</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#A5B4FC", fontSize: 12, fontWeight: 600 }}>
                        시작하기
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    </button>
                  </div>
                )}

                {/* 일반 모드 welcome */}
                {appMode === "normal" && (
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* AI 환영 말풍선 */}
                    <div style={{
                      background: "rgba(255,255,255,0.85)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
                      border: "1.5px solid rgba(255,255,255,0.85)",
                      boxShadow: "0 4px 20px rgba(27,77,255,0.06), inset 0 1px 0 rgba(255,255,255,1)",
                      borderRadius: 16, padding: "18px 20px",
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 99, background: "linear-gradient(135deg,#1B4DFF,#6366F1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2L9.5 6.5H14.5L10.5 9.5L12 14L8 11L4 14L5.5 9.5L1.5 6.5H6.5L8 2Z" fill="white" /></svg>
                        </div>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 3px", letterSpacing: "-0.2px" }}>
                            반갑습니다, {profile.name}님!
                          </p>
                          <p style={{ fontSize: 13, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
                            무엇이든 편하게 물어보세요. 맞춤 지원사업과 혜택을 바로 찾아드려요.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 추천 질문 */}
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", margin: "0 0 10px 2px", letterSpacing: "0.5px", textTransform: "uppercase" }}>추천 질문</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {SUGGESTED_NORMAL.map(({ label }) => (
                          <button key={label} onClick={() => send(label)}
                            style={{
                              padding: "16px 18px", borderRadius: 14, cursor: "pointer", fontFamily: "var(--font-sans)",
                              display: "flex", alignItems: "flex-start", transition: "all 0.18s",
                              background: "rgba(255,255,255,0.82)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
                              border: "1.5px solid rgba(255,255,255,0.75)", textAlign: "left",
                              boxShadow: "0 2px 10px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
                            }}
                            onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = "#C7D2FE"; el.style.boxShadow = "0 6px 20px rgba(27,77,255,0.11)"; el.style.transform = "translateY(-2px)"; }}
                            onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = "rgba(255,255,255,0.75)"; el.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)"; el.style.transform = "translateY(0)"; }}
                          >
                            <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.55, fontWeight: 500 }}>{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 집중 모드 form — 집중모드 1회 입력 */}
                {appMode === "advanced" && !advSubmitted && (
                  <div style={{ width: "100%" }}>
                    <div style={{ background: glassBg, backdropFilter: glassBlur, WebkitBackdropFilter: glassBlur, border: glassBorder, boxShadow: glassBoxShadow, borderRadius: 18, padding: "28px 28px 26px" }}>

                      {/* Header */}
                      <div style={{ marginBottom: 20 }}>
                        <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.4px" }}>집중모드 · 1회 입력</p>
                        <p style={{ fontSize: 13, color: "rgba(200,215,255,0.85)", margin: "0 0 6px", letterSpacing: "-0.2px" }}>정확한 분석을 위해 조건을 알려주세요</p>
                        <p style={{ fontSize: 11, color: "rgba(165,180,252,0.5)", margin: 0, lineHeight: 1.65 }}>처음 한 번만 입력하면, 이후에는 편하게 대화하듯 이용하실 수 있어요.</p>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                        {/* 1. 사용자 유형 */}
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(200,215,255,0.75)", display: "block", marginBottom: 8, letterSpacing: "0.2px" }}>사용자 유형</label>
                          <div style={{ display: "flex", gap: 8 }}>
                            {ADV_USER_TYPES.map((t) => {
                              const sel = advForm.userType === t;
                              return (
                                <button key={t} onClick={() => setAdvForm((p) => ({ ...p, userType: t, stage: "" }))}
                                  style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: `1.5px solid ${sel ? "#6366F1" : "rgba(255,255,255,0.12)"}`, background: sel ? "rgba(67,56,202,0.85)" : "rgba(255,255,255,0.06)", color: sel ? "#fff" : "rgba(200,215,255,0.55)", fontWeight: sel ? 800 : 500, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s", boxShadow: sel ? "0 0 0 3px rgba(99,102,241,0.28), inset 0 1px 0 rgba(255,255,255,0.18)" : "none" }}>
                                  {t}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 2 + 3. 지역 + 나이 */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(200,215,255,0.75)", display: "block", marginBottom: 8, letterSpacing: "0.2px" }}>활동·사업 지역</label>
                            <input
                              type="text" placeholder="예: 서울 마포구"
                              value={advForm.region ?? ""}
                              onChange={(e) => setAdvForm((p) => ({ ...p, region: e.target.value }))}
                              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${advForm.region ? "rgba(165,180,252,0.5)" : "rgba(255,255,255,0.12)"}`, background: "rgba(255,255,255,0.07)", color: "#F0F4FF", fontSize: 13, fontFamily: "var(--font-sans)", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }}
                              onFocus={(e) => (e.target.style.borderColor = "rgba(165,180,252,0.7)")}
                              onBlur={(e) => (e.target.style.borderColor = advForm.region ? "rgba(165,180,252,0.5)" : "rgba(255,255,255,0.12)")}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(200,215,255,0.75)", display: "block", marginBottom: 8, letterSpacing: "0.2px" }}>나이 <span style={{ fontWeight: 400, color: "rgba(165,180,252,0.45)", fontSize: 10 }}>(만 나이)</span></label>
                            <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.07)", border: `1px solid ${advForm.age ? "rgba(165,180,252,0.5)" : "rgba(255,255,255,0.12)"}`, borderRadius: 10, overflow: "hidden", transition: "border-color 0.15s" }}>
                              <input type="number" placeholder="예: 29" value={advForm.age ?? ""} onChange={(e) => setAdvForm((p) => ({ ...p, age: e.target.value }))}
                                onFocus={(e) => (e.currentTarget.parentElement!.style.borderColor = "rgba(165,180,252,0.7)")}
                                onBlur={(e) => (e.currentTarget.parentElement!.style.borderColor = advForm.age ? "rgba(165,180,252,0.5)" : "rgba(255,255,255,0.12)")}
                                style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: "#F0F4FF", fontSize: 13, padding: "10px 12px", fontFamily: "var(--font-sans)" }}
                              />
                              <span style={{ padding: "0 10px", fontSize: 11, color: "rgba(165,180,252,0.45)", flexShrink: 0 }}>세</span>
                            </div>
                          </div>
                        </div>

                        {/* 4. 사업 단계 */}
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(200,215,255,0.75)", display: "block", marginBottom: 8, letterSpacing: "0.2px" }}>사업 단계</label>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {(ADV_STAGE_OPTIONS[advForm.userType ?? ""] ?? ADV_STAGE_OPTIONS["예비창업자"]).map((s) => {
                              const sel = advForm.stage === s;
                              return (
                                <button key={s} onClick={() => setAdvForm((p) => ({ ...p, stage: s }))}
                                  style={{ padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${sel ? "#6366F1" : "rgba(255,255,255,0.12)"}`, background: sel ? "rgba(67,56,202,0.85)" : "rgba(255,255,255,0.06)", color: sel ? "#fff" : "rgba(200,215,255,0.55)", fontWeight: sel ? 800 : 500, fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s", boxShadow: sel ? "0 0 0 3px rgba(99,102,241,0.28), inset 0 1px 0 rgba(255,255,255,0.18)" : "none" }}>
                                  {s}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 5. 업종 */}
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(200,215,255,0.75)", display: "block", marginBottom: 8, letterSpacing: "0.2px" }}>업종</label>
                          <input
                            type="text" placeholder="예: 카페, IT 서비스, 디자인, 소매업..."
                            value={advForm.industry ?? ""}
                            onChange={(e) => setAdvForm((p) => ({ ...p, industry: e.target.value }))}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${advForm.industry ? "rgba(165,180,252,0.5)" : "rgba(255,255,255,0.12)"}`, background: "rgba(255,255,255,0.07)", color: "#F0F4FF", fontSize: 13, fontFamily: "var(--font-sans)", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }}
                            onFocus={(e) => (e.target.style.borderColor = "rgba(165,180,252,0.7)")}
                            onBlur={(e) => (e.target.style.borderColor = advForm.industry ? "rgba(165,180,252,0.5)" : "rgba(255,255,255,0.12)")}
                          />
                        </div>

                        {/* 6. 준비 자본금 */}
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(200,215,255,0.75)", display: "block", marginBottom: 8, letterSpacing: "0.2px" }}>준비 자본금</label>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {ADV_CAPITAL_RANGES.map((r) => {
                              const sel = advForm.capital === r;
                              return (
                                <button key={r} onClick={() => setAdvForm((p) => ({ ...p, capital: p.capital === r ? "" : r }))}
                                  style={{ padding: "8px 12px", borderRadius: 10, border: `1.5px solid ${sel ? "#6366F1" : "rgba(255,255,255,0.12)"}`, background: sel ? "rgba(67,56,202,0.85)" : "rgba(255,255,255,0.06)", color: sel ? "#fff" : "rgba(200,215,255,0.55)", fontWeight: sel ? 800 : 500, fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s", boxShadow: sel ? "0 0 0 3px rgba(99,102,241,0.28), inset 0 1px 0 rgba(255,255,255,0.18)" : "none" }}>
                                  {r}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 7. 지금 가장 필요한 것 (복수 선택) */}
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(200,215,255,0.75)", display: "block", marginBottom: 4, letterSpacing: "0.2px" }}>지금 가장 필요한 것 <span style={{ fontWeight: 400, color: "rgba(165,180,252,0.45)", fontSize: 10 }}>(복수 선택)</span></label>
                          <p style={{ fontSize: 10, color: "rgba(165,180,252,0.4)", margin: "0 0 8px", lineHeight: 1.5 }}>성별·자격증·교육 등은 공고 요구 시 이후 대화에서 확인합니다</p>
                          <div style={{ display: "flex", gap: 8 }}>
                            {ADV_NEEDS_OPTIONS.map((n) => {
                              const currentNeeds = (advForm.needs ?? "").split(",").filter(Boolean);
                              const sel = currentNeeds.includes(n);
                              return (
                                <button key={n} onClick={() => {
                                  const next = sel ? currentNeeds.filter((x) => x !== n) : [...currentNeeds, n];
                                  setAdvForm((p) => ({ ...p, needs: next.join(",") }));
                                }}
                                  style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1.5px solid ${sel ? "#6366F1" : "rgba(255,255,255,0.12)"}`, background: sel ? "rgba(67,56,202,0.85)" : "rgba(255,255,255,0.06)", color: sel ? "#fff" : "rgba(200,215,255,0.55)", fontWeight: sel ? 800 : 500, fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s", boxShadow: sel ? "0 0 0 3px rgba(99,102,241,0.28), inset 0 1px 0 rgba(255,255,255,0.18)" : "none" }}>
                                  {n}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div style={{ marginTop: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, color: advFilledCount === ADV_FIELD_KEYS.length ? "rgba(165,180,252,0.9)" : "rgba(165,180,252,0.45)" }}>
                          {advFilledCount} / {ADV_FIELD_KEYS.length} 항목 입력됨
                          {advFilledCount === ADV_FIELD_KEYS.length && " — 준비됐어요"}
                        </span>
                        <button
                          onClick={() => { if (advFilledCount === ADV_FIELD_KEYS.length) submitAdvancedForm(); }}
                          disabled={advFilledCount < ADV_FIELD_KEYS.length}
                          style={{
                            padding: "11px 26px", borderRadius: 11, border: "none",
                            background: advFilledCount === ADV_FIELD_KEYS.length ? "linear-gradient(90deg,#6366F1 0%,#1B4DFF 100%)" : "rgba(255,255,255,0.08)",
                            color: advFilledCount === ADV_FIELD_KEYS.length ? "#fff" : "rgba(255,255,255,0.25)",
                            fontWeight: 700, fontSize: 13, cursor: advFilledCount === ADV_FIELD_KEYS.length ? "pointer" : "default",
                            fontFamily: "var(--font-sans)", transition: "all 0.18s",
                            boxShadow: advFilledCount === ADV_FIELD_KEYS.length ? "0 4px 16px rgba(99,102,241,0.4)" : "none",
                          }}
                        >
                          분석 시작하기
                        </button>
                      </div>
                    </div>

                    {/* 예시 질문 */}
                    <div style={{ marginTop: 16 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(165,180,252,0.55)", margin: "0 0 10px 2px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                        집중 모드 예시 질문{advFilledCount < ADV_FIELD_KEYS.length && <span style={{ fontWeight: 400, color: "rgba(165,180,252,0.4)", marginLeft: 6 }}>— 7개 항목 입력 후 선택 가능</span>}
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {SUGGESTED_ADVANCED.map(({ label }) => (
                          <button key={label}
                            onClick={() => {
                              if (advFilledCount < ADV_FIELD_KEYS.length) return;
                              submitAdvancedForm();
                              setTimeout(() => send(label), 1800);
                            }}
                            style={{
                              padding: "14px 16px", borderRadius: 12,
                              cursor: advFilledCount < ADV_FIELD_KEYS.length ? "not-allowed" : "pointer",
                              fontFamily: "var(--font-sans)",
                              display: "flex", alignItems: "flex-start", gap: 10, transition: "all 0.18s",
                              background: "rgba(255,255,255,0.07)", backdropFilter: glassBlur, WebkitBackdropFilter: glassBlur,
                              border: "1px solid rgba(255,255,255,0.12)", textAlign: "left",
                              opacity: advFilledCount < ADV_FIELD_KEYS.length ? 0.45 : 1,
                            }}
                            onMouseEnter={(e) => { if (advFilledCount < ADV_FIELD_KEYS.length) return; const el = e.currentTarget; el.style.background = "rgba(255,255,255,0.12)"; el.style.borderColor = "rgba(165,180,252,0.4)"; el.style.transform = "translateY(-1px)"; }}
                            onMouseLeave={(e) => { if (advFilledCount < ADV_FIELD_KEYS.length) return; const el = e.currentTarget; el.style.background = "rgba(255,255,255,0.07)"; el.style.borderColor = "rgba(255,255,255,0.12)"; el.style.transform = "translateY(0)"; }}
                          >
                            <span style={{ fontSize: 12, color: "rgba(220,230,255,0.8)", lineHeight: 1.5, fontWeight: 500 }}>{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {appMode === "advanced" && advSubmitted && (
                  <div style={{ width: "100%" }}>
                    <div style={{ background: "rgba(99,102,241,0.15)", backdropFilter: glassBlur, WebkitBackdropFilter: glassBlur, border: "1px solid rgba(165,180,252,0.3)", boxShadow: glassBoxShadow, borderRadius: 14, padding: "18px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 99, background: "rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7L5.5 10L11.5 4" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "#A5B4FC", margin: "0 0 2px" }}>재무 분석이 완료됐어요</p>
                          <p style={{ fontSize: 12, color: "rgba(165,180,252,0.6)", margin: 0 }}>추가 궁금한 점은 아래 채팅창에서 물어보세요.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Active conversation messages ── */}
            {activeConv && (
              <div style={{ paddingTop: 32, paddingBottom: 24, display: "flex", flexDirection: "column", gap: 18 }}>
                {activeConv.messages.map((msg) => (
                  <div key={msg.id} style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-end", gap: 10 }}>
                    {msg.role === "agent" && (
                      <div style={{ width: 30, height: 30, borderRadius: 99, background: isAdvanced ? "linear-gradient(135deg,#6366F1,#1B4DFF)" : "linear-gradient(135deg,#1B4DFF,#6366F1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff" }}><svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 2L9.5 6.5H14.5L10.5 9.5L12 14L8 11L4 14L5.5 9.5L1.5 6.5H6.5L8 2Z" fill="white" /></svg></div>
                    )}
                    <div style={{ maxWidth: "76%", display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{
                        padding: "12px 16px",
                        borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                        background: msg.role === "user"
                          ? (isAdvanced ? "linear-gradient(135deg,#6366F1,#1B4DFF)" : "#1B4DFF")
                          : glassBg,
                        backdropFilter: msg.role === "agent" ? glassBlur : undefined,
                        WebkitBackdropFilter: msg.role === "agent" ? glassBlur : undefined,
                        color: msg.role === "user" ? "#fff" : textColor,
                        fontSize: 14, lineHeight: 1.7, fontFamily: "var(--font-sans)", whiteSpace: "pre-wrap",
                        letterSpacing: "-0.1px",
                        boxShadow: msg.role === "user" ? "0 2px 10px rgba(27,77,255,0.22)" : "0 1px 6px rgba(0,0,0,0.08)",
                        border: msg.role === "agent" ? glassBorder : "none",
                      }}>
                        {msg.text}
                      </div>
                      {msg.role === "agent" && (
                        <p style={{ fontSize: 10, color: mutedColor, margin: "0 2px", lineHeight: 1.5 }}>
                          AI가 정리한 내용은 참고용이에요. 신청 전에는 공식 사이트에서 한 번 더 확인해 주세요.
                        </p>
                      )}
                      {msg.suggestAdvanced && (
                        <div style={{
                          marginTop: 4, padding: "14px 16px", borderRadius: 13,
                          background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
                          border: "1.5px solid #C7D2FE",
                          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                        }}>
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 700, color: "#1B4DFF", margin: "0 0 3px" }}>더 정확한 분석을 원하세요?</p>
                            <p style={{ fontSize: 11, color: "#6B7280", margin: 0, lineHeight: 1.5 }}>정보를 입력하면 맞춤 분석을 받을 수 있어요.</p>
                          </div>
                          <button onClick={() => { setAppMode("advanced"); setActiveConvId(null); setAdvSubmitted(false); }}
                            style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 9, border: "none", background: "#1B4DFF", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)", whiteSpace: "nowrap" }}>
                            집중 모드로
                          </button>
                        </div>
                      )}
                      {msg.sources && msg.sources.length > 0 && (
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", paddingLeft: 2 }}>
                          {msg.sources.map((src, si) => (
                            <div key={si} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 6, background: isAdvanced ? "rgba(255,255,255,0.1)" : "#F3F4F6", cursor: "pointer", transition: "background 0.13s" }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = isAdvanced ? "rgba(255,255,255,0.18)" : "#E5E7EB"; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = isAdvanced ? "rgba(255,255,255,0.1)" : "#F3F4F6"; }}
                            >
                              <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1 9L9 1M9 1H4M9 1V6" stroke={isAdvanced ? "rgba(165,180,252,0.6)" : "#9CA3AF"} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              <span style={{ fontSize: 11, color: mutedColor, fontWeight: 500 }}>{src.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div style={{ width: 30, height: 30, borderRadius: 99, background: badge.bg, border: `1.5px solid ${badge.color}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 700, color: badge.color }}>나</div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 99, background: isAdvanced ? "linear-gradient(135deg,#6366F1,#1B4DFF)" : "linear-gradient(135deg,#1B4DFF,#6366F1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff" }}><svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 2L9.5 6.5H14.5L10.5 9.5L12 14L8 11L4 14L5.5 9.5L1.5 6.5H6.5L8 2Z" fill="white" /></svg></div>
                    <div style={{ padding: "12px 16px", borderRadius: "4px 16px 16px 16px", background: glassBg, backdropFilter: glassBlur, WebkitBackdropFilter: glassBlur, border: glassBorder, boxShadow: "0 1px 6px rgba(0,0,0,0.08)", display: "flex", gap: 5, alignItems: "center" }}>
                      {[0, 1, 2].map((i) => (
                        <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: isAdvanced ? "#A5B4FC" : "#D1D5DB", display: "inline-block", animation: `dot 1.2s ease-in-out ${i * 0.18}s infinite` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* ── Input bar ── */}
        <div style={{
          background: isAdvanced ? "rgba(10,22,60,0.6)" : "rgba(247,248,250,0.85)",
          backdropFilter: glassBlur, WebkitBackdropFilter: glassBlur,
          padding: "12px 28px 22px",
          borderTop: isAdvanced ? "1px solid rgba(255,255,255,0.08)" : "1px solid #EFEFEF",
          transition: "background 0.4s",
        }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            {chatStatus && (
              <StatusBanner
                status={chatStatus}
                isAdvanced={isAdvanced}
                onRetry={() => { setChatStatus(null); send(lastUserInputRef.current); }}
                onDismiss={() => setChatStatus(null)}
              />
            )}
            {!canChat && appMode === "advanced" && (
              <p style={{ fontSize: 12, color: "rgba(165,180,252,0.7)", textAlign: "center", margin: "0 0 10px" }}>
                재무 정보를 입력하고 "분석 시작하기"를 눌러야 채팅이 활성화돼요.
              </p>
            )}
            <div
              style={{
                display: "flex", alignItems: "flex-end", gap: 10,
                background: isAdvanced ? "rgba(255,255,255,0.07)" : "#fff",
                border: isAdvanced ? "1.5px solid rgba(255,255,255,0.14)" : "1.5px solid #E5E7EB",
                borderRadius: 14, padding: "10px 10px 10px 16px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.07)", transition: "border-color 0.2s, box-shadow 0.2s",
                opacity: canChat ? 1 : 0.45,
                pointerEvents: canChat ? "auto" : "none",
              }}
            >
              <textarea ref={textareaRef} value={input}
                onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px"; }}
                onKeyDown={handleKey}
                placeholder={(appMode === "select" || (!activeConv && appMode === "normal")) ? "이대로 입력하고 전송하면 일반 모드로 바로 시작돼요" : "궁금한 점을 입력해주세요… (Enter 전송, Shift+Enter 줄바꿈)"}
                rows={1}
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, fontFamily: "var(--font-sans)", color: textColor, resize: "none", lineHeight: 1.6, maxHeight: 140, overflowY: "auto", padding: "5px 0" }}
              />
              <button onClick={() => send(input)} disabled={!input.trim() || isTyping}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: "none",
                  background: input.trim() && !isTyping ? (isAdvanced ? "linear-gradient(135deg,#6366F1,#1B4DFF)" : "#1B4DFF") : (isAdvanced ? "rgba(255,255,255,0.1)" : "#F3F4F6"),
                  color: input.trim() && !isTyping ? "#fff" : (isAdvanced ? "rgba(255,255,255,0.3)" : "#9CA3AF"),
                  cursor: input.trim() && !isTyping ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.18s",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M14 2L7 9M14 2L9.5 14L7 9L2 6.5L14 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <p style={{ fontSize: 11, color: mutedColor, textAlign: "center", margin: "8px 0 0" }}>
              AI가 정리한 내용은 참고용이에요. 신청 전에는 공식 사이트에서 한 번 더 확인해 주세요.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dot { 0%,80%,100%{transform:translateY(0);opacity:.3} 40%{transform:translateY(-4px);opacity:1} }
        textarea::placeholder { color: ${isAdvanced ? "rgba(255,255,255,0.3)" : "#9CA3AF"}; }
        input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </div>
  );
}
