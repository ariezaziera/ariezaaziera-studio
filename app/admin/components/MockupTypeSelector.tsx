import { YELLOW, BORDER } from "../layout";

export function MockupTypeSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const options: { value: string; label: string; desc: string }[] = [
    { value: "desktop", label: "DESKTOP", desc: "Browser frame" },
    { value: "mobile", label: "MOBILE", desc: "Phone frames (up to 3)" },
    { value: "both", label: "BOTH", desc: "Browser + phone side by side" },
  ];

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 10 }}>MOCKUP TYPE</div>
      <div style={{ display: "flex", gap: 8 }}>
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              padding: "10px 8px",
              borderRadius: 6,
              border: `1px solid ${value === opt.value ? YELLOW : BORDER}`,
              background: value === opt.value ? YELLOW + "12" : "transparent",
              cursor: "pointer",
              textAlign: "center" as const,
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1,
                color: value === opt.value ? YELLOW : "#666",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {opt.label}
            </div>
            <div style={{ fontSize: 9, color: "#444", marginTop: 3, fontFamily: "'DM Mono', monospace" }}>
              {opt.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
