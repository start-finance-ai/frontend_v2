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

        </nav>
      </div>
    </header>
  );
}
