"use client";

import { useEffect, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { YELLOW, BORDER, AMBER, HIBISCUS } from "@/constants";
import Image from "next/image";
import { useProfile } from "@/lib/hooks";

interface LandingSectionProps {
  setActivePage: (page: string) => void;
}

export default function LandingSection({ setActivePage }: LandingSectionProps) {
  const [visible, setVisible] = useState(false);
  const [photoLoaded, setPhotoLoaded] = useState(false);

  const profile = useProfile();
  const PHOTO_SRC =
    (profile as typeof profile & { photo_url?: string }).photo_url ||
    "/profile1.png";

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="home"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "0 clamp(24px, 7vw, 80px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes photoFade {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }

        /* ── Desktop layout ── */
        .landing-grid {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: clamp(48px, 8vw, 100px);
          align-items: center;
          position: relative;
          zIndex: 2;
        }
        .landing-photo-wrap { display: block; }
        .landing-mobile-bg  { display: none; }

        /* ── Mobile layout ── */
        @media (max-width: 700px) {
          .landing-grid {
            grid-template-columns: 1fr !important;
          }
          .landing-photo-wrap {
            display: none !important;
          }
          .landing-mobile-bg {
            display: block !important;
          }
        }
      `}</style>

      {/* ── MOBILE: Full bleed background photo ── */}
      <div
        className="landing-mobile-bg"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      >
        <Image
          src={PHOTO_SRC}
          alt=""
          fill
          sizes="100vw"
          priority
          onLoad={() => setPhotoLoaded(true)}
          style={{
            objectFit: "cover",
            objectPosition: "top center",
            opacity: photoLoaded ? 1 : 0,
            transition: "opacity 0.6s ease",
          }}
        />
        {/* Gradient overlay — darker throughout, bottom matches body bg */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(
              to bottom,
              rgba(20,5,5,0.55) 0%,
              rgba(20,5,5,0.45) 15%,
              rgba(20,5,5,0.85) 40%,
              rgba(20,5,5,0.97) 65%,
              rgba(20,5,5,1) 85%,
              rgba(20,5,5,1) 100%
            )`,
          }}
        />
      </div>

      {/* Subtle ambient glow — desktop only */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "30%",
          width: "min(600px, 80vw)",
          height: "min(600px, 80vw)",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${HIBISCUS}18 0%, transparent 65%)`,
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div
        className="landing-grid"
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1100,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* ── LEFT / MAIN CONTENT ── */}
        <div>
          {/* Eyebrow */}
          <div
            style={{
              fontFamily: "var(--font-mono), 'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.3em",
              color: `${YELLOW}99`,
              marginBottom: 28,
              opacity: visible ? 1 : 0,
              animation: visible ? "fadeUp 0.6s 0.1s both" : "none",
            }}
          >
            FRONTEND DEVELOPER — PRODUCT BUILDER
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "var(--font-mono), 'DM Mono', monospace",
              fontWeight: 500,
              fontSize: "clamp(36px, 7vw, 80px)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: "0 0 28px",
              color: "#F0E6D3",
              opacity: visible ? 1 : 0,
              animation: visible ? "fadeUp 0.7s 0.2s both" : "none",
            }}
          >
            Building products
            <br />
            <span style={{ color: YELLOW }}>that ship.</span>
          </h1>

          {/* Divider */}
          <div
            style={{
              width: 48,
              height: 1,
              background: `linear-gradient(90deg, ${HIBISCUS}90, transparent)`,
              marginBottom: 28,
              opacity: visible ? 1 : 0,
              animation: visible ? "fadeUp 0.5s 0.35s both" : "none",
            }}
          />

          {/* Bio */}
          <p
            style={{
              fontFamily: "var(--font-body), 'DM Sans', sans-serif",
              fontSize: "clamp(13px, 2vw, 15px)",
              color: `${AMBER}cc`,
              maxWidth: 420,
              lineHeight: 1.8,
              margin: "0 0 48px",
              opacity: visible ? 1 : 0,
              animation: visible ? "fadeUp 0.6s 0.45s both" : "none",
            }}
          >
            I build interactive web systems that turn ideas into real products.
            Not just UI — full product thinking, front to back.
          </p>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              opacity: visible ? 1 : 0,
              animation: visible ? "fadeUp 0.6s 0.55s both" : "none",
            }}
          >
            <button
              onClick={() => setActivePage("projects")}
              style={{
                fontFamily: "var(--font-mono), 'DM Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.2em",
                fontWeight: 700,
                background: YELLOW,
                color: "#1E0305",
                border: "none",
                padding: "13px 26px",
                borderRadius: 3,
                cursor: "pointer",
                transition: "box-shadow 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e: ReactMouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.boxShadow = `0 6px 20px ${YELLOW}55`;
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e: ReactMouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "none";
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
                fontFamily: "var(--font-mono), 'DM Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.2em",
                fontWeight: 700,
                background: "transparent",
                color: "#F0E6D3",
                border: `1px solid ${BORDER}`,
                padding: "13px 26px",
                borderRadius: 3,
                cursor: "pointer",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e: ReactMouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.borderColor = YELLOW;
                e.currentTarget.style.color = YELLOW;
              }}
              onMouseLeave={(e: ReactMouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.borderColor = BORDER;
                e.currentTarget.style.color = "#F0E6D3";
              }}
            >
              GET IN TOUCH
            </button>
          </div>

          {/* Scroll hint */}
          <div
            style={{
              marginTop: 64,
              display: "flex",
              alignItems: "center",
              gap: 10,
              opacity: visible ? 1 : 0,
              animation: visible ? "fadeUp 0.5s 1s both" : "none",
            }}
          >
            <div
              style={{
                width: 1,
                height: 40,
                background: `linear-gradient(transparent, ${YELLOW}80)`,
                animation: "pulse 2s infinite",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono), 'DM Mono', monospace",
                fontSize: 8,
                color: `${YELLOW}50`,
                letterSpacing: "0.25em",
                writingMode: "vertical-rl",
              }}
            >
              SCROLL
            </span>
          </div>
        </div>

        {/* ── RIGHT: Desktop photo ── */}
        <div
          className="landing-photo-wrap"
          style={{
            flexShrink: 0,
            opacity: visible ? 1 : 0,
            animation: visible ? "photoFade 0.9s 0.6s both" : "none",
          }}
        >
          <div style={{ position: "relative", width: "clamp(180px, 20vw, 260px)" }}>
            <div
              style={{
                position: "relative",
                aspectRatio: "3/4",
                borderRadius: 8,
                overflow: "hidden",
                border: `1px solid ${BORDER}`,
                background: "#2A0C10",
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
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono), 'DM Mono', monospace",
                      fontSize: 8,
                      color: `${YELLOW}60`,
                      letterSpacing: 2,
                    }}
                  >
                    [ PHOTO ]
                  </span>
                </div>
              )}
              <Image
                src={PHOTO_SRC}
                alt="Arieza Aziera"
                fill
                sizes="(max-width: 700px) 0px, 260px"
                onLoad={() => setPhotoLoaded(true)}
                style={{ objectFit: "contain", objectPosition: "bottom center" }}
              />
            </div>

            {/* Status tag */}
            <div
              style={{
                marginTop: 10,
                padding: "8px 12px",
                border: `1px solid ${BORDER}`,
                borderRadius: 4,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(43, 15, 18, 0.7)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono), 'DM Mono', monospace",
                  fontSize: 8,
                  color: `${AMBER}99`,
                  letterSpacing: "0.15em",
                }}
              >
                (JB) MY · SG
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontFamily: "var(--font-mono), 'DM Mono', monospace",
                  fontSize: 8,
                  color: "#7FB069",
                  letterSpacing: "0.1em",
                }}
              >
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "#7FB069",
                    animation: "pulse 1.8s infinite",
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
