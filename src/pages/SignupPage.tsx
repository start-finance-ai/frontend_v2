import { useState } from "react";
import type { Screen, CategoryType } from "../App";

interface SignupPageProps {
  setScreen: (s: Screen) => void;
}

const USER_TYPES: { type: CategoryType; desc: string }[] = [
  { type: "예비창업자", desc: "창업을 준비 중이에요" },
  { type: "소상공인", desc: "현재 사업체를 운영 중이에요" },
  { type: "프리랜서", desc: "프리랜서·1인 사업자예요" },
];

const REGIONS = ["서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];

const STEP_LABELS = ["기본 정보", "유형 선택", "약관 동의"];

export default function SignupPage({ setScreen }: SignupPageProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
    userType: "" as CategoryType | "",
    region: "",
    agreeAll: false,
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.email.includes("@")) e.email = "올바른 이메일 형식을 입력하세요";
    if (form.password.length < 8) e.password = "비밀번호는 8자 이상이어야 합니다";
    if (form.password !== form.passwordConfirm) e.passwordConfirm = "비밀번호가 일치하지 않습니다";
    if (!form.name.trim()) e.name = "이름을 입력해주세요";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.userType) e.userType = "유형을 선택해주세요";
    if (!form.region) e.region = "지역을 선택해주세요";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (!form.agreeTerms || !form.agreePrivacy) e.agree = "필수 약관에 동의해주세요";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) setScreen("mypage");
  };

  const toggleAll = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      agreeAll: checked,
      agreeTerms: checked,
      agreePrivacy: checked,
      agreeMarketing: checked,
    }));
  };

  return (
    <main
      style={{
        minHeight: "calc(100vh - 60px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "48px 24px 80px",
        background: "var(--color-background)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 460 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.4px", color: "var(--color-foreground)" }}>
              FIN<span style={{ color: "#1B4DFF" }}>-BRIDGE</span>
            </span>
          </div>
          <h1 style={{ fontWeight: 800, fontSize: 26, margin: "0 0 8px", letterSpacing: "-0.5px" }}>
            회원가입
          </h1>
          <p style={{ fontSize: 15, color: "var(--color-muted-foreground)", margin: 0 }}>
            내 상황에 맞는 혜택을 추천받아보세요
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 28, gap: 0 }}>
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const active = step === n;
            const done = step > n;
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", flex: n < 3 ? 1 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      background: done || active ? "var(--color-primary)" : "var(--color-muted)",
                      color: done || active ? "#fff" : "var(--color-muted-foreground)",
                      transition: "all 0.2s",
                      flexShrink: 0,
                    }}
                  >
                    {done ? (
                      <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                        <path d="M1 5L5 9L12 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : n}
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: active ? 700 : 400,
                      color: active ? "var(--color-primary)" : "var(--color-muted-foreground)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </span>
                </div>
                {n < 3 && (
                  <div
                    style={{
                      flex: 1,
                      height: 1.5,
                      background: done ? "var(--color-primary)" : "var(--color-border)",
                      margin: "0 6px",
                      marginBottom: 16,
                      transition: "background 0.2s",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form card */}
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--color-border)",
            borderRadius: 16,
            padding: "32px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          {/* Step 1 */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <p style={{ fontWeight: 700, fontSize: 16, margin: 0, letterSpacing: "-0.2px" }}>기본 정보를 입력해주세요</p>

              <Field label="이름" error={errors.name}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => { set("name", e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                  placeholder="홍길동"
                  style={inputStyle(!!errors.name)}
                  onFocus={(e) => !errors.name && (e.target.style.borderColor = "var(--color-primary)")}
                  onBlur={(e) => !errors.name && (e.target.style.borderColor = "var(--color-border)")}
                />
              </Field>

              <Field label="이메일" error={errors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => { set("email", e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                  placeholder="example@email.com"
                  style={inputStyle(!!errors.email)}
                  onFocus={(e) => !errors.email && (e.target.style.borderColor = "var(--color-primary)")}
                  onBlur={(e) => !errors.email && (e.target.style.borderColor = "var(--color-border)")}
                />
              </Field>

              <Field label="비밀번호" error={errors.password}>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => { set("password", e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                  placeholder="8자 이상 입력"
                  style={inputStyle(!!errors.password)}
                  onFocus={(e) => !errors.password && (e.target.style.borderColor = "var(--color-primary)")}
                  onBlur={(e) => !errors.password && (e.target.style.borderColor = "var(--color-border)")}
                />
              </Field>

              <Field label="비밀번호 확인" error={errors.passwordConfirm}>
                <input
                  type="password"
                  value={form.passwordConfirm}
                  onChange={(e) => { set("passwordConfirm", e.target.value); setErrors((p) => ({ ...p, passwordConfirm: "" })); }}
                  onKeyDown={(e) => e.key === "Enter" && handleNext()}
                  placeholder="비밀번호를 다시 입력하세요"
                  style={inputStyle(!!errors.passwordConfirm)}
                  onFocus={(e) => !errors.passwordConfirm && (e.target.style.borderColor = "var(--color-primary)")}
                  onBlur={(e) => !errors.passwordConfirm && (e.target.style.borderColor = "var(--color-border)")}
                />
              </Field>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16, margin: "0 0 4px", letterSpacing: "-0.2px" }}>나는 어떤 유형인가요?</p>
                <p style={{ fontSize: 13, color: "var(--color-muted-foreground)", margin: 0 }}>
                  선택한 유형에 따라 맞춤 혜택을 추천해드려요
                </p>
              </div>

              {errors.userType && <ErrorNote msg={errors.userType} />}

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {USER_TYPES.map(({ type, desc }) => {
                  const selected = form.userType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => { set("userType", type); setErrors((p) => ({ ...p, userType: "" })); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "16px 18px",
                        borderRadius: 12,
                        border: `2px solid ${selected ? "var(--color-primary)" : "var(--color-border)"}`,
                        background: selected ? "var(--color-secondary)" : "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "var(--font-sans)",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: selected ? "var(--color-primary)" : "var(--color-foreground)", letterSpacing: "-0.1px" }}>
                          {type}
                        </p>
                        <p style={{ fontSize: 12, color: "var(--color-muted-foreground)", margin: "3px 0 0" }}>{desc}</p>
                      </div>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          border: `2px solid ${selected ? "var(--color-primary)" : "var(--color-border)"}`,
                          background: selected ? "var(--color-primary)" : "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.15s",
                        }}
                      >
                        {selected && (
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <Field label="활동 지역" error={errors.region}>
                <select
                  value={form.region}
                  onChange={(e) => { set("region", e.target.value); setErrors((p) => ({ ...p, region: "" })); }}
                  style={{
                    ...inputStyle(!!errors.region),
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%237A849A' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 14px center",
                    paddingRight: 36,
                    cursor: "pointer",
                  }}
                >
                  <option value="">지역을 선택하세요</option>
                  {REGIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </Field>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ fontWeight: 700, fontSize: 16, margin: 0, letterSpacing: "-0.2px" }}>약관에 동의해주세요</p>

              {errors.agree && <ErrorNote msg={errors.agree} />}

              {/* 전체 동의 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: `1.5px solid ${form.agreeAll ? "var(--color-primary)" : "var(--color-border)"}`,
                  background: form.agreeAll ? "var(--color-secondary)" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onClick={() => toggleAll(!form.agreeAll)}
              >
                <CheckBox checked={form.agreeAll} />
                <span style={{ fontWeight: 700, fontSize: 14, color: form.agreeAll ? "var(--color-primary)" : "var(--color-foreground)" }}>
                  전체 동의
                </span>
              </div>

              {/* 개별 항목 */}
              <div
                style={{
                  borderRadius: 10,
                  border: "1px solid var(--color-border)",
                  overflow: "hidden",
                }}
              >
                {[
                  { key: "agreeTerms", label: "이용약관 동의", required: true },
                  { key: "agreePrivacy", label: "개인정보 처리방침 동의", required: true },
                  { key: "agreeMarketing", label: "마케팅 정보 수신 동의", required: false },
                ].map(({ key, label, required }, i) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "13px 16px",
                      cursor: "pointer",
                      borderTop: i > 0 ? "1px solid var(--color-border)" : "none",
                      background: "#fff",
                    }}
                    onClick={() => {
                      const newVal = !form[key as keyof typeof form];
                      set(key, newVal as boolean);
                      setErrors((p) => ({ ...p, agree: "" }));
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <CheckBox checked={!!form[key as keyof typeof form]} />
                      <span style={{ fontSize: 13, color: "var(--color-foreground)" }}>
                        {required && (
                          <span style={{ color: "var(--color-primary)", fontWeight: 700, marginRight: 3 }}>[필수]</span>
                        )}
                        {!required && (
                          <span style={{ color: "var(--color-muted-foreground)", marginRight: 3 }}>[선택]</span>
                        )}
                        {label}
                      </span>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--color-muted-foreground)", flexShrink: 0 }}>
                      <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  background: "#F8FAFF",
                  border: "1px solid #DBEAFE",
                }}
              >
                <p style={{ fontSize: 12, color: "#374151", margin: 0, lineHeight: 1.6 }}>
                  입력하신 개인정보는 맞춤 혜택 추천에만 활용되며, 제3자에게 제공되지 않습니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Nav buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                flex: 1,
                padding: "13px",
                borderRadius: 10,
                border: "1.5px solid var(--color-border)",
                background: "#fff",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                color: "var(--color-foreground)",
                letterSpacing: "-0.1px",
              }}
            >
              이전
            </button>
          )}
          <button
            onClick={handleNext}
            style={{
              flex: 2,
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
            {step === 3 ? "가입 완료" : "다음"}
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 14, color: "var(--color-muted-foreground)", marginTop: 20 }}>
          이미 계정이 있으신가요?{" "}
          <button
            onClick={() => setScreen("login")}
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
            로그인
          </button>
        </p>
      </div>
    </main>
  );
}

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "11px 14px",
  borderRadius: 9,
  border: `1.5px solid ${hasError ? "#FCA5A5" : "var(--color-border)"}`,
  fontSize: 14,
  fontFamily: "var(--font-sans)",
  outline: "none",
  color: "var(--color-foreground)",
  background: "#fff",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
});

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
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
      {error && (
        <p style={{ fontSize: 11, color: "#DC2626", margin: "5px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
          {error}
        </p>
      )}
    </div>
  );
}

function ErrorNote({ msg }: { msg: string }) {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 9,
        background: "#FEF2F2",
        border: "1px solid #FECACA",
        fontSize: 13,
        color: "#DC2626",
      }}
    >
      {msg}
    </div>
  );
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: 5,
        border: `2px solid ${checked ? "var(--color-primary)" : "var(--color-border)"}`,
        background: checked ? "var(--color-primary)" : "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "all 0.15s",
      }}
    >
      {checked && (
        <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
          <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}
