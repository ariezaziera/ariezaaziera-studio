"use client";

import { useEffect, useRef, useState } from "react";
import { YELLOW, BORDER } from "@/constants";
import { useProfile, useProjects } from "@/lib/hooks";

// ─── NEW: Animated dot-grid background ───────────────────────────────────────
function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const spacing = 28;
      const cols = Math.ceil(canvas.width / spacing) + 1;
      const rows = Math.ceil(canvas.height / spacing) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacing;
          const y = r * spacing;
          const wave = Math.sin(t * 0.6 + c * 0.4 + r * 0.3) * 0.5 + 0.5;
          const alpha = 0.04 + wave * 0.07;
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245,197,24,${alpha})`;
          ctx.fill();
        }
      }
      t += 0.016;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0,
      }}
    />
  );
}

// ─── NEW: Mouse-following radial spotlight ────────────────────────────────────
function Spotlight({ containerRef }: { containerRef: React.RefObject<HTMLElement | null> }) {
  const [pos, setPos] = useState({ x: -999, y: -999 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [containerRef]);

  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
      background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, rgba(245,197,24,0.055), transparent 55%)`,
      transition: "background 0.08s",
    }} />
  );
}

// ─── NEW: Typewriter animated code block ─────────────────────────────────────
const CODE_LINES = [
  { text: "const me = {",         color: "#f0f0f0" },
  { text: `  role: "Full-Stack",`, color: "#60A5FA" },
  { text: `  focus: "Product",`,   color: "#60A5FA" },
  { text: `  ships: true,`,        color: "#4ADE80" },
  { text: `  coffee: Infinity,`,   color: "#4ADE80" },
  { text: "};",                    color: "#f0f0f0" },
  { text: "",                      color: "" },
  { text: "me.build(ideas)",       color: YELLOW },
  { text: "  .deploy()",           color: YELLOW },
  { text: "  .iterate();",         color: YELLOW },
];

function CodeBlock({ visible }: { visible: boolean }) {
  const [lines, setLines] = useState<number>(0);

  useEffect(() => {
    if (!visible) return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setLines(i);
      if (i >= CODE_LINES.length) clearInterval(iv);
    }, 110);
    return () => clearInterval(iv);
  }, [visible]);

  return (
    <div style={{
      marginTop: 24,
      padding: "18px 20px",
      background: "#070707",
      border: "1px solid #1a1a1a",
      borderRadius: 10,
      fontFamily: "'DM Mono', monospace",
      fontSize: 11,
      lineHeight: 1.85,
      position: "relative",
      overflow: "hidden",
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : "translateY(10px)",
      transition: "opacity 0.5s 0.8s, transform 0.5s 0.8s",
    }}>
      {/* window chrome dots */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["#FF5F57","#FEBC2E","#28C840"].map((c) => (
          <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.7 }} />
        ))}
      </div>
      {CODE_LINES.slice(0, lines).map((l, i) => (
        <div key={i} style={{ color: l.color || "#333", whiteSpace: "pre" }}>
          {l.text}
          {i === lines - 1 && lines < CODE_LINES.length && (
            <span style={{
              display: "inline-block", width: 7, height: 12,
              background: YELLOW, marginLeft: 2,
              animation: "blink 0.8s step-end infinite",
              verticalAlign: "middle",
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── NEW: "Currently building" live badge ────────────────────────────────────
const MARQUEE_ITEMS = [
  "Building in public", "Open to freelance", "Next.js 15",
  "AI-powered tools", "Side projects", "Always shipping",
];

function LiveBadge({ visible }: { visible: boolean }) {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (!visible) return;
    const iv = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx((p) => (p + 1) % MARQUEE_ITEMS.length);
        setFade(true);
      }, 300);
    }, 2200);
    return () => clearInterval(iv);
  }, [visible]);

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      padding: "7px 14px",
      border: `1px solid #1e1e1e`,
      borderRadius: 999,
      background: "#0a0a0a",
      marginBottom: 28,
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : "translateY(10px)",
      transition: "opacity 0.5s 0.05s, transform 0.5s 0.05s",
    }}>
      {/* pulsing green dot */}
      <span style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "#4ADE80", display: "block",
          boxShadow: "0 0 6px #4ADE80aa",
          animation: "livePulse 1.6s ease-in-out infinite",
        }} />
        <span style={{
          position: "absolute", width: 7, height: 7, borderRadius: "50%",
          background: "#4ADE8066",
          animation: "liveRing 1.6s ease-out infinite",
        }} />
      </span>
      <span style={{
        fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#d4d4d4",
        letterSpacing: 1,
      }}>
        NOW —
      </span>
      <span style={{
        fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#c0c0c0",
        opacity: fade ? 1 : 0,
        transition: "opacity 0.3s",
        minWidth: 130,
      }}>
        {MARQUEE_ITEMS[idx]}
      </span>
    </div>
  );
}

// ─── NEW: Horizontal timeline ticker ─────────────────────────────────────────
const TIMELINE = [
  { year: "2021", event: "First SaaS shipped" },
  { year: "2022", event: "OrderCalc — 60% ops saved" },
  { year: "2022", event: "OptimaBank redesign" },
  { year: "2023", event: "Joined agency as lead dev" },
  { year: "2024", event: "12 products in production" },
  { year: "2025", event: "Going independent" },
  { year: "2021", event: "First SaaS shipped" },
  { year: "2022", event: "OrderCalc — 60% ops saved" },
  { year: "2022", event: "OptimaBank redesign" },
  { year: "2023", event: "Joined agency as lead dev" },
  { year: "2024", event: "12 products in production" },
  { year: "2025", event: "Going independent" },
];

function TimelineTicker({ visible }: { visible: boolean }) {
  return (
    <div style={{
      marginTop: 48,
      position: "relative",
      overflow: "hidden",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.8s 0.9s",
    }}>
      {/* fade edges */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 80,
        background: "linear-gradient(90deg, #080808, transparent)",
        zIndex: 2, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: 80,
        background: "linear-gradient(-90deg, #080808, transparent)",
        zIndex: 2, pointerEvents: "none",
      }} />

      <div style={{
        display: "flex", gap: 0,
        animation: "tickerScroll 28s linear infinite",
        width: "max-content",
      }}>
        {TIMELINE.map((item, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "10px 28px",
            borderRight: "1px solid #141414",
            whiteSpace: "nowrap",
          }}>
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 9,
              color: YELLOW, letterSpacing: 1, opacity: 0.7,
            }}>
              {item.year}
            </span>
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10,
              color: "#3a3a3a",
            }}>
              {item.event}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── NEW: Floating number decoration ─────────────────────────────────────────
function FloatingNumbers({ visible }: { visible: boolean }) {
  const nums = ["01", "02", "03", "04", "05"];
  return (
    <div style={{
      position: "absolute", right: -12, top: "50%",
      transform: "translateY(-50%)",
      display: "flex", flexDirection: "column", gap: 18,
      pointerEvents: "none",
      opacity: visible ? 0.18 : 0,
      transition: "opacity 1s 1s",
    }}>
      {nums.map((n, i) => (
        <div key={n} style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 9, color: YELLOW,
          letterSpacing: 2,
          animation: visible ? `floatNum 3s ${i * 0.4}s ease-in-out infinite alternate` : "none",
        }}>
          {n}
        </div>
      ))}
    </div>
  );
}

export default function AboutSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const profile = useProfile();
  const projects = useProjects();

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const skills = profile.skills;
  const blurbs = profile.about;

  const stats = [
    { num: "3+", label: "Years building" },
    { num: `${projects.length}+`, label: "Products shipped" },
    { num: "60%", label: "Ops time saved (OrderCalc)" },
    { num: "40%", label: "Drop-off reduced (OptimaBank)" },
  ];

  return (
    <section id="about" ref={ref} style={{ padding: "clamp(40px, 8vw, 80px) clamp(20px, 6vw, 40px)", maxWidth: 900, margin: "0 auto", position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes skillSlide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes statCount {
          from { opacity: 0; transform: translateY(16px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes barFill {
          from { width: 0%; }
          to { width: var(--bar-w); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0 transparent; }
          50% { box-shadow: 0 0 16px 2px var(--glow-c); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes livePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.25); }
        }
        @keyframes liveRing {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes floatNum {
          from { transform: translateY(0px); }
          to { transform: translateY(-8px); }
        }
        @media (max-width: 640px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>

      {/* NEW: animated dot grid background */}
      <DotGrid />

      {/* NEW: mouse spotlight */}
      <Spotlight containerRef={ref} />

      {/* Section label */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48, position: "relative", zIndex: 2 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: YELLOW, letterSpacing: 3, whiteSpace: "nowrap" }}>02 — ABOUT</div>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
      </div>

      {/* NEW: live badge */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <LiveBadge visible={visible} />
      </div>

      <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 48, position: "relative", zIndex: 2 }}>

        {/* LEFT — text */}
        <div>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800,
            fontSize: "clamp(26px, 5vw, 38px)", letterSpacing: -1,
            margin: "0 0 24px",
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(20px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}>
            Building things that <span style={{ color: YELLOW }}>actually work.</span>
          </h2>

          {blurbs.map((text: string, i: number) => (
            <p key={i} style={{
              fontFamily: "'DM Mono', monospace", fontSize: 12,
              color: "#d4d4d4", lineHeight: 1.9, margin: "0 0 16px",
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(16px)",
              transition: `opacity 0.6s ${0.1 + i * 0.1}s ease, transform 0.6s ${0.1 + i * 0.1}s ease`,
            }}>
              {text}
            </p>
          ))}

          {/* Animated skill chips */}
          <div style={{ marginTop: 32 }}>
            <div style={{
              fontFamily: "'DM Mono', monospace", fontSize: 9,
              color: "#c0c0c0", letterSpacing: 2, marginBottom: 14,
              opacity: visible ? 1 : 0, transition: "opacity 0.5s 0.3s",
            }}>
              STACK
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {skills.map((s: string, i: number) => (
                <div
                  key={s}
                  style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 10,
                    color: "#aaa",
                    padding: "6px 12px",
                    border: `1px solid #222`,
                    borderRadius: 4,
                    background: "#0d0d0d",
                    cursor: "default",
                    animation: visible ? `skillSlide 0.5s ${0.35 + i * 0.04}s both` : "none",
                    transition: "color 0.2s, border-color 0.2s, background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.color = YELLOW;
                    (e.currentTarget as HTMLDivElement).style.borderColor = YELLOW + "55";
                    (e.currentTarget as HTMLDivElement).style.background = YELLOW + "0d";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.color = "#aaa";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "#222";
                    (e.currentTarget as HTMLDivElement).style.background = "#0d0d0d";
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* NEW: animated code block */}
          <CodeBlock visible={visible} />
        </div>

        {/* RIGHT — stats */}
        <div style={{ position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
            {stats.map((s, i) => (
              <StatCard key={i} stat={s} index={i} visible={visible} />
            ))}
          </div>

          {/* Animated progress bars */}
          <SkillBars visible={visible} />

          {/* NEW: floating decorative numbers */}
          <FloatingNumbers visible={visible} />
        </div>
      </div>

      {/* NEW: timeline ticker */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <TimelineTicker visible={visible} />
      </div>
    </section>
  );
}

function StatCard({ stat, index, visible }: { stat: { num: string; label: string }; index: number; visible: boolean }) {
  const [hovered, setHovered] = useState(false);
  const color = [YELLOW, "#60A5FA", YELLOW, "#4ADE80"][index] || YELLOW;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "20px 18px",
        background: "#0a0a0a",
        border: `1px solid ${hovered ? color + "40" : "#181818"}`,
        borderRadius: 12,
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        animation: visible ? `statCount 0.6s ${0.2 + index * 0.1}s both` : "none",
        transition: "border-color 0.3s",
      }}
    >
      {/* glow on hover */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(circle at 50% 100%, ${color}15, transparent 70%)`,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.4s",
      }} />
      {/* top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: color,
        transform: `scaleX(${hovered ? 1 : 0})`,
        transformOrigin: "left",
        transition: "transform 0.4s ease",
      }} />

      <div style={{
        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800,
        fontSize: "clamp(24px, 4vw, 32px)", color,
        letterSpacing: -1, lineHeight: 1, marginBottom: 6,
      }}>
        {stat.num}
      </div>
      <div style={{
        fontFamily: "'DM Mono', monospace", fontSize: 9,
        color: "#d4d4d4", letterSpacing: 1, lineHeight: 1.5,
      }}>
        {stat.label}
      </div>
    </div>
  );
}

function SkillBars({ visible }: { visible: boolean }) {
  const bars = [
    { label: "Frontend Dev", pct: 92 },
    { label: "Product Design", pct: 80 },
    { label: "Backend / API", pct: 65 },
    { label: "UI Animation", pct: 75 },
  ];

  return (
    <div style={{
      padding: "20px",
      background: "#0a0a0a",
      border: "1px solid #181818",
      borderRadius: 12,
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : "translateY(16px)",
      transition: "opacity 0.7s 0.5s, transform 0.7s 0.5s",
    }}>
      <div style={{
        fontFamily: "'DM Mono', monospace", fontSize: 9,
        color: "#d4d4d4", letterSpacing: 2, marginBottom: 16,
      }}>
        PROFICIENCY
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {bars.map((b, i) => (
          <div key={b.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#c0c0c0" }}>{b.label}</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#d4d4d4" }}>{b.pct}%</span>
            </div>
            <div style={{ height: 3, background: "#151515", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: visible ? `${b.pct}%` : "0%",
                background: `linear-gradient(90deg, ${YELLOW}aa, ${YELLOW})`,
                borderRadius: 2,
                transition: `width 1s ${0.6 + i * 0.12}s cubic-bezier(0.22, 1, 0.36, 1)`,
                boxShadow: `0 0 8px ${YELLOW}66`,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}