"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { CARD_BG, BORDER } from "@/constants";
import type { Project } from "@/types";
import type { SplitScreenshots } from "@/types/split-screenshots";

interface CaseStudyPageProps {
  project: Project;
  setActivePage: (page: string) => void;
}

function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el); return () => obs.unobserve(el);
  }, [threshold]);
  return { ref, visible };
}

function normScreenshots(raw: SplitScreenshots | string[] | undefined): SplitScreenshots {
  if (!raw) return { mobile: [], desktop: [] };
  if (Array.isArray(raw)) return { mobile: raw, desktop: [] };
  return { mobile: raw.mobile ?? [], desktop: raw.desktop ?? [] };
}

/* --- Animated dot-grid background canvas --- */
function NoiseBackground({ color }: { color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let frame = 0; let raf: number;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      for (let x = 0; x < W; x += 42) {
        for (let y = 0; y < H; y += 42) {
          const ox = Math.sin((x + frame) * 0.022) * 7;
          const oy = Math.cos((y + frame) * 0.019) * 7;
          const dist = Math.sqrt((x - W / 2) ** 2 + (y - H / 2) ** 2);
          const alpha = Math.max(0, 0.055 - dist / (W * 4.5));
          ctx.beginPath(); ctx.arc(x + ox, y + oy, 1.3, 0, Math.PI * 2);
          ctx.fillStyle = color; ctx.globalAlpha = alpha; ctx.fill();
        }
      }
      ctx.globalAlpha = 1; frame++; raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [color]);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />;
}

/* --- Cursor trail --- */
function CursorTrail({ color }: { color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pts = useRef<{ x: number; y: number; age: number }[]>([]);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const onMove = (e: MouseEvent) => { pts.current.push({ x: e.clientX, y: e.clientY, age: 0 }); if (pts.current.length > 30) pts.current.shift(); };
    window.addEventListener("mousemove", onMove);
    let raf: number;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.current.forEach((p, i) => {
        p.age++;
        const t = i / pts.current.length;
        const alpha = t * 0.5 * Math.max(0, 1 - p.age / 45);
        ctx.beginPath(); ctx.arc(p.x, p.y, t * 5.5, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.globalAlpha = alpha; ctx.fill();
      });
      ctx.globalAlpha = 1; raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", onMove); window.removeEventListener("resize", resize); };
  }, [color]);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }} />;
}

/* --- Sparkle burst on hero load --- */
function SparkleCanvas({ color }: { color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    const W = canvas.width, H = canvas.height;
    const cols = [color, "#fff", color + "bb", "#ffffffaa", color + "77"];
    const particles = Array.from({ length: 90 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 90 + Math.random() * 0.3;
      const speed = 1.8 + Math.random() * 5.5;
      return { x: W * 0.5, y: H * 0.36, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 3.5, r: 1 + Math.random() * 3.8, alpha: 1, color: cols[Math.floor(Math.random() * cols.length)] };
    });
    let frame = 0;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.alpha -= 0.011;
        if (p.alpha <= 0) return;
        ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (++frame < 140) requestAnimationFrame(tick);
    };
    const t = setTimeout(tick, 550);
    return () => clearTimeout(t);
  }, [color]);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 3 }} />;
}

/* --- Text scramble reveal --- */
function ScrambleText({ text, trigger }: { text: string; trigger: boolean }) {
  const [display, setDisplay] = useState(text);
  const chars = "!<>-_\\/[]{}—=+*^?#01▓▒░";
  useEffect(() => {
    if (!trigger) return;
    let frame = 0; const total = 30;
    const id = setInterval(() => {
      setDisplay(text.split("").map((ch, i) => {
        if (ch === " ") return " ";
        if (frame / total > i / text.length + 0.2) return ch;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(""));
      if (++frame >= total) { setDisplay(text); clearInterval(id); }
    }, 38);
    return () => clearInterval(id);
  }, [trigger]);
  return <>{display}</>;
}

/* --- Letter-by-letter animated title --- */
function SplitTitle({ text, color, visible }: { text: string; color: string; visible: boolean }) {
  const letters = text.split("");
  return (
    <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(38px,9vw,86px)", lineHeight: 1.0, margin: "0 0 20px", letterSpacing: -3, display: "flex", flexWrap: "wrap" }}>
      {letters.map((ch, i) => (
        <span key={i} style={{ display: "inline-block", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(55px) rotate(8deg)", transition: `opacity 0.5s ${0.035 * i + 0.1}s cubic-bezier(0.22,1,0.36,1), transform 0.65s ${0.035 * i + 0.1}s cubic-bezier(0.34,1.56,0.64,1)`, whiteSpace: ch === " " ? "pre" : "normal" }}>
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
      <span style={{ display: "inline-block", color, opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(55px)", transition: `all 0.65s ${0.035 * letters.length + 0.1}s cubic-bezier(0.34,1.56,0.64,1)` }}>.</span>
    </h1>
  );
}

/* --- Kinetic floating tech tags --- */
function KineticTags({ tags, color }: { tags: string[]; color: string }) {
  const [hov, setHov] = useState<number | null>(null);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "22px 0 0" }}>
      {tags.map((tag, i) => {
        const active = hov === i;
        return (
          <span key={tag} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
            style={{ fontFamily: "'DM Mono', monospace", fontSize: i % 3 === 0 ? 13 : 11, padding: active ? "7px 18px" : "5px 13px", borderRadius: 999, border: `1px solid ${active ? color : color + "3a"}`, color: active ? "#000" : color, background: active ? color : color + "0e", cursor: "default", transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)", transform: active ? "translateY(-5px) scale(1.12)" : "translateY(0) scale(1)", boxShadow: active ? `0 10px 28px ${color}55` : "none", letterSpacing: 1, animation: `tagWave ${2.4 + i * 0.22}s ${i * 0.07}s ease-in-out infinite`, userSelect: "none" }}>
            {tag}
          </span>
        );
      })}
    </div>
  );
}

/* --- Horizontal interactive timeline --- */
function HorizontalTimeline({ steps, color }: { steps: { label: string; desc: string }[]; color: string }) {
  const { ref, visible } = useReveal(0.1);
  const [active, setActive] = useState<number | null>(null);
  return (
    <div ref={ref} style={{ marginBottom: 64, opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(40px)", transition: "all 0.8s cubic-bezier(0.22,1,0.36,1)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", position: "relative" }}>
        <div style={{ position: "absolute", top: 20, left: 20, right: 20, height: 2, background: BORDER, zIndex: 0 }}>
          <div style={{ height: "100%", background: color, width: visible ? "100%" : "0%", transition: "width 1.5s 0.4s cubic-bezier(0.22,1,0.36,1)", boxShadow: `0 0 12px ${color}aa` }} />
        </div>
        {steps.map((s, i) => {
          const isAct = active === i;
          return (
            <div key={s.label} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1, cursor: "default", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: `all 0.6s ${0.18 + i * 0.1}s cubic-bezier(0.34,1.56,0.64,1)` }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: isAct ? color : CARD_BG, border: `2px solid ${isAct ? color : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 700, color: isAct ? "#000" : color, transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)", transform: isAct ? "scale(1.28)" : "scale(1)", boxShadow: isAct ? `0 0 24px ${color}99, 0 0 48px ${color}44` : "none" }}>
                0{i + 1}
              </div>
              <div style={{ marginTop: 10, fontFamily: "'DM Mono', monospace", fontSize: 9, color: isAct ? color : "#c8c8c8", letterSpacing: 2, textAlign: "center", transition: "color 0.2s" }}>{s.label.toUpperCase()}</div>
              <div style={{ marginTop: 4, fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#c0c0c0", textAlign: "center", maxWidth: 90, lineHeight: 1.5, maxHeight: isAct ? 50 : 0, overflow: "hidden", opacity: isAct ? 1 : 0, transition: "all 0.3s ease" }}>{s.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --- Neon case section card --- */
const SECTION_META = [
  { icon: "🌐", accent: "THE CONTEXT" },
  { icon: "⚡", accent: "THE PROBLEM" },
  { icon: "🔧", accent: "THE SOLUTION" },
  { icon: "🚀", accent: "THE OUTCOME" },
];

function CaseSection({ label, content, color, index }: { label: string; content: string; color: string; index: number }) {
  const { ref, visible } = useReveal(0.08);
  const [hov, setHov] = useState(false);
  const meta = SECTION_META[index] ?? { icon: "●", accent: "" };

  return (
    <div ref={ref} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ marginBottom: 24, opacity: visible ? 1 : 0, transform: visible ? "none" : `translateX(${index % 2 === 0 ? -60 : 60}px) skewX(${index % 2 === 0 ? -1.5 : 1.5}deg)`, transition: `all 0.8s ${index * 0.14}s cubic-bezier(0.22,1,0.36,1)`, position: "relative" }}>
      <div style={{ position: "absolute", top: -22, right: 8, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, fontSize: "clamp(80px,14vw,130px)", lineHeight: 1, color: color, opacity: hov ? 0.08 : 0.03, userSelect: "none", pointerEvents: "none", transition: "opacity 0.4s" }}>0{index + 1}</div>
      <div style={{ position: "relative", overflow: "hidden", background: hov ? color + "07" : CARD_BG, border: `1px solid ${hov ? color + "50" : BORDER}`, borderRadius: 12, padding: "28px 32px", transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)", boxShadow: hov ? `0 0 0 1px ${color}1a, 0 20px 56px ${color}12, inset 0 1px 0 ${color}18` : "none" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: color, opacity: hov ? 1 : 0, boxShadow: hov ? `0 0 14px ${color}, 0 0 28px ${color}88` : "none", transition: "opacity 0.3s, box-shadow 0.3s" }} />
        {hov && <div style={{ position: "absolute", top: 0, left: "-100%", bottom: 0, width: "50%", background: `linear-gradient(90deg, transparent, ${color}08, transparent)`, animation: "shimmerSweep 0.85s ease-out forwards", pointerEvents: "none" }} />}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <div style={{ width: 46, height: 46, borderRadius: 11, background: color + "16", border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)", transform: hov ? "scale(1.14) rotate(7deg)" : "scale(1) rotate(0deg)", boxShadow: hov ? `0 0 22px ${color}55` : "none", animation: visible ? `iconPop 0.5s ${0.3 + index * 0.1}s cubic-bezier(0.34,1.56,0.64,1) both` : "none" }}>{meta.icon}</div>
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#c0c0c0", letterSpacing: 3, marginBottom: 3 }}>{meta.accent}</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(15px,2.2vw,19px)", color: "#fff", letterSpacing: -0.5 }}>{label}</div>
          </div>
          <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}`, animation: "blinkDot 1.8s ease-in-out infinite" }} />
        </div>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(13px,2.2vw,15px)", color: "#999", lineHeight: 2.0, margin: 0 }}>{content}</p>
      </div>
    </div>
  );
}

/* --- Marquee --- */
function MarqueeStrip({ items, color }: { items: string[]; color: string }) {
  const d = [...items, ...items, ...items];
  return (
    <div style={{ overflow: "hidden", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: "11px 0", margin: "56px 0" }}>
      <div style={{ display: "flex", animation: "marqueeScroll 20s linear infinite", width: "max-content" }}>
        {d.map((item, i) => (
          <span key={i} style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: i % 2 === 0 ? color : "#c0c0c0", letterSpacing: 3, padding: "0 18px", whiteSpace: "nowrap" }}>
            {item.toUpperCase()} <span style={{ color, opacity: 0.55 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* --- Arrow nav --- */
function ArrowNav({ index, total, color, onPrev, onNext }: { index: number; total: number; color: string; onPrev: () => void; onNext: () => void }) {
  if (total <= 1) return null;
  const Btn = ({ dir, can, onClick }: { dir: "prev" | "next"; can: boolean; onClick: () => void }) => {
    const [h, setH] = useState(false), [p, setP] = useState(false);
    return (
      <button type="button" aria-label={dir} onClick={e => { e.stopPropagation(); onClick(); }} disabled={!can}
        onMouseEnter={() => setH(true)} onMouseLeave={() => { setH(false); setP(false); }} onMouseDown={() => setP(true)} onMouseUp={() => setP(false)}
        style={{ width: 44, height: 44, borderRadius: 999, border: `1px solid ${h && can ? color : BORDER}`, background: h && can ? color + "1a" : "rgba(10,10,10,0.8)", color: h && can ? color : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: can ? "pointer" : "default", opacity: can ? 1 : 0.2, transform: p ? "scale(0.88)" : h && can ? "scale(1.1)" : "scale(1)", transition: "all 0.18s cubic-bezier(0.34,1.56,0.64,1)", pointerEvents: can ? "auto" : "none", boxShadow: h && can ? `0 0 18px ${color}44` : "none" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d={dir === "prev" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    );
  };
  return (
    <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <Btn dir="prev" can={index > 0} onClick={onPrev} />
      <div style={{ minWidth: 72, textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 2, color: "#d6d6d6", background: "rgba(10,10,10,0.55)", border: `1px solid ${BORDER}`, borderRadius: 999, padding: "8px 12px" }}>{index + 1} / {total}</div>
      <Btn dir="next" can={index < total - 1} onClick={onNext} />
    </div>
  );
}

const PHONE_RATIO = 271 / 441;
const DESKTOP_RATIO = 1.3256;

function MobileMockup({ srcs, color, delay = 0, width }: { srcs: string[]; color: string; delay?: number; width: number }) {
  const { ref, visible } = useReveal(0.05);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [index, setIndex] = useState(0);
  const height = Math.round(width / PHONE_RATIO);
  const src = srcs[index] ?? "";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div ref={ref}
        onMouseMove={(e: ReactMouseEvent<HTMLDivElement>) => { const r = e.currentTarget.getBoundingClientRect(); setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 16, y: ((e.clientY - r.top) / r.height - 0.5) * -16 }); }}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        style={{ position: "relative", width, height, flexShrink: 0, opacity: visible ? 1 : 0, transform: visible ? `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)` : "translateY(70px) scale(0.85) rotateX(14deg)", transition: `opacity 0.9s ${delay}s cubic-bezier(0.22,1,0.36,1), transform 0.9s ${delay}s cubic-bezier(0.22,1,0.36,1)`, animation: visible ? "mobileFloat 4s ease-in-out infinite" : "none", cursor: "pointer", filter: `drop-shadow(0 30px 60px rgba(0,0,0,0.62)) drop-shadow(0 0 44px ${color}35)` }}>
        <div style={{ position: "absolute", top: "1%", bottom: "0.7%", left: "12.85%", right: "12.85%", borderRadius: "10% / 7%", overflow: "hidden", background: "#0a0a0a", zIndex: 1 }}>
          {src ? <img key={src} src={src} alt="App screenshot" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block", animation: "imgSwap 0.35s cubic-bezier(0.22,1,0.36,1)" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: "#c8c8c8" }}>SCREENSHOT</span></div>}
        </div>
        <img src="/mockup-mobile.png" alt="Phone frame" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none", zIndex: 2 }} />
      </div>
      {srcs.length > 1 && (<><div style={{ marginTop: 10, fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 2, color: "#7d7d7d" }}>SCREENSHOTS</div><ArrowNav index={index} total={srcs.length} color={color} onPrev={() => setIndex(i => Math.max(0, i - 1))} onNext={() => setIndex(i => Math.min(srcs.length - 1, i + 1))} /></>)}
    </div>
  );
}

function DesktopMockup({ srcs, color, delay = 0, width }: { srcs: string[]; color: string; delay?: number; width: number }) {
  const { ref, visible } = useReveal(0.05);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [index, setIndex] = useState(0);
  const height = Math.round(width / DESKTOP_RATIO);
  const src = srcs[index] ?? "";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div ref={ref}
        onMouseMove={(e: ReactMouseEvent<HTMLDivElement>) => { const r = e.currentTarget.getBoundingClientRect(); setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 10, y: ((e.clientY - r.top) / r.height - 0.5) * -7 }); }}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        style={{ position: "relative", width, height, flexShrink: 0, opacity: visible ? 1 : 0, transform: visible ? `perspective(1200px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)` : "translateY(60px) scale(0.92) rotateX(8deg)", transition: `opacity 0.9s ${delay}s cubic-bezier(0.22,1,0.36,1), transform 0.9s ${delay}s cubic-bezier(0.22,1,0.36,1)`, animation: visible ? "desktopFloat 5s ease-in-out infinite" : "none", filter: `drop-shadow(0 30px 72px rgba(0,0,0,0.65)) drop-shadow(0 0 55px ${color}1a)` }}>
        <div style={{ position: "absolute", top: "3.2%", bottom: "25%", left: "2.2%", right: "2.2%", overflow: "hidden", background: "#0a0a0a", zIndex: 1 }}>
          {src ? <img key={src} src={src} alt="App screenshot" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block", animation: "imgSwap 0.35s cubic-bezier(0.22,1,0.36,1)" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#c8c8c8", letterSpacing: 2 }}>SCREENSHOT</span></div>}
        </div>
        <img src="/mockup-desktop.png" alt="Desktop frame" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none", zIndex: 2 }} />
      </div>
      {srcs.length > 1 && (<><div style={{ marginTop: 10, fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 2, color: "#7d7d7d" }}>SCREENSHOTS</div><ArrowNav index={index} total={srcs.length} color={color} onPrev={() => setIndex(i => Math.max(0, i - 1))} onNext={() => setIndex(i => Math.min(srcs.length - 1, i + 1))} /></>)}
    </div>
  );
}

function BothMockup({ ss, color }: { ss: SplitScreenshots; color: string }) {
  const [cW, setCW] = useState(900);
  const wRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wRef.current; if (!el) return;
    const obs = new ResizeObserver(() => setCW(el.offsetWidth));
    obs.observe(el); setCW(el.offsetWidth); return () => obs.disconnect();
  }, []);
  const mobile = cW < 600; const gap = 20;
  const dW = mobile ? cW : Math.floor((cW - gap) * 0.7);
  const dH = Math.round(dW / DESKTOP_RATIO);
  const pW = mobile ? Math.floor(cW * 0.55) : Math.round(dH * PHONE_RATIO);
  return (
    <div ref={wRef} style={{ width: "100%", display: "flex", flexDirection: mobile ? "column" : "row", alignItems: mobile ? "center" : "flex-end", justifyContent: "center", gap }}>
      <DesktopMockup srcs={ss.desktop} color={color} delay={0.1} width={dW} />
      <MobileMockup srcs={ss.mobile} color={color} delay={0.3} width={pW} />
    </div>
  );
}

function VideoPromo({ videoUrl, color, title }: { videoUrl: string; color: string; title: string }) {
  const { ref, visible } = useReveal(0.05);
  const [playing, setPlaying] = useState(false);
  const vRef = useRef<HTMLVideoElement>(null);
  const isYT = videoUrl.includes("youtube") || videoUrl.includes("youtu.be");
  const ytEmbed = (url: string) => { const m = url.match(/(?:v=|youtu.be\/)([^&?/]+)/); return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0` : url; };
  return (
    <div ref={ref} style={{ marginBottom: 56, opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(32px)", transition: "all 0.8s 0.1s cubic-bezier(0.22,1,0.36,1)" }}>
      <SectionLabel label="PROMO VIDEO" color={color} />
      <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: `1px solid ${BORDER}`, aspectRatio: "16/9", background: "#0a0a0a", boxShadow: `0 28px 88px rgba(0,0,0,0.55), 0 0 140px ${color}10` }}>
        {playing ? (
          isYT ? <iframe src={ytEmbed(videoUrl)} style={{ width: "100%", height: "100%", border: "none" }} allow="autoplay; fullscreen" title={title} /> :
          <video ref={vRef} src={videoUrl} autoPlay controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${color}06 1px, transparent 1px), linear-gradient(90deg, ${color}06 1px, transparent 1px)`, backgroundSize: "44px 44px" }} />
            <div style={{ textAlign: "center", zIndex: 1 }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(18px,4vw,28px)", marginBottom: 24, opacity: 0.3 }}>{title}</div>
              <button onClick={() => setPlaying(true)} style={{ width: 76, height: 76, borderRadius: "50%", background: color, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", animation: "playPulse 2s ease-in-out infinite", transition: "transform 0.2s" }} onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#000" style={{ marginLeft: 4 }}><path d="M5 3l14 9-14 9V3z" /></svg>
              </button>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#c8c8c8", letterSpacing: 3, marginTop: 14 }}>CLICK TO PLAY</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(10px,1.5vw,12px)", color, letterSpacing: 3, whiteSpace: "nowrap" }}>{label}</div>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${color}44, transparent)` }} />
    </div>
  );
}

function ProjectLinks({ githubUrl, liveUrl, color, visible }: { githubUrl?: string; liveUrl?: string; color: string; visible: boolean }) {
  if (!githubUrl && !liveUrl) return null;
  const base: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "'DM Mono', monospace", fontSize: "clamp(11px,1.5vw,13px)", fontWeight: 700, letterSpacing: 1.5, padding: "13px 22px", borderRadius: 6, cursor: "pointer", textDecoration: "none", transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)" };
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transition: "all 0.7s 0.2s cubic-bezier(0.22,1,0.36,1)" }}>
      {githubUrl && (<a href={githubUrl} target="_blank" rel="noopener noreferrer" style={{ ...base, background: "transparent", color: "#fff", border: `1px solid ${BORDER}` }} onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${color}22`; }} onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.c8c8c8-1.113-4.c8c8c8-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>VIEW SOURCE</a>)}
      {liveUrl && (<a href={liveUrl} target="_blank" rel="noopener noreferrer" style={{ ...base, background: color, color: "#000", border: "none" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${color}55`; e.currentTarget.style.filter = "brightness(1.12)"; }} onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.filter = ""; }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>LIVE DEMO →</a>)}
    </div>
  );
}

/* --- Magnetic CTA section --- */
function MagneticCTA({ project, setActivePage }: { project: Project; setActivePage: (p: string) => void }) {
  const { ref, visible } = useReveal(0.15);
  const [mx, setMx] = useState(0), [my, setMy] = useState(0), [inside, setInside] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const onMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const el = ctaRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    setMx((e.clientX - (r.left + r.width / 2)) * 0.15);
    setMy((e.clientY - (r.top + r.height / 2)) * 0.15);
  };
  return (
    <div ref={ref} style={{ marginTop: 80, opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(44px)", transition: "all 0.9s cubic-bezier(0.22,1,0.36,1)" }}>
      <div ref={ctaRef} onMouseMove={onMove} onMouseEnter={() => setInside(true)} onMouseLeave={() => { setInside(false); setMx(0); setMy(0); }}
        style={{ position: "relative", padding: "clamp(36px,7vw,60px)", borderRadius: 18, border: `1px solid ${inside ? project.color + "40" : BORDER}`, background: CARD_BG, textAlign: "center", overflow: "hidden", transition: "border-color 0.3s, box-shadow 0.3s", boxShadow: inside ? `0 0 0 1px ${project.color}1a, 0 40px 100px ${project.color}14` : "none", transform: inside ? `translate(${mx * 0.3}px, ${my * 0.3}px)` : "none" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${project.color}04 1px, transparent 1px), linear-gradient(90deg, ${project.color}04 1px, transparent 1px)`, backgroundSize: "30px 30px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -80, left: -80, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${project.color}12 0%, transparent 70%)`, animation: "slowDrift 6s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, right: -80, width: 240, height: 240, borderRadius: "50%", background: `radial-gradient(circle, ${project.color}0c 0%, transparent 70%)`, animation: "slowDrift 9s 2s ease-in-out infinite reverse", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: project.color, letterSpacing: 4, marginBottom: 16, animation: "blinkDot 2.2s ease-in-out infinite" }}>● OPEN TO WORK</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(22px,5vw,34px)", marginBottom: 12, letterSpacing: -1.5 }}>Interested in working together?</div>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(12px,1.6vw,14px)", color: "#666", marginBottom: 36 }}>Let's build something real.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => { setActivePage("home"); setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 100); }}
              style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(11px,1.5vw,13px)", fontWeight: 700, letterSpacing: 2, background: project.color, color: "#000", border: "none", padding: "14px 34px", borderRadius: 6, cursor: "pointer", transition: "all 0.22s cubic-bezier(0.34,1.56,0.64,1)", transform: inside ? `translate(${mx * 0.6}px, ${my * 0.6}px)` : "none" }}
              onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.15)"; e.currentTarget.style.boxShadow = `0 14px 40px ${project.color}55`; }}
              onMouseLeave={e => { e.currentTarget.style.filter = ""; e.currentTarget.style.boxShadow = ""; }}>GET IN TOUCH →</button>
            {project.live_url && (<a href={project.live_url} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(11px,1.5vw,13px)", fontWeight: 700, letterSpacing: 2, background: "transparent", color: "#fff", border: `1px solid ${BORDER}`, padding: "14px 34px", borderRadius: 6, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = project.color; e.currentTarget.style.color = project.color; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = "#fff"; }}>VIEW LIVE SITE ↗</a>)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function CaseStudyPage({ project, setActivePage }: CaseStudyPageProps) {
  const [scrollPct, setScrollPct] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [heroVisible, setHeroVisible] = useState(false);
  const steps = ["Context", "Problem", "Solution", "Outcome"];
  const ss = normScreenshots(project.screenshots);
  const hasMobile = ss.mobile.length > 0;
  const hasDesktop = ss.desktop.length > 0;
  const mockupType: "mobile" | "desktop" | "both" = hasMobile && hasDesktop ? "both" : hasDesktop ? "desktop" : "mobile";

  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => setHeroVisible(true), 80);
    const onScroll = () => {
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollPct(pct);
      setActiveStep(Math.min(steps.length - 1, Math.floor((pct / 100) * steps.length)));
    };
    window.addEventListener("scroll", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); clearTimeout(t); };
  }, []);

  const sections = [
    { label: "Context", content: project.context },
    { label: "Problem", content: project.problem },
    { label: "Solution", content: project.solution },
    { label: "Outcome", content: project.outcome },
  ];

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <style>{`
        @keyframes mobileFloat{0%,100%{transform:perspective(900px) translateY(0px)}50%{transform:perspective(900px) translateY(-9px)}}
        @keyframes desktopFloat{0%,100%{transform:translateY(0px)}50%{transform:translateY(-6px)}}
        @keyframes blinkDot{0%,100%{opacity:0.45}50%{opacity:1}}
        @keyframes playPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,0.18)}50%{box-shadow:0 0 0 22px rgba(255,255,255,0)}}
        @keyframes heroSlideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
        @keyframes badgeBounce{0%{opacity:0;transform:translateY(12px) scale(0.87)}70%{transform:translateY(-3px) scale(1.06)}100%{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes marqueeScroll{from{transform:translateX(0)}to{transform:translateX(-33.c8c8c8%)}}
        @keyframes shimmerSweep{from{left:-100%}to{left:200%}}
        @keyframes iconPop{from{opacity:0;transform:scale(0) rotate(-45deg)}to{opacity:1;transform:scale(1) rotate(0deg)}}
        @keyframes imgSwap{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}
        @keyframes tagWave{0%,100%{transform:translateY(0px)}50%{transform:translateY(-6px)}}
        @keyframes slowDrift{0%,100%{transform:translate(0,0)}50%{transform:translate(22px,-16px)}}
      `}</style>

      <NoiseBackground color={project.color} />
      <CursorTrail color={project.color} />

      {/* progress bar */}
      <div style={{ position: "fixed", top: 64, left: 0, height: 3, background: project.color, width: `${scrollPct}%`, zIndex: 99, transition: "width 0.08s linear", boxShadow: `0 0 12px ${project.color}, 0 0 28px ${project.color}66` }} />

      {/* ambient floating rings */}
      <div style={{ position: "fixed", top: "18vh", right: "-140px", width: 380, height: 380, borderRadius: "50%", border: `1px solid ${project.color}12`, animation: "slowDrift 7s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "22vh", left: "-100px", width: 260, height: 260, borderRadius: "50%", border: `1px solid ${project.color}0d`, animation: "slowDrift 9s 3s ease-in-out infinite reverse", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "100px clamp(20px,6vw,40px) 80px", position: "relative", zIndex: 2 }}>

        {/* back */}
        <button onClick={() => setActivePage("projects")}
          style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#c8c8c8", background: "none", border: `1px solid ${BORDER}`, cursor: "pointer", letterSpacing: 1, marginBottom: 52, padding: "9px 18px", borderRadius: 6, display: "flex", alignItems: "center", gap: 8, opacity: heroVisible ? 1 : 0, transform: heroVisible ? "none" : "translateX(-16px)", transition: "all 0.6s 0.05s ease" }}
          onMouseEnter={e => { e.currentTarget.style.color = project.color; e.currentTarget.style.borderColor = project.color; e.currentTarget.style.transform = "translateX(-4px)"; e.currentTarget.style.boxShadow = `0 0 14px ${project.color}33`; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#c8c8c8"; e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = ""; }}>
          ← ALL PROJECTS
        </button>

        {/* HERO */}
        <div style={{ marginBottom: 64, position: "relative" }}>
          {heroVisible && <SparkleCanvas color={project.color} />}

          <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap", opacity: heroVisible ? 1 : 0, animation: heroVisible ? "badgeBounce 0.6s 0.05s both" : "none" }}>
            {[
              { t: "CASE STUDY", s: { color: project.color, background: project.color + "15", border: `1px solid ${project.color}30` } },
              { t: project.type.toUpperCase(), s: { color: "#c8c8c8", border: `1px solid ${BORDER}` } },
              ...(project.live_url ? [{ t: "● LIVE", s: { color: "#27c93f", background: "#27c93f15", border: "1px solid #27c93f30" } }] : []),
            ].map(b => <span key={b.t} style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(10px,1.3vw,11px)", padding: "5px 12px", borderRadius: 4, letterSpacing: 1.5, ...b.s }}>{b.t}</span>)}
          </div>

          <SplitTitle text={project.title} color={project.color} visible={heroVisible} />

          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(13px,2.5vw,15px)", color: "#888", lineHeight: 1.7, margin: "0 0 20px", opacity: heroVisible ? 1 : 0, animation: heroVisible ? "heroSlideUp 0.8s 0.5s both" : "none" }}>
            <ScrambleText text={project.tagline} trigger={heroVisible} />
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, opacity: heroVisible ? 1 : 0, animation: heroVisible ? "heroSlideUp 0.6s 0.6s both" : "none" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#c8c8c8", letterSpacing: 2 }}>ROLE</div>
            <div style={{ width: 24, height: 1, background: BORDER }} />
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: project.color }}>{project.role}</div>
          </div>

          <ProjectLinks githubUrl={project.github_url} liveUrl={project.live_url} color={project.color} visible={heroVisible} />
          {heroVisible && <KineticTags tags={project.tech} color={project.color} />}
        </div>

        {/* MOCKUP */}
        <div style={{ marginBottom: 64, position: "relative", maxWidth: 960, margin: "0 auto 64px" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "55%", height: "80%", background: `radial-gradient(ellipse, ${project.color}10 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0, animation: "slowDrift 5s ease-in-out infinite" }} />
          {mockupType === "mobile" && <div style={{ display: "flex", justifyContent: "center", position: "relative", zIndex: 1 }}><MobileMockup srcs={ss.mobile} color={project.color} delay={0.1} width={Math.round(460 * PHONE_RATIO)} /></div>}
          {mockupType === "desktop" && <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center" }}><DesktopMockup srcs={ss.desktop} color={project.color} delay={0.1} width={Math.round(460 * DESKTOP_RATIO)} /></div>}
          {mockupType === "both" && <BothMockup ss={ss} color={project.color} />}
        </div>

        <MarqueeStrip items={[...project.tech, project.type, project.role, "Case Study", project.title]} color={project.color} />

        {project.video_url && <div style={{ maxWidth: 920, margin: "0 auto 64px" }}><VideoPromo videoUrl={project.video_url} color={project.color} title={project.title} /></div>}

        {/* timeline */}
        <HorizontalTimeline steps={[
          { label: "Context", desc: "The backdrop & motivation" },
          { label: "Problem", desc: "Identifying the challenge" },
          { label: "Solution", desc: "How we tackled it" },
          { label: "Outcome", desc: "Impact & results" },
        ]} color={project.color} />

        {/* tech strip */}
        <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 24px", marginBottom: 56, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#c8c8c8", letterSpacing: 3, flexShrink: 0 }}>STACK</div>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${project.color}33, transparent)`, minWidth: 20 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {project.tech.map((t: string) => (
              <span key={t} style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: project.color, background: project.color + "12", padding: "5px 12px", borderRadius: 4, border: `1px solid ${project.color}28`, transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px) scale(1.1)"; e.currentTarget.style.boxShadow = `0 10px 24px ${project.color}44`; e.currentTarget.style.background = project.color + "28"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.background = project.color + "12"; }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* case sections */}
        <div style={{ marginBottom: 64 }}>
          <SectionLabel label="THE STORY" color={project.color} />
          {sections.map((sec, i) => <CaseSection key={i} label={sec.label} content={sec.content} color={project.color} index={i} />)}
        </div>

        <MagneticCTA project={project} setActivePage={setActivePage} />
      </div>
    </div>
  );
}