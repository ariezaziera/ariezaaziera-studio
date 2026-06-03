"use client";

import { useEffect, useRef, useState } from "react";

interface VideoThumbProps {
  imageUrl?: string;
  previewUrl?: string;
  color: string;
  hovered: boolean;
  title: string;
  height?: number | string;
}

export function VideoThumb({
  imageUrl,
  previewUrl,
  color,
  hovered,
  title,
  height = 160,
}: VideoThumbProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [inView, setInView] = useState(false);
  // ← NEW: only true after the 1.5s delay fires
  const [playing, setPlaying] = useState(false);

  // Detect touch/mobile device
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // IntersectionObserver for mobile scroll-to-play
  useEffect(() => {
    if (!isMobile || !containerRef.current || !previewUrl) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.6 }
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [isMobile, previewUrl]);

  // Play/pause logic with delay
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !previewUrl) return;

    const shouldPlay = isMobile ? inView : hovered;

    if (shouldPlay) {
      // Wait 1.5s — thumbnail stays fully visible during this time
      const timer = setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => setVideoError(true));
        setPlaying(true); // ← only NOW show the video + hide thumbnail
      }, isMobile ? 1500 : 0);
      return () => {
        clearTimeout(timer);
      };
    } else {
      video.pause();
      setPlaying(false); // ← reset so thumbnail shows again immediately
    }
  }, [hovered, inView, isMobile, previewUrl]);

  const hasPreview = !!previewUrl && !videoError;
  // Desktop: use hovered as before. Mobile: use playing (post-delay)
  const isActive = isMobile ? playing : hovered;
  const showVideo = hasPreview && isActive && videoReady;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height,
        borderRadius: 8,
        overflow: "hidden",
        marginBottom: 16,
        background: imageUrl ? "transparent" : color + "18",
        border: `1px solid ${color}22`,
      }}
    >
      {/* Static thumbnail — stays until playing kicks in */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: 8,
            opacity: showVideo ? 0 : 1,
            transition: "opacity 0.35s ease",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: showVideo ? 0 : 1,
            transition: "opacity 0.35s ease",
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: color + "44",
            border: `1px solid ${color}66`,
          }} />
        </div>
      )}

      {/* Preview video */}
      {hasPreview && (
        <video
          ref={videoRef}
          src={previewUrl}
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoError(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: 8,
            opacity: showVideo ? 1 : 0,
            transition: "opacity 0.35s ease",
            display: "block",
          }}
        />
      )}

      {/* Preview badge — only shows after delay too */}
      {hasPreview && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            padding: "3px 8px",
            borderRadius: 4,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            border: `1px solid ${color}33`,
            fontFamily: "'DM Mono', monospace",
            fontSize: 8,
            color: color,
            letterSpacing: 1.5,
            opacity: isActive ? 1 : 0,
            transform: isActive ? "translateY(0)" : "translateY(-4px)",
            transition: "opacity 0.25s, transform 0.25s",
            pointerEvents: "none",
            zIndex: 3,
          }}
        >
          ▶ PREVIEW
        </div>
      )}

      {/* Gradient overlay — only shows after delay too */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, transparent 40%, ${color}22 100%)`,
          opacity: isActive ? 1 : 0,
          transition: "opacity 0.35s ease",
          pointerEvents: "none",
          zIndex: 2,
          borderRadius: 8,
        }}
      />
    </div>
  );
}
