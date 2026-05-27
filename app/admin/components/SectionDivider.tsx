import { YELLOW, BORDER } from "../layout";

export function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "28px 0 20px" }}>
      <div style={{ fontSize: 9, color: YELLOW, letterSpacing: 3, whiteSpace: "nowrap" }}>{label}</div>
      <div style={{ flex: 1, height: 1, background: BORDER }} />
    </div>
  );
}
