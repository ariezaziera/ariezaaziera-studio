"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { YELLOW, BORDER } from "@/constants";
import type { Project } from "@/types";
import { useFeaturedProjects } from "@/lib/hooks";
import { VideoThumb } from "@/components/VideoThumb";

interface FeaturedSectionProps {
  setActivePage: (page: string) => void;
  setActiveProject: (project: Project) => void;
}

// ─── Ambient floating orbs ────────────────────────────────────────────────────
function AmbientOrbs() {
  const orbs = [
  { size: 340, x: "8%",  y: "15%", color: YELLOW,     delay: 0,  dur: 18 },
  { size: 260, x: "72%", y: "60%", color: "#E8A0A0",  delay: 4,  dur: 22 },
  { size: 200, x: "45%", y: "80%", color: "#E8C9A0",  delay: 8,  dur: 16 },
  { size: 180, x: "85%", y: "10%", color: YELLOW,     delay: 2,  dur: 20 },
];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {orbs.map((o, i) => (
        <div key={i} style={{
          position: "absolute", left: o.x, top: o.y,
          width: o.size, height: o.size, borderRadius: "50%",
          background: o.color, opacity: 0.022, filter: "blur(80px)",
          animation: `orbFloat${i} ${o.dur}s ${o.delay}s ease-in-out infinite alternate`,
        }} />
      ))}
      <style>{`
        @keyframes orbFloat0 { from{transform:translate(0,0) scale(1)} to{transform:translate(30px,-40px) scale(1.15)} }
        @keyframes orbFloat1 { from{transform:translate(0,0) scale(1)} to{transform:translate(-25px,35px) scale(0.9)} }
        @keyframes orbFloat2 { from{transform:translate(0,0) scale(1)} to{transform:translate(20px,-20px) scale(1.1)} }
        @keyframes orbFloat3 { from{transform:translate(0,0) scale(1)} to{transform:translate(-30px,25px) scale(0.95)} }
      `}</style>
    </div>
  );
}

// ─── Drifting particle field ───────────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = 55;
    type Particle = { x: number; y: number; vx: number; vy: number; r: number; alpha: number; color: string };
    const palette = [YELLOW, "#E8A0A0", "#E8C9A0", "#D4A574", "#5C1A22"];
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.25 + 0.05,
      color: palette[Math.floor(Math.random() * palette.length)],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 70) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = particles[i].color;
            ctx.globalAlpha = (1 - dist / 70) * 0.05;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas ref={canvasRef} style={{
      position: "absolute", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 1, opacity: 1,
    }} />
  );
}

// ─── Grain noise texture overlay ──────────────────────────────────────────────
function GrainOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 200; canvas.height = 200;
    const img = ctx.createImageData(200, 200);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = v; img.data[i+1] = v; img.data[i+2] = v;
      img.data[i+3] = Math.random() * 18;
    }
    ctx.putImageData(img, 0, 0);
  }, []);
  return (
    <canvas ref={canvasRef} style={{
      position: "absolute", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 2, opacity: 0.35,
      mixBlendMode: "overlay",
    }} />
  );
}

// ─── Magnetic cursor blob ──────────────────────────────────────────────────────
function CursorBlob({ sectionRef }: { sectionRef: React.RefObject<HTMLElement> }) {
  const blobRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -200, y: -200 });
  const current = useRef({ x: -200, y: -200 });
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let raf: number;
    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      pos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    section.addEventListener("mousemove", onMove);
    const animate = () => {
      current.current.x += (pos.current.x - current.current.x) * 0.08;
      current.current.y += (pos.current.y - current.current.y) * 0.08;
      if (blobRef.current) {
        blobRef.current.style.transform = `translate(${current.current.x - 120}px, ${current.current.y - 120}px)`;
      }
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => { section.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, [sectionRef]);
  return (
    <div ref={blobRef} style={{
      position: "absolute", top: 0, left: 0,
      width: 240, height: 240, borderRadius: "50%",
      background: `radial-gradient(circle, ${YELLOW}20 0%, transparent 70%)`,
      pointerEvents: "none", zIndex: 1,
      filter: "blur(40px)",
      transition: "opacity 0.3s",
    }} />
  );
}

// ─── Typewriter text ───────────────────────────────────────────────────────────
function Typewriter({ text, active, delay = 0 }: { text: string; active: boolean; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!active) return;
    let i = 0;
    const timeout = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(iv); setDone(true); }
      }, 55);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(timeout);
  }, [active, text, delay]);
  return (
    <span>
      {displayed}
      {!done && active && (
        <span style={{
          display: "inline-block", width: 2, height: "0.9em",
          background: YELLOW, marginLeft: 1, verticalAlign: "middle",
          animation: "cursorBlink 0.7s steps(1) infinite",
        }} />
      )}
    </span>
  );
}

// ─── Glitch text effect ────────────────────────────────────────────────────────
function GlitchText({ children, color }: { children: string; color?: string }) {
  const [glitching, setGlitching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    const schedule = () => {
      timerRef.current = setTimeout(() => {
        setGlitching(true);
        setTimeout(() => { setGlitching(false); schedule(); }, 300);
      }, 3000 + Math.random() * 4000);
    };
    schedule();
    return () => clearTimeout(timerRef.current);
  }, []);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      {glitching && (
        <>
          <span style={{
            position: "absolute", inset: 0,
            color: "#ffc8c8c83", clipPath: "inset(30% 0 40% 0)",
            transform: "translateX(-3px)",
            animation: "glitchShift 0.15s steps(2) infinite",
            mixBlendMode: "screen", pointerEvents: "none",
          }}>{children}</span>
          <span style={{
            position: "absolute", inset: 0,
            color: "#33ffff", clipPath: "inset(60% 0 10% 0)",
            transform: "translateX(3px)",
            animation: "glitchShift2 0.15s steps(2) infinite",
            mixBlendMode: "screen", pointerEvents: "none",
          }}>{children}</span>
        </>
      )}
    </span>
  );
}

// ─── Stats counter strip ───────────────────────────────────────────────────────
function useCountUp(target: number, active: boolean, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const timeout = setTimeout(() => {
      let start = 0;
      const step = Math.ceil(target / 24);
      const iv = setInterval(() => {
        start = Math.min(start + step, target);
        setVal(start);
        if (start >= target) clearInterval(iv);
      }, 38);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(timeout);
  }, [active, target, delay]);
  return val;
}

function StatsStrip({ projects, visible }: { projects: Project[]; visible: boolean }) {
  const totalTech = [...new Set(projects.flatMap(p => p.tech))].length;
  const liveCount = projects.filter(p => (p as any).status === "live").length;

  const countProjects = useCountUp(projects.length, visible, 100);
  const countTech = useCountUp(totalTech, visible, 250);
  const countLive = useCountUp(liveCount || projects.length, visible, 400);

  const stats = [
    { value: countProjects, label: "PROJECTS", suffix: "" },
    { value: countTech,     label: "TECH USED", suffix: "+" },
    { value: countLive,     label: "LIVE NOW",  suffix: "" },
  ];
  return (
    <div style={{
      display: "flex", gap: 0,
      border: `1px solid ${BORDER}`,
      borderRadius: 12, overflow: "hidden",
      marginBottom: 40,
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : "translateY(12px)",
      transition: "opacity 0.6s 0.3s, transform 0.6s 0.3s",
      position: "relative", zIndex: 2,
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          flex: 1, padding: "18px 0", textAlign: "center",
          borderRight: i < stats.length - 1 ? `1px solid ${BORDER}` : "none",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(135deg, ${YELLOW}08, transparent)`,
          }} />
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 28, fontWeight: 700,
            color: YELLOW, letterSpacing: -1, lineHeight: 1,
          }}>
            {s.value}{s.suffix}
          </div>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 8, color: "#c8c8c8",
            letterSpacing: 2, marginTop: 4,
          }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Status pill ───────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  "live":      { label: "LIVE",      color: "#4ADE80" },
  "in-dev":    { label: "IN DEV",    color: YELLOW },
  "completed": { label: "COMPLETED", color: "#60A5FA" },
  "archived":  { label: "ARCHIVED",  color: "#c8c8c8" },
};

function StatusPill({ status }: { status?: string }) {
  const cfg = STATUS_CONFIG[status ?? "live"] ?? STATUS_CONFIG["live"];
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 10px", borderRadius: 999,
      border: `1px solid ${cfg.color}22`,
      background: cfg.color + "0d",
      marginBottom: 10,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: "50%",
        background: cfg.color,
        boxShadow: `0 0 5px ${cfg.color}`,
        animation: "statusPulse 2s ease-in-out infinite",
        display: "block",
      }} />
      <span style={{
        fontFamily: "'DM Mono', monospace", fontSize: 8,
        color: cfg.color, letterSpacing: 1.5,
      }}>
        {cfg.label}
      </span>
    </div>
  );
}

// ─── Shimmer scan line ─────────────────────────────────────────────────────────
function ScanLine({ active }: { active: boolean }) {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden",
      borderRadius: "inherit",
    }}>
      <div style={{
        position: "absolute", left: 0, right: 0, height: "35%",
        background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.025) 50%, transparent)",
        top: active ? "120%" : "-40%",
        transition: active ? "top 0.55s cubic-bezier(0.22,1,0.36,1)" : "none",
      }} />
    </div>
  );
}

// ─── Holographic shimmer overlay ───────────────────────────────────────────────
function HoloShimmer({ active, mousePos }: { active: boolean; mousePos: { x: number; y: number } }) {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      borderRadius: "inherit",
      background: active
        ? `conic-gradient(from ${mousePos.x * 2.5}deg at ${mousePos.x}% ${mousePos.y}%,
            #ff000008, #ff7f0008, #ffff0008, #00ff0008,
            #0000ff08, #8b00ff08, #ff000008)`
        : "none",
      mixBlendMode: "screen",
      opacity: active ? 1 : 0,
      transition: "opacity 0.3s",
    }} />
  );
}

// ─── Floating tag cloud ────────────────────────────────────────────────────────
function FloatingTagCloud({ tags }: { tags: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Array<{ x: number; y: number; delay: number; dur: number }>>([]);
  useEffect(() => {
    setPositions(tags.map((_, i) => ({
      x: 5 + (i * 13) % 82,
      y: 5 + (i * 17) % 70,
      delay: i * 0.3,
      dur: 6 + (i % 4) * 2,
    })));
  }, [tags.length]);
  return (
    <div ref={containerRef} style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden",
    }}>
      {tags.slice(0, 12).map((tag, i) => (
        positions[i] ? (
          <div key={tag} style={{
            position: "absolute",
            left: `${positions[i].x}%`,
            top: `${positions[i].y}%`,
            fontFamily: "'DM Mono', monospace",
            fontSize: 8, color: "#ffffff06",
            letterSpacing: 2, whiteSpace: "nowrap",
            animation: `tagFloat${i % 4} ${positions[i].dur}s ${positions[i].delay}s ease-in-out infinite alternate`,
            userSelect: "none",
          }}>
            {tag.toUpperCase()}
          </div>
        ) : null
      ))}
    </div>
  );
}

// ─── Hover metric strip ────────────────────────────────────────────────────────
function MetricStrip({ project, visible }: { project: Project; visible: boolean }) {
  const metrics = (project as any).metrics as Array<{ label: string; value: string }> | undefined;
  if (!metrics?.length) return null;
  return (
    <div style={{
      display: "flex", gap: 0,
      borderTop: "1px solid #1a1a1a",
      marginTop: 16, paddingTop: 14,
      opacity: visible ? 1 : 0,
      maxHeight: visible ? 60 : 0,
      overflow: "hidden",
      transition: "opacity 0.35s 0.05s, max-height 0.35s",
    }}>
      {metrics.slice(0, 3).map((m, i) => (
        <div key={i} style={{
          flex: 1,
          borderRight: i < metrics.slice(0,3).length - 1 ? "1px solid #1a1a1a" : "none",
          padding: "0 12px",
          ...(i === 0 ? { paddingLeft: 0 } : {}),
        }}>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: 15,
            color: (project as any).color || YELLOW, letterSpacing: -0.5,
          }}>{m.value}</div>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 8, color: "#3a3a3a",
            letterSpacing: 1, marginTop: 2,
          }}>{m.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Animated border beam ──────────────────────────────────────────────────────
function BorderBeam({ active, color }: { active: boolean; color: string }) {
  return (
    <div style={{
      position: "absolute", inset: -1, borderRadius: "inherit",
      pointerEvents: "none", overflow: "hidden",
      opacity: active ? 1 : 0,
      transition: "opacity 0.3s",
    }}>
      <div style={{
        position: "absolute",
        width: "60%", height: "2px",
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        animation: active ? "beamRun 2.2s linear infinite" : "none",
        top: 0, left: 0,
      }} />
      <div style={{
        position: "absolute",
        width: "2px", height: "60%",
        background: `linear-gradient(180deg, transparent, ${color}, transparent)`,
        animation: active ? "beamRunV 2.2s linear 1.1s infinite" : "none",
        right: 0, top: 0,
      }} />
    </div>
  );
}

// ─── Depth noise background for cards ─────────────────────────────────────────
function CardNoise({ color }: { color: string }) {
  return (
    <div style={{
      position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none",
      background: `
        radial-gradient(ellipse 80% 50% at 100% 100%, ${color}06, transparent),
        radial-gradient(ellipse 50% 80% at 0% 0%, ${color}04, transparent)
      `,
    }} />
  );
}

// ─── Main FeaturedCard ─────────────────────────────────────────────────────────
function FeaturedCard({ project, onClick, index, large = false }: {
  project: Project;
  onClick: (p: Project) => void;
  index: number;
  large?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const countedIndex = useCountUp(index + 1, visible, index * 120);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x: px, y: py });
    const tx = ((e.clientX - rect.left) / rect.width - 0.5) * (large ? 8 : 10);
    const ty = ((e.clientY - rect.top) / rect.height - 0.5) * -(large ? 8 : 10);
    setTilt({ x: tx, y: ty });
  };

  const hasMedia = !!(project.image_url || project.preview_url);

  return (
    <div
      ref={ref}
      onClick={() => onClick(project)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setTilt({ x: 0, y: 0 }); setHovered(false); setMousePos({ x: 50, y: 50 }); }}
      style={{
        position: "relative",
        background: "rgba(43, 15, 18, 0.65)",
        border: `1px solid ${hovered ? project.color + "40" : BORDER}`,
        backdropFilter: "blur(8px)",
        borderRadius: large ? 20 : 16,
        padding: large ? "36px 32px" : "24px 22px",
        cursor: "pointer",
        overflow: "hidden",
        transform: visible
          ? `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(${hovered ? -8 : 0}px) scale(${hovered ? 1.012 : 1})`
          : `translateY(40px)`,
        opacity: visible ? 1 : 0,
        transition: `opacity 0.7s ${index * 0.12}s ease, transform 0.4s ease, border-color 0.3s, box-shadow 0.3s`,
        gridColumn: large ? "span 2" : "span 1",
        boxShadow: hovered ? `0 24px 60px ${project.color}18, 0 8px 24px rgba(0,0,0,0.6)` : "none",
      }}
    >
      {/* Floating tag cloud background */}
      <FloatingTagCloud tags={project.tech} />

      {/* Depth noise corners */}
      <CardNoise color={project.color} />

      {/* Spotlight glow that follows mouse */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(320px circle at ${mousePos.x}% ${mousePos.y}%, ${project.color}12, transparent 65%)`,
        transition: hovered ? "none" : "opacity 0.4s",
        opacity: hovered ? 1 : 0,
      }} />

      {/* Holographic shimmer */}
      <HoloShimmer active={hovered} mousePos={mousePos} />

      {/* Top accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${project.color}, ${project.color}00)`,
        opacity: hovered ? 1 : 0.25,
        transition: "opacity 0.3s",
      }} />

      {/* Animated border beam */}
      <BorderBeam active={hovered} color={project.color} />

      {/* Corner number */}
      <div style={{
        position: "absolute", top: large ? 28 : 20, right: large ? 28 : 20,
        fontFamily: "'DM Mono', monospace", fontSize: large ? 48 : 36,
        color: project.color, opacity: hovered ? 0.08 : 0.04,
        fontWeight: 700, lineHeight: 1,
        transition: "opacity 0.3s",
        userSelect: "none",
      }}>
        {String(countedIndex).padStart(2, "0")}
      </div>

      {/* Scan line sweep on hover */}
      <ScanLine active={hovered} />

      {/* Type badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6, marginBottom: large ? 24 : 18,
        fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 2,
        color: project.color, border: `1px solid ${project.color}30`,
        background: project.color + "10",
        padding: "4px 10px", borderRadius: 20,
        position: "relative", zIndex: 2,
      }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: project.color }} />
        {project.type.toUpperCase()}
      </div>

      {/* Status pill */}
      <div style={{ marginBottom: large ? 8 : 4, position: "relative", zIndex: 2 }}>
        <StatusPill status={project.status} />
      </div>

      {/* ── VIDEO / IMAGE THUMBNAIL ── */}
      {hasMedia && (
        <div style={{ position: "relative", zIndex: 2 }}>
          <VideoThumb
            imageUrl={project.image_url}
            previewUrl={project.preview_url}
            color={project.color}
            hovered={hovered}
            title={project.title}
            height={large ? 220 : 160}
          />
        </div>
      )}

      {/* Title */}
      <h3 style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 800,
        fontSize: large ? "clamp(28px, 4vw, 38px)" : "clamp(18px, 3vw, 22px)",
        color: "#fff", margin: `0 0 ${large ? 10 : 8}px`,
        letterSpacing: -1, lineHeight: 1.1,
        transition: "color 0.2s",
        position: "relative", zIndex: 2,
      }}>
        {project.title}
      </h3>

      {/* Tagline */}
      <p style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: large ? 12 : 11,
        color: "#d4d4d4",
        margin: `0 0 ${large ? 28 : 20}px`,
        lineHeight: 1.7,
        maxWidth: large ? 420 : "100%",
        position: "relative", zIndex: 2,
      }}>
        {project.tagline}
      </p>

      {/* Tech chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: large ? 32 : 22, position: "relative", zIndex: 2 }}>
        {project.tech.slice(0, large ? 6 : 3).map((t: string) => (
          <span key={t} style={{
            fontFamily: "'DM Mono', monospace", fontSize: 9,
            color: "#c0c0c0", background: "#ffffff08",
            padding: "3px 10px", borderRadius: 4,
            border: "1px solid #ffffff0d",
            transition: "color 0.2s, border-color 0.2s",
            ...(hovered ? { color: "#888", borderColor: project.color + "22" } : {}),
          }}>
            {t}
          </span>
        ))}
        {project.tech.length > (large ? 6 : 3) && (
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#c8c8c8", padding: "3px 8px" }}>
            +{project.tech.length - (large ? 6 : 3)} more
          </span>
        )}
      </div>

      {/* CTA */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        fontFamily: "'DM Mono', monospace", fontSize: 10,
        color: project.color, fontWeight: 700, letterSpacing: 1.5,
        position: "relative", zIndex: 2,
      }}>
        <span style={{ opacity: hovered ? 1 : 0.75, transition: "opacity 0.2s" }}>VIEW CASE STUDY</span>
        <span style={{
          display: "inline-block",
          transform: `translateX(${hovered ? 6 : 0}px)`,
          transition: "transform 0.25s ease",
          opacity: hovered ? 1 : 0.45,
        }}>→</span>
      </div>

      {/* Metric strip */}
      <MetricStrip project={project} visible={hovered} />
    </div>
  );
}

// ─── Main section ──────────────────────────────────────────────────────────────
export default function FeaturedSection({ setActivePage, setActiveProject }: FeaturedSectionProps) {
  const featuredProjects = useFeaturedProjects();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setHeaderVisible(true); },
      { threshold: 0.1 }
    );
    if (headerRef.current) obs.observe(headerRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="projects-featured"
      ref={sectionRef}
      style={{ padding: "80px clamp(20px, 6vw, 40px)", maxWidth: 900, margin: "0 auto", position: "relative" }}
    >
      <style>{`
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes statusPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes glitchShift  { 0%{transform:translateX(-3px) skewX(-2deg)} 100%{transform:translateX(2px) skewX(1deg)} }
        @keyframes glitchShift2 { 0%{transform:translateX(3px)  skewX(2deg)}  100%{transform:translateX(-2px) skewX(-1deg)} }
        @keyframes beamRun  { from{left:-60%;width:60%} to{left:160%;width:60%} }
        @keyframes beamRunV { from{top:-60%;height:60%} to{top:160%;height:60%} }
        @keyframes tagFloat0 { from{transform:translate(0,0)} to{transform:translate(6px,-8px)} }
        @keyframes tagFloat1 { from{transform:translate(0,0)} to{transform:translate(-5px,7px)} }
        @keyframes tagFloat2 { from{transform:translate(0,0)} to{transform:translate(8px,5px)} }
        @keyframes tagFloat3 { from{transform:translate(0,0)} to{transform:translate(-7px,-6px)} }
        @keyframes countPop  { 0%{transform:scale(1)} 30%{transform:scale(1.18)} 100%{transform:scale(1)} }
        @media (max-width: 640px) {
          .featured-grid { grid-template-columns: 1fr !important; }
          .featured-grid > div[style*="span 2"] { grid-column: span 1 !important; }
        }
      `}</style>

      <AmbientOrbs />
      <ParticleField />
      <GrainOverlay />
      <CursorBlob sectionRef={sectionRef as React.RefObject<HTMLElement>} />

      {/* Header */}
      <div ref={headerRef} style={{ position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            color: YELLOW, letterSpacing: 3, whiteSpace: "nowrap",
          }}>
            <Typewriter text="03 — PROOF" active={headerVisible} delay={200} />
          </div>
          <div style={{
            flex: 1, height: 1,
            background: `linear-gradient(90deg, ${BORDER}, transparent)`,
            opacity: headerVisible ? 1 : 0,
            transition: "opacity 0.8s 0.8s",
          }} />
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          marginBottom: 24, flexWrap: "wrap", gap: 16,
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? "none" : "translateY(16px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800,
            fontSize: "clamp(22px, 5vw, 36px)", margin: 0, letterSpacing: -1,
          }}>
            <GlitchText>Featured</GlitchText>{" "}
            <span style={{ color: YELLOW }}>
              <GlitchText>Work</GlitchText>
            </span>
          </h2>
          <button
            onClick={() => setActivePage("projects")}
            style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#c0c0c0",
              background: "none", border: `1px solid ${BORDER}`,
              padding: "8px 16px", borderRadius: 3, cursor: "pointer",
              letterSpacing: 1, transition: "color 0.2s, border-color 0.2s, box-shadow 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e: ReactMouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.color = YELLOW;
              e.currentTarget.style.borderColor = YELLOW;
              e.currentTarget.style.boxShadow = `0 0 12px ${YELLOW}30`;
            }}
            onMouseLeave={(e: ReactMouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.color = "#c0c0c0";
              e.currentTarget.style.borderColor = BORDER;
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            VIEW ALL →
          </button>
        </div>

        <StatsStrip projects={featuredProjects} visible={headerVisible} />
      </div>

      {/* Bento grid */}
      <div
        className="featured-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
          position: "relative", zIndex: 2,
        }}
      >
        {featuredProjects.map((p, i) => (
          <FeaturedCard
            key={p.id}
            project={p}
            index={i}
            large={i === 0}
            onClick={(proj) => { setActiveProject(proj); setActivePage("casestudy"); }}
          />
        ))}
      </div>

      {/* Marquee ticker */}
      <div style={{
        marginTop: 40, overflow: "hidden",
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
        padding: "12px 0",
        maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
        position: "relative", zIndex: 2,
      }}>
        <div style={{
          display: "flex", gap: 0,
          animation: "marquee 22s linear infinite",
          width: "max-content",
        }}>
          {[...Array(2)].map((_, ri) => (
            <div key={ri} style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {featuredProjects.flatMap((p) =>
                p.tech.map((t: string, ti: number) => (
                  <span key={`${ri}-${p.id}-${ti}`} style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 10,
                    color: "#c8c8c8", letterSpacing: 2, padding: "0 20px",
                    display: "flex", alignItems: "center", gap: 20, whiteSpace: "nowrap",
                  }}>
                    {t}
                    <span style={{ color: "#222", fontSize: 6 }}>◆</span>
                  </span>
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
