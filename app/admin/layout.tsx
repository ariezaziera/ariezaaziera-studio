"use client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#080808",
      color: "#fff",
      fontFamily: "'DM Mono', monospace",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Space+Grotesk:wght@400;500;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
      {children}
    </div>
  );
}

export const YELLOW = "#F5C542";
export const BORDER = "#1a1a1a";
export const CARD = "#0f0f0f";
export const GREEN = "#4ADE80";
export const RED = "#f87171";

export const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0a0a0a",
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  padding: "10px 14px",
  color: "#fff",
  fontFamily: "'DM Mono', monospace",
  fontSize: 12,
  outline: "none",
};

export const btnStyle: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 11,
  letterSpacing: 1,
  padding: "9px 18px",
  borderRadius: 4,
  border: `1px solid ${BORDER}`,
  background: "transparent",
  color: "#888",
  cursor: "pointer",
  whiteSpace: "nowrap" as const,
};
