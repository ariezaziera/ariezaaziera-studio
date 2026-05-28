"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { YELLOW, CARD_BG, BORDER } from "@/constants";
import type { Project } from "@/types";

interface CaseStudyPageProps {
  project: Project;
  setActivePage: (page: string) => void;
}

// ─── Scroll-reveal hook ──────────────────────────────────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ─── CaseSection ─────────────────────────────────────────────────────────────
function CaseSection({ label, content, color, index }: { label: string; content: string; color: string; index: number }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} style={{ marginBottom: 40, opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(28px)", transition: `all 0.7s ${index * 0.12}s cubic-bezier(0.22,1,0.36,1)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, animation: "pulseDot 2s ease-in-out infinite" }} />
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(10px,1.5vw,12px)", color, letterSpacing: 2 }}>{label.toUpperCase()}</div>
      </div>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(13px,2.5vw,15px)", color: "#aaa", lineHeight: 1.9, margin: 0, paddingLeft: 18 }}>{content}</p>
    </div>
  );
}

// ─── MobileMockup ────────────────────────────────────────────────────────────
// Generic.png: 271×441 → ratio w/h = 0.6145
// No notch — full screen phone (iPhone 14 style)
// Screen inset: top 3.5%, bottom 3.5%, left 4.5%, right 4.5%
const PHONE_RATIO = 271 / 441; // 0.6145

function MobileMockup({ src, color, delay = 0, width }: { src: string; color: string; delay?: number; width: number }) {
  const { ref, visible } = useReveal(0.05);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const height = Math.round(width / PHONE_RATIO);

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    setTilt({ x, y });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{
        position: "relative",
        width,
        height,
        flexShrink: 0,
        opacity: visible ? 1 : 0,
        transform: visible
          ? `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`
          : "translateY(60px) scale(0.92)",
        transition: `opacity 0.8s ${delay}s cubic-bezier(0.22,1,0.36,1), transform 0.8s ${delay}s cubic-bezier(0.22,1,0.36,1)`,
        animation: visible ? "mobileFloat 4s ease-in-out infinite" : "none",
        cursor: "pointer",
        filter: `drop-shadow(0 24px 48px rgba(0,0,0,0.55)) drop-shadow(0 0 28px ${color}20)`,
      }}
    >
      {/* Screen content — inset tepat untuk Generic.png (no notch) */}
      <div style={{
        position: "absolute",
        top: "3.5%",
        bottom: "3.5%",
        left: "4.5%",
        right: "4.5%",
        borderRadius: "8% / 6%",
        overflow: "hidden",
        background: "#0a0a0a",
        zIndex: 1,
      }}>
        {src ? (
          <img
            src={src}
            alt="App screenshot"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top center",
              display: "block",
              verticalAlign: "top",
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#111" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: "#333" }}>SCREENSHOT</span>
          </div>
        )}
      </div>
      {/* Phone frame — Generic.png */}
      <img
        src="/mockup-mobile.png"
        alt="Phone frame"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
    </div>
  );
}

// ─── DesktopMockup ───────────────────────────────────────────────────────────
// mockup-desktop.png: 4096×3090 → ratio w/h = 1.3256
// Screen inset: top 3.2%, bottom 18.8% (stand), left 2.8%, right 2.8%
const DESKTOP_RATIO = 1.3256;

function DesktopMockup({ src, color, delay = 0, width }: { src: string; color: string; delay?: number; width: number }) {
  const { ref, visible } = useReveal(0.05);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const height = Math.round(width / DESKTOP_RATIO);

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
    setTilt({ x, y });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{
        position: "relative",
        width,
        height,
        flexShrink: 0,
        opacity: visible ? 1 : 0,
        transform: visible
          ? `perspective(1200px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`
          : "translateY(48px) scale(0.95)",
        transition: `opacity 0.9s ${delay}s cubic-bezier(0.22,1,0.36,1), transform 0.9s ${delay}s cubic-bezier(0.22,1,0.36,1)`,
        animation: visible ? "desktopFloat 5s ease-in-out infinite" : "none",
        cursor: "pointer",
        filter: `drop-shadow(0 24px 60px rgba(0,0,0,0.6)) drop-shadow(0 0 40px ${color}15)`,
      }}
    >
      {/* Screen content — inset tepat untuk desktop mockup */}
      <div style={{
        position: "absolute",
        top: "3.2%",
        bottom: "18.8%",
        left: "2.8%",
        right: "2.8%",
        overflow: "hidden",
        background: "#0a0a0a",
        zIndex: 1,
      }}>
        {src ? (
          <img
            src={src}
            alt="App screenshot"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top center",
              display: "block",
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f0f" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#333", letterSpacing: 2 }}>SCREENSHOT</span>
          </div>
        )}
      </div>
      {/* Desktop frame */}
      <img
        src="/mockup-desktop.png"
        alt="Desktop frame"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
    </div>
  );
}

// ─── BothMockup ──────────────────────────────────────────────────────────────
function BothMockup({ heroShot, screenshots, color }: { heroShot: string; screenshots: string[]; color: string }) {
  const [containerW, setContainerW] = useState(900);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => setContainerW(el.offsetWidth));
    obs.observe(el);
    setContainerW(el.offsetWidth);
    return () => obs.disconnect();
  }, []);

  const isMobileScreen = containerW < 600;

  const gap = 20;
  const desktopW = isMobileScreen ? containerW : Math.floor((containerW - gap) * 0.70);
  const desktopH = Math.round(desktopW / DESKTOP_RATIO);

  // Phone height matches desktop height → derive phone width from that
  const phoneH = desktopH;
  const phoneW = isMobileScreen ? Math.floor(containerW * 0.55) : Math.round(phoneH * PHONE_RATIO);

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: isMobileScreen ? "column" : "row",
        alignItems: "flex-end",
        justifyContent: "center",
        gap,
      }}
    >
      <DesktopMockup src={heroShot} color={color} delay={0.1} width={desktopW} />
      <MobileMockup src={screenshots[1] ?? heroShot} color={color} delay={0.3} width={phoneW} />
    </div>
  );
}

// ─── ScreenshotGallery ───────────────────────────────────────────────────────
function ScreenshotGallery({ screenshots, color }: { screenshots: string[]; color: string }) {
  const { ref, visible } = useReveal(0.05);
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (!screenshots || screenshots.length === 0) return null;

  return (
    <div ref={ref}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(10px,1.5vw,12px)", color, letterSpacing: 3, whiteSpace: "nowrap" }}>SCREENSHOTS</div>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(200px,100%),1fr))", gap: 12 }}>
        {screenshots.map((src, i) => (
          <div
            key={i}
            onClick={() => setLightbox(src)}
            style={{
              borderRadius: 8,
              overflow: "hidden",
              cursor: "zoom-in",
              border: `1px solid ${BORDER}`,
              aspectRatio: "16/9",
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(24px) scale(0.96)",
              transition: `all 0.6s ${i * 0.08}s cubic-bezier(0.22,1,0.36,1)`,
              position: "relative",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = color + "66"; e.currentTarget.style.transform = "translateY(-3px) scale(1.02)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = "none"; }}
          >
            <img src={src} alt={`Screenshot ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
          </div>
        ))}
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20, animation: "lightboxIn 0.25s ease", cursor: "zoom-out",
          }}
        >
          <img
            src={lightbox}
            alt="Screenshot fullsize"
            style={{
              maxWidth: "90vw", maxHeight: "85vh", borderRadius: 12,
              border: `1px solid ${BORDER}`,
              boxShadow: `0 32px 80px rgba(0,0,0,0.8), 0 0 60px ${color}20`,
              animation: "lightboxImgIn 0.3s cubic-bezier(0.22,1,0.36,1)",
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: "absolute", top: 20, right: 20,
              background: "none", border: `1px solid ${BORDER}`,
              color: "#fff", width: 40, height: 40, borderRadius: "50%",
              cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; }}
          >×</button>
        </div>
      )}
    </div>
  );
}

// ─── VideoPromo ──────────────────────────────────────────────────────────────
function VideoPromo({ videoUrl, color, title }: { videoUrl: string; color: string; title: string }) {
  const { ref, visible } = useReveal(0.05);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isYouTube = videoUrl.includes("youtube") || videoUrl.includes("youtu.be");
  const getYtEmbed = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0` : url;
  };

  return (
    <div ref={ref} style={{ marginBottom: 56, opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(32px)", transition: "all 0.8s 0.1s cubic-bezier(0.22,1,0.36,1)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(10px,1.5vw,12px)", color, letterSpacing: 3, whiteSpace: "nowrap" }}>PROMO VIDEO</div>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
      </div>
      <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: `1px solid ${BORDER}`, aspectRatio: "16/9", background: "#0a0a0a", boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 80px ${color}10` }}>
        {playing ? (
          isYouTube ? (
            <iframe src={getYtEmbed(videoUrl)} style={{ width: "100%", height: "100%", border: "none" }} allow="autoplay; fullscreen" title={`${title} promo video`} />
          ) : (
            <video ref={videoRef} src={videoUrl} autoPlay controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${color}12 0%, transparent 70%)`, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${color}08 1px, transparent 1px), linear-gradient(90deg, ${color}08 1px, transparent 1px)`, backgroundSize: "40px 40px", pointerEvents: "none" }} />
            <div style={{ textAlign: "center", zIndex: 1 }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(18px,4vw,28px)", marginBottom: 24, opacity: 0.4 }}>{title}</div>
              <button
                onClick={() => setPlaying(true)}
                style={{ width: 72, height: 72, borderRadius: "50%", background: color, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", animation: "playPulse 2s ease-in-out infinite", transition: "transform 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#000" style={{ marginLeft: 4 }}><path d="M5 3l14 9-14 9V3z" /></svg>
              </button>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(9px,1.3vw,11px)", color: "#555", letterSpacing: 2, marginTop: 16 }}>CLICK TO PLAY</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ProjectLinks ─────────────────────────────────────────────────────────────
function ProjectLinks({ githubUrl, liveUrl, color, visible }: { githubUrl?: string; liveUrl?: string; color: string; visible: boolean }) {
  if (!githubUrl && !liveUrl) return null;

  const btnBase: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 10,
    fontFamily: "'DM Mono', monospace", fontSize: "clamp(11px,1.5vw,13px)", fontWeight: 700, letterSpacing: 1.5,
    padding: "13px 22px", borderRadius: 6, cursor: "pointer",
    textDecoration: "none", transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
  };

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transition: "all 0.7s 0.2s cubic-bezier(0.22,1,0.36,1)" }}>
      {githubUrl && (
        <a href={githubUrl} target="_blank" rel="noopener noreferrer"
          style={{ ...btnBase, background: "transparent", color: "#fff", border: `1px solid ${BORDER}` }}
          onMouseEnter={(e: ReactMouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${color}22`; }}
          onMouseLeave={(e: ReactMouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
          VIEW SOURCE
        </a>
      )}
      {liveUrl && (
        <a href={liveUrl} target="_blank" rel="noopener noreferrer"
          style={{ ...btnBase, background: color, color: "#000", border: "none" }}
          onMouseEnter={(e: ReactMouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${color}44`; e.currentTarget.style.filter = "brightness(1.1)"; }}
          onMouseLeave={(e: ReactMouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.filter = ""; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
          </svg>
          LIVE DEMO →
        </a>
      )}
    </div>
  );
}

// ─── Main CaseStudyPage ───────────────────────────────────────────────────────
export default function CaseStudyPage({ project, setActivePage }: CaseStudyPageProps) {
  const [scrollPct, setScrollPct] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [heroVisible, setHeroVisible] = useState(false);
  const steps = ["Context", "Problem", "Solution", "Outcome"];

  const mockupType = project.mockup_type ?? "desktop";
  const screenshots = project.screenshots ?? [];
  const heroShot = screenshots[0] ?? "";
  const galleryShots = screenshots.slice(1);

  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => setHeroVisible(true), 100);
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
    { label: "Context",  content: project.context  },
    { label: "Problem",  content: project.problem  },
    { label: "Solution", content: project.solution },
    { label: "Outcome",  content: project.outcome  },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      <style>{`
        @keyframes mobileFloat {
          0%, 100% { transform: perspective(900px) translateY(0px); }
          50%       { transform: perspective(900px) translateY(-8px); }
        }
        @keyframes desktopFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.4); }
        }
        @keyframes playPulse {
          0%, 100% { box-shadow: 0 0 0 0   rgba(255,255,255,0.2); }
          50%       { box-shadow: 0 0 0 20px rgba(255,255,255,0);   }
        }
        @keyframes lightboxIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes lightboxImgIn {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1);    }
        }
        @keyframes heroSlideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes heroFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes badgeBounce {
          0%   { opacity: 0; transform: translateY(10px) scale(0.9);  }
          70%  {             transform: translateY(-3px) scale(1.04); }
          100% { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.12; }
          50%       { opacity: 0.22; }
        }
      `}</style>

      {/* Scroll progress bar */}
      <div style={{
        position: "fixed", top: 64, left: 0, height: 2,
        background: project.color, width: `${scrollPct}%`,
        zIndex: 99, transition: "width 0.1s linear",
        boxShadow: `0 0 8px ${project.color}88`,
      }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "100px clamp(20px,6vw,40px) 80px" }}>

        {/* Back button */}
        <button
          onClick={() => setActivePage("projects")}
          style={{
            fontFamily: "'DM Mono', monospace", fontSize: "clamp(11px,1.5vw,13px)",
            color: "#555", background: "none", border: "none", cursor: "pointer",
            letterSpacing: 1, marginBottom: 48, padding: 0,
            display: "flex", alignItems: "center", gap: 8,
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "none" : "translateX(-12px)",
            transition: "all 0.6s 0.05s ease",
          }}
          onMouseEnter={(e: ReactMouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = project.color; }}
          onMouseLeave={(e: ReactMouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "#555"; }}
        >
          ← ALL PROJECTS
        </button>

        {/* ── HERO ── */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", opacity: heroVisible ? 1 : 0, animation: heroVisible ? "badgeBounce 0.6s 0.1s both" : "none" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(10px,1.4vw,12px)", color: project.color, background: project.color + "15", padding: "4px 10px", borderRadius: 3, border: `1px solid ${project.color}30`, letterSpacing: 1 }}>CASE STUDY</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(10px,1.4vw,12px)", color: "#555", padding: "4px 10px", borderRadius: 3, border: `1px solid ${BORDER}`, letterSpacing: 1 }}>{project.type.toUpperCase()}</span>
            {project.live_url && (
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(10px,1.4vw,12px)", color: "#27c93f", background: "#27c93f15", padding: "4px 10px", borderRadius: 3, border: "1px solid #27c93f30", letterSpacing: 1, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#27c93f", animation: "pulseDot 1.5s ease-in-out infinite", display: "inline-block" }} />
                LIVE
              </span>
            )}
          </div>

          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(36px,9vw,80px)", lineHeight: 1.0, margin: "0 0 20px", letterSpacing: -2, opacity: heroVisible ? 1 : 0, animation: heroVisible ? "heroSlideUp 0.8s 0.15s both" : "none" }}>
            {project.title}<span style={{ color: project.color }}>.</span>
          </h1>

          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(13px,2.5vw,15px)", color: "#888", lineHeight: 1.7, margin: "0 0 20px", opacity: heroVisible ? 1 : 0, animation: heroVisible ? "heroSlideUp 0.8s 0.25s both" : "none" }}>
            {project.tagline}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, opacity: heroVisible ? 1 : 0, animation: heroVisible ? "heroFadeIn 0.6s 0.35s both" : "none" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(10px,1.4vw,12px)", color: "#555", letterSpacing: 2 }}>ROLE</div>
            <div style={{ flex: 1, height: 1, background: BORDER, maxWidth: 24 }} />
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(11px,1.5vw,13px)", color: project.color }}>{project.role}</div>
          </div>

          <ProjectLinks githubUrl={project.github_url} liveUrl={project.live_url} color={project.color} visible={heroVisible} />
        </div>

        {/* ── MOCKUP HERO ── */}
        <div style={{ marginBottom: 64, position: "relative", maxWidth: 900, margin: "0 auto 64px" }}>
          {/* Glow background */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "40%", height: "60%",
            background: `radial-gradient(circle, ${project.color}15 0%, transparent 70%)`,
            animation: "glowPulse 3s ease-in-out infinite",
            pointerEvents: "none", zIndex: 0,
          }} />

          {mockupType === "mobile" && (
            <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
              <MobileMockup src={heroShot}            color={project.color} delay={0.10} width={Math.round(460 * PHONE_RATIO)} />
              {screenshots[1] && <MobileMockup src={screenshots[1]} color={project.color} delay={0.25} width={Math.round(460 * PHONE_RATIO)} />}
              {screenshots[2] && <MobileMockup src={screenshots[2]} color={project.color} delay={0.40} width={Math.round(460 * PHONE_RATIO)} />}
            </div>
          )}

          {mockupType === "desktop" && (
            <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center" }}>
              <DesktopMockup src={heroShot} color={project.color} delay={0.1} width={Math.round(460 * DESKTOP_RATIO)} />
            </div>
          )}

          {mockupType === "both" && (
            <BothMockup heroShot={heroShot} screenshots={screenshots} color={project.color} />
          )}
        </div>

        {/* ── VIDEO PROMO ── */}
        {project.video_url && (
          <div style={{ maxWidth: 900, margin: "0 auto 64px" }}>
            <VideoPromo videoUrl={project.video_url} color={project.color} title={project.title} />
          </div>
        )}

        {/* ── STEP PROGRESS ── */}
        <div style={{ display: "flex", gap: 4, marginBottom: 48, overflowX: "auto", paddingBottom: 4 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <div style={{
                fontFamily: "'DM Mono', monospace", fontSize: "clamp(10px,1.4vw,12px)",
                padding: "5px 10px", borderRadius: 3,
                background: i <= activeStep ? project.color : CARD_BG,
                color:      i <= activeStep ? "#000"          : "#555",
                border:     `1px solid ${i <= activeStep ? project.color : BORDER}`,
                fontWeight: 700, letterSpacing: 1, whiteSpace: "nowrap",
                transition: "all 0.4s ease",
              }}>
                {s.toUpperCase()}
              </div>
              {i < steps.length - 1 && (
                <div style={{ width: 16, height: 1, background: i < activeStep ? project.color : BORDER, transition: "background 0.4s", flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>

        {/* ── TECH STACK ── */}
        <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "16px 20px", marginBottom: 48, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(10px,1.4vw,12px)", color: "#555", letterSpacing: 2, flexShrink: 0 }}>TECH</div>
          <div style={{ flex: 1, height: 1, background: BORDER, minWidth: 20 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {project.tech.map((t: string) => (
              <span key={t}
                style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(10px,1.4vw,12px)", color: project.color, background: project.color + "15", padding: "4px 10px", borderRadius: 3, border: `1px solid ${project.color}30`, transition: "transform 0.2s" }}
                onMouseEnter={(e: ReactMouseEvent<HTMLSpanElement>) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e: ReactMouseEvent<HTMLSpanElement>) => { e.currentTarget.style.transform = ""; }}
              >{t}</span>
            ))}
          </div>
        </div>

        {/* ── CASE SECTIONS ── */}
        {sections.map((sec, i) => (
          <CaseSection key={i} label={sec.label} content={sec.content} color={project.color} index={i} />
        ))}

        {/* ── SCREENSHOT GALLERY ── */}
        {galleryShots.length > 0 && (
          <div style={{ marginTop: 64, marginBottom: 64 }}>
            <ScreenshotGallery screenshots={galleryShots} color={project.color} />
          </div>
        )}

        {/* ── CTA ── */}
        <div style={{
          marginTop: 64,
          marginBottom: 0,
          padding: "clamp(24px,5vw,40px)",
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          textAlign: "center",
          boxShadow: `0 0 60px ${project.color}08`,
        }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(18px,4vw,24px)", marginBottom: 12 }}>Interested in working together?</div>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(12px,1.6vw,14px)", color: "#666", marginBottom: 28 }}>Let's build something real.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => { setActivePage("home"); setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 100); }}
              style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(11px,1.5vw,13px)", fontWeight: 700, letterSpacing: 2, background: project.color, color: "#000", border: "none", padding: "12px 28px", borderRadius: 4, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e: ReactMouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${project.color}40`; }}
              onMouseLeave={(e: ReactMouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              GET IN TOUCH →
            </button>
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: "'DM Mono', monospace", fontSize: "clamp(11px,1.5vw,13px)", fontWeight: 700, letterSpacing: 2, background: "transparent", color: "#fff", border: `1px solid ${BORDER}`, padding: "12px 28px", borderRadius: 4, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}
                onMouseEnter={(e: ReactMouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.borderColor = project.color; e.currentTarget.style.color = project.color; }}
                onMouseLeave={(e: ReactMouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = "#fff"; }}
              >
                VIEW LIVE SITE ↗
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
