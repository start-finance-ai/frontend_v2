import type { Screen } from "../App";

interface NavbarProps {
  screen: Screen;
  setScreen: (s: Screen) => void;
  largeFontSize: boolean;
  setLargeFontSize: (v: boolean) => void;
}

const NAV_TABS = [
  { key: "agent",    label: "AI모드" },
  { key: "category", label: "지원사업" },
  { key: "mypage",   label: "마이페이지" },
];

export default function Navbar({ screen, setScreen, largeFontSize, setLargeFontSize }: NavbarProps) {
  return (
    <header
      style={{
        background: "rgba(255,255,255,0.95)",
        borderBottom: "1px solid #E5E7EB",
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 0 0",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* FIN-BRIDGE 로고 */}
        <div style={{ display: "flex", alignItems: "center", cursor: "default", userSelect: "none" }}>
          <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-0.5px", color: "#111827", fontFamily: "var(--font-sans)" }}>
            FIN<span style={{ color: "#1B4DFF" }}>-BRIDGE</span>
          </span>
        </div>

        <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {NAV_TABS.map(({ key, label }) => {
            const isActive = screen === key;
            return (
              <button
                key={key}
                onClick={() => setScreen(key as Screen)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: isActive ? "#EEF2FF" : "transparent",
                  color: isActive ? "#1B4DFF" : "#6B7280",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "background 0.14s, color 0.14s",
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "-0.1px",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6";
                    (e.currentTarget as HTMLButtonElement).style.color = "#374151";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = "#6B7280";
                  }
                }}
              >
                {label}
              </button>
            );
          })}

          <div style={{ width: 1, height: 18, background: "#E5E7EB", margin: "0 10px" }} />

          {/* Font size toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 8 }}>
            <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, letterSpacing: "-0.1px", whiteSpace: "nowrap" }}>글자 크기</span>
            <div style={{
              display: "inline-flex",
              background: "#F3F4F6",
              borderRadius: 99, padding: 3,
              border: "1px solid #E5E7EB",
            }}>
              <button onClick={() => setLargeFontSize(false)}
                style={{
                  padding: "4px 11px", borderRadius: 99, border: "none", cursor: "pointer",
                  fontFamily: "var(--font-sans)", fontWeight: !largeFontSize ? 700 : 500,
                  fontSize: 12, transition: "all 0.18s",
                  background: !largeFontSize ? "#fff" : "transparent",
                  color: !largeFontSize ? "#1B4DFF" : "#9CA3AF",
                  boxShadow: !largeFontSize ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                  lineHeight: 1.4,
                }}
              >
                보통
              </button>
              <button onClick={() => setLargeFontSize(true)}
                style={{
                  padding: "4px 11px", borderRadius: 99, border: "none", cursor: "pointer",
                  fontFamily: "var(--font-sans)", fontWeight: largeFontSize ? 700 : 500,
                  fontSize: 13, transition: "all 0.18s",
                  background: largeFontSize ? "#fff" : "transparent",
                  color: largeFontSize ? "#1B4DFF" : "#9CA3AF",
                  boxShadow: largeFontSize ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                  lineHeight: 1.4,
                }}
              >
                크게
              </button>
            </div>
          </div>

          <button
            onClick={() => setScreen("login")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              border: "1.5px solid #E5E7EB",
              background: screen === "login" ? "#EEF2FF" : "transparent",
              color: screen === "login" ? "#1B4DFF" : "#374151",
              fontWeight: screen === "login" ? 600 : 400,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              transition: "all 0.14s",
              letterSpacing: "-0.1px",
            }}
            onMouseEnter={(e) => {
              if (screen !== "login") {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#C7D2FE";
                (e.currentTarget as HTMLButtonElement).style.background = "#F9FAFB";
              }
            }}
            onMouseLeave={(e) => {
              if (screen !== "login") {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB";
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }
            }}
          >
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
              <circle cx="7.5" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 13c0-2.5 2.5-4.5 5.5-4.5S13 10.5 13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            로그인
          </button>

          <button
            onClick={() => setScreen("signup")}
            style={{
              padding: "7px 16px",
              borderRadius: 8,
              border: "none",
              background: "#1B4DFF",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              letterSpacing: "-0.1px",
              transition: "background 0.14s",
              marginLeft: 4,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1640D6"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1B4DFF"; }}
          >
            회원가입
          </button>
        </nav>
      </div>
    </header>
  );
}
