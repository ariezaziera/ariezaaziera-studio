"use client";

import { useState, useEffect } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { YELLOW, BORDER } from "@/constants";
import Image from "next/image";
import CircuitBackground from "@/components/Circuitbackground";
import { useProfile } from "@/lib/hooks";

interface LandingSectionProps {
  setActivePage: (page: string) => void;
}



export default function LandingSection({
  setActivePage,
}: LandingSectionProps) {
  const [typed, setTyped] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const [hasSeenAnimation, setHasSeenAnimation] = useState(true);

  const profile = useProfile();
  const PHOTO_SRC = (profile as typeof profile & { photo_url?: string }).photo_url || "/profile1.png";

  const fullText = "Frontend Developer\n& Product Builder";

  useEffect(() => {
    const seen = sessionStorage.getItem("landing_animation_seen");
    if (!seen) {
      setHasSeenAnimation(false);

      const timer = setTimeout(() => {
        sessionStorage.setItem("landing_animation_seen", "1");
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    let i = 0;

    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setTyped(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 45);

    const blink = setInterval(() => {
      setShowCursor((c) => !c);
    }, 530);

    return () => {
      clearInterval(interval);
      clearInterval(blink);
    };
  }, []);

  const lines = typed.split("\n");

  const photoImg = (
    <Image
      src={PHOTO_SRC}
      alt="Arieza Aziera"
      fill
      sizes="(max-width: 700px) 150px, 280px"
      onLoad={() => setPhotoLoaded(true)}
      style={{
        objectFit: "contain",
        objectPosition: "bottom center",
      }}
    />
  );

  const cornerAccents = (size = 16, thickness = 2) =>
    [
      { top: -6, left: -6 },
      { top: -6, right: -6 },
      { bottom: -6, left: -6 },
      { bottom: -6, right: -6 },
    ].map((pos, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          ...pos,
          width: size,
          height: size,
          borderTop:
            pos.top !== undefined ? `${thickness}px solid ${YELLOW}` : "none",
          borderBottom:
            pos.bottom !== undefined
              ? `${thickness}px solid ${YELLOW}`
              : "none",
          borderLeft:
            pos.left !== undefined ? `${thickness}px solid ${YELLOW}` : "none",
          borderRight:
            pos.right !== undefined
              ? `${thickness}px solid ${YELLOW}`
              : "none",
          animation: `cornerPulse ${2 + i * 0.3}s ease-in-out infinite`,
          zIndex: 3,
        }}
      />
    ));

  return (
    <section
      id="home"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 clamp(20px, 6vw, 40px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ✅ Circuit Background — ganti grid div lama */}
      <CircuitBackground />

      {/* Floating Orbs */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          width: "min(320px, 60vw)",
          height: "min(320px, 60vw)",
          background: `radial-gradient(circle, ${YELLOW}0e 0%, transparent 70%)`,
          borderRadius: "50%",
          animation: "orbFloat1 12s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "8%",
          width: "min(260px, 50vw)",
          height: "min(260px, 50vw)",
          background: `radial-gradient(circle, ${YELLOW}08 0%, transparent 70%)`,
          borderRadius: "50%",
          animation: "orbFloat2 16s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "55%",
          left: "55%",
          width: "min(180px, 35vw)",
          height: "min(180px, 35vw)",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "orbFloat3 9s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* Scan line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 1,
          background: `
            linear-gradient(
              90deg,
              transparent 0%,
              ${YELLOW}18 30%,
              ${YELLOW}28 50%,
              ${YELLOW}18 70%,
              transparent 100%
            )
          `,
          animation: "scanLine 8s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      <style>{`
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(24px, -18px) scale(1.06); }
          66% { transform: translate(-12px, 20px) scale(0.96); }
        }

        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(-20px, 16px) scale(1.08); }
          70% { transform: translate(14px, -10px) scale(0.94); }
        }

        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-16px, -20px); }
        }

        @keyframes scanLine {
          0% { top: -2px; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        @keyframes photoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }

        @keyframes cornerPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }

        @keyframes tagFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scrollPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        .landing-photo-desktop { display: block; }
        .landing-photo-mobile { display: none; }

        @media (max-width: 700px) {
          .landing-photo-desktop { display: none !important; }
          .landing-photo-mobile { display: block !important; }
          .landing-grid { grid-template-columns: 1fr !important; }
          .landing-buttons { flex-direction: column !important; }
          .landing-buttons button { width: 100% !important; }
          .landing-scroll-indicator { margin-top: 40px !important; }
        }

        @keyframes mobileCardEnter {
          0% {
            transform: translateX(120%) translate(-50%, -50%) scale(0.82);
            opacity: 0;
            filter: blur(10px);
          }
          60% {
            transform: translateX(-8%) translate(-50%, -50%) scale(1.03);
            opacity: 1;
            filter: blur(0px);
          }
          100% {
            transform: translateX(0) translate(-50%, -50%) scale(1);
            opacity: 1;
            filter: blur(0px);
          }
        }

        @keyframes mobileCardWait {
          0%, 100% {
            transform: translateX(0) translate(-50%, -50%);
            opacity: 1;
          }
        }

        @keyframes mobileCardExit {
          0% {
            transform: translateX(0) translate(-50%, -50%);
            opacity: 1;
          }
          100% {
            transform: translateX(-120%) translate(-50%, -50%);
            opacity: 0;
          }
        }

        @keyframes cardFlip {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(90deg); }
          100% { transform: rotateY(0deg); }
        }

        @keyframes photoReveal {
          0% { opacity: 0; transform: rotateY(180deg); }
          100% { opacity: 1; transform: rotateY(0deg); }
        }

        @keyframes backlightFlicker {
          0%   { opacity: 0; }
          20%  { opacity: 0.8; }
          40%  { opacity: 0.3; }
          60%  { opacity: 0.9; }
          80%  { opacity: 0.4; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* MOBILE FLOATING PHOTO CARD */}
      {!hasSeenAnimation && (
        <div
          className="landing-photo-mobile"
          style={{
            position: "absolute",
            top: "55%",
            left: "50%",
            zIndex: 999,
            pointerEvents: "none",
            animation: `
              mobileCardEnter 2s cubic-bezier(0.22, 1, 0.36, 1) 5s forwards,
              mobileCardWait 2.5s ease-out 8 forwards,
              mobileCardExit 0.9s ease-in 9s forwards
            `,
          }}
        >
          <div
            style={{
              width: "clamp(220px, 65vw, 360px)",
              background: "#0f0f0f",
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              overflow: "visible",
              position: "relative",
              boxShadow: `0 0 0 1px ${YELLOW}22, 0 16px 40px rgba(0,0,0,0.6)`,
              perspective: "600px",
              transformStyle: "preserve-3d",
              animation: "cardFlip 1.2s cubic-bezier(0.22, 1, 0.36, 1) 1.8s forwards",
            }}
          >
            {cornerAccents(10, 1.5)}

            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 8,
                pointerEvents: "none",
                zIndex: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(circle, ${YELLOW}66 0%, ${YELLOW}22 40%, transparent 70%)`,
                  borderRadius: 8,
                  opacity: 0,
                  animation: "backlightFlicker 0.5s ease-out 1.1s forwards",
                }}
              />
            </div>

            <div
              style={{
                position: "relative",
                aspectRatio: "3/4",
                borderRadius: "8px 8px 0 0",
                overflow: "hidden",
                transformStyle: "preserve-3d",
              }}
            >
              {!photoLoaded && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backfaceVisibility: "hidden",
                    background: "#1a1a1a",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9,
                      color: "#333",
                      letterSpacing: 2,
                    }}
                  >
                    [ PHOTO ]
                  </span>
                </div>
              )}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  opacity: 0,
                  animation: "photoReveal 0.7s ease-out 0.4s forwards",
                }}
              >
                {photoImg}
              </div>
            </div>

            <div
              style={{
                padding: "6px 8px",
                borderTop: `1px solid ${BORDER}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#0a0a0a",
                borderRadius: "0 0 8px 8px",
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 8,
                  color: "#d4d4d4",
                  letterSpacing: 1.5,
                }}
              >
                (JB)MY, SG
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 8,
                  color: YELLOW,
                  letterSpacing: 1,
                }}
              >
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: YELLOW,
                    animation: "cornerPulse 1.5s infinite",
                    display: "inline-block",
                  }}
                />
                AVAILABLE
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN GRID */}
      <div
        className="landing-grid"
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1100,
          margin: "0 auto",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "clamp(40px, 6vw, 80px)",
          alignItems: "center",
        }}
      >
        {/* LEFT CONTENT */}
        <div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: YELLOW,
              letterSpacing: 3,
              marginBottom: 24,
              opacity: 0,
              animation: "fadeUp 0.6s 0.2s forwards",
            }}
          >
            ARIEZA AZIERA
          </div>

          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(38px, 8vw, 80px)",
              lineHeight: 1,
              margin: "0 0 32px",
              letterSpacing: -2,
            }}
          >
            {lines.map((line, i) => (
              <div key={i}>
                {i === 1 ? (
                  <span style={{ color: YELLOW }}>{line}</span>
                ) : (
                  line
                )}
                {i === lines.length - 1 && showCursor && (
                  <span style={{ color: YELLOW, opacity: 0.8 }}>|</span>
                )}
              </div>
            ))}
          </h1>

          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "clamp(11px, 2.5vw, 13px)",
              color: "#d4d4d4",
              maxWidth: 440,
              lineHeight: 1.8,
              marginBottom: 48,
              opacity: 0,
              animation: "fadeUp 0.6s 0.8s forwards",
            }}
          >
            I build interactive web systems that turn ideas into real products.
            Not just UI — full product thinking, front to back.
          </p>

          {/* BUTTONS */}
          <div
            className="landing-buttons"
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              opacity: 0,
              animation: "fadeUp 0.6s 1s forwards",
            }}
          >
            <button
              onClick={() => setActivePage("projects")}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
                background: YELLOW,
                color: "#000",
                border: "none",
                padding: "14px 28px",
                borderRadius: 4,
                cursor: "pointer",
                transition: "0.2s",
              }}
              onMouseEnter={(e: ReactMouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 8px 24px ${YELLOW}40`;
              }}
              onMouseLeave={(e: ReactMouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              VIEW WORK →
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
                background: "transparent",
                color: "#fff",
                border: `1px solid ${BORDER}`,
                padding: "14px 28px",
                borderRadius: 4,
                cursor: "pointer",
                transition: "0.2s",
              }}
              onMouseEnter={(e: ReactMouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.borderColor = YELLOW;
                e.currentTarget.style.color = YELLOW;
              }}
              onMouseLeave={(e: ReactMouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.borderColor = BORDER;
                e.currentTarget.style.color = "#fff";
              }}
            >
              GET IN TOUCH
            </button>
          </div>

          {/* SCROLL */}
          <div
            className="landing-scroll-indicator"
            style={{
              marginTop: 64,
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: 0,
              animation: "fadeUp 0.6s 1.4s forwards",
            }}
          >
            <div
              style={{
                width: 1,
                height: 48,
                background: `linear-gradient(transparent, ${YELLOW})`,
                animation: "scrollPulse 2s infinite",
              }}
            />
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 9,
                color: "#555",
                letterSpacing: 2,
                writingMode: "vertical-rl",
              }}
            >
              SCROLL
            </span>
          </div>
        </div>

        {/* DESKTOP PHOTO */}
        <div
          className="landing-photo-desktop"
          style={{
            position: "relative",
            opacity: 0,
            animation: "fadeUp 0.8s 1.1s forwards",
            flexShrink: 0,
            marginBottom: "80px",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "clamp(180px, 22vw, 280px)",
            }}
          >
            {[
              { top: -8, left: -8 },
              { top: -8, right: -8 },
              { bottom: -8, left: -8 },
              { bottom: -8, right: -8 },
            ].map((pos, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  ...pos,
                  width: 16,
                  height: 16,
                  borderTop:
                    pos.top !== undefined ? `2px solid ${YELLOW}` : "none",
                  borderBottom:
                    pos.bottom !== undefined ? `2px solid ${YELLOW}` : "none",
                  borderLeft:
                    pos.left !== undefined ? `2px solid ${YELLOW}` : "none",
                  borderRight:
                    pos.right !== undefined ? `2px solid ${YELLOW}` : "none",
                  animation: `cornerPulse ${2 + i * 0.3}s ease-in-out infinite`,
                  zIndex: 3,
                }}
              />
            ))}

            <div
              style={{
                position: "absolute",
                top: 12,
                left: -4,
                width: 3,
                height: "calc(100% - 24px)",
                background: `linear-gradient(transparent, ${YELLOW}, transparent)`,
                borderRadius: 2,
                opacity: 0.7,
              }}
            />

            <div
              style={{
                position: "relative",
                borderRadius: 6,
                overflow: "hidden",
                animation: "photoFloat 6s ease-in-out infinite",
                border: `1px solid ${BORDER}`,
                paddingTop: "20px",
                aspectRatio: "3/4",
                boxSizing: "border-box",
                background: "transparent",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: "20% 15%",
                  background: `${YELLOW}15`,
                  filter: "blur(60px)",
                  borderRadius: "50%",
                  zIndex: 0,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />

              {photoImg}

              {!photoLoaded && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9,
                      color: "#333",
                      letterSpacing: 2,
                    }}
                  >
                    [ PHOTO ]
                  </span>
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: 12,
                padding: "8px 12px",
                border: `1px solid ${BORDER}`,
                borderRadius: 4,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                animation: "tagFloat 4s ease-in-out infinite",
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  color: "#d4d4d4",
                  letterSpacing: 2,
                }}
              >
                (JB)MY, SG
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  color: YELLOW,
                  letterSpacing: 1,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: YELLOW,
                    animation: "cornerPulse 1.5s infinite",
                    display: "inline-block",
                  }}
                />
                AVAILABLE
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}