import { useState } from "react";
import type { Screen } from "../App";

interface LoginPageProps {
  setScreen: (s: Screen) => void;
}

export default function LoginPage({ setScreen }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setScreen("mypage");
  };

  return (
    <main
      style={{
        minHeight: "calc(100vh - 60px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: "var(--color-background)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.4px", color: "var(--color-foreground)" }}>
              FIN<span style={{ color: "#1B4DFF" }}>-BRIDGE</span>
            </span>
          </div>
          <h1 style={{ fontWeight: 800, fontSize: 26, margin: "0 0 8px", letterSpacing: "-0.5px", color: "var(--color-foreground)" }}>
            로그인
          </h1>
          <p style={{ fontSize: 15, color: "var(--color-muted-foreground)", margin: 0 }}>
            내 맞춤 혜택을 관리하고 찜 목록을 저장하세요
          </p>
        </div>

        {/* Form */}
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--color-border)",
            borderRadius: 16,
            padding: "32px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          {error && (
            <div
              style={{
                padding: "11px 14px",
                borderRadius: 9,
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                marginBottom: 20,
                fontSize: 13,
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="7" cy="7" r="6" stroke="#DC2626" strokeWidth="1.5" />
                <path d="M7 4.5V7.5M7 9.5V10" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Field label="이메일">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="example@email.com"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />
            </Field>

            <Field label="비밀번호">
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="비밀번호를 입력하세요"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />
            </Field>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", margin: "10px 0 20px" }}>
            <button
              style={{
                background: "none",
                border: "none",
                fontSize: 12,
                color: "var(--color-muted-foreground)",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                padding: 0,
              }}
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>

          <button
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 10,
              border: "none",
              background: "var(--color-primary)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              letterSpacing: "-0.1px",
            }}
          >
            로그인
          </button>

        </div>

        <p style={{ textAlign: "center", fontSize: 14, color: "var(--color-muted-foreground)", marginTop: 24 }}>
          아직 계정이 없으신가요?{" "}
          <button
            onClick={() => setScreen("signup")}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-primary)",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              padding: 0,
            }}
          >
            회원가입
          </button>
        </p>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 9,
  border: "1.5px solid var(--color-border)",
  fontSize: 14,
  fontFamily: "var(--font-sans)",
  outline: "none",
  color: "var(--color-foreground)",
  background: "#fff",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 7,
          color: "var(--color-foreground)",
          letterSpacing: "-0.1px",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
