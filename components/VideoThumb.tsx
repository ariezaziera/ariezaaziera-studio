"use client";

/**
 * VideoThumb
 * ──────────
 * Drop-in thumbnail component for project cards.
 *
 * - Default:  shows `image_url` as a static thumbnail
 * - On hover: crossfades to `preview_url` MP4 (autoplay, muted, loop)
 * - If no image_url: shows a solid color placeholder
 * - If no preview_url: stays as static image (no video attempt)
 *
 * Usage inside ProjectCard:
 *   <VideoThumb
 *     imageUrl={project.image_url}
 *     previewUrl={project.preview_url}
 *     color={project.color}
 *     hovered={hovered}
 *     title={project.title}
 *   />
 */

import { useEffect, useRef, useState } from "react";

interface VideoThumbProps {
  imageUrl?: string;
  previewUrl?: string;
  color: string;
  hovered: boolean;
  title: string;
  /** Height of the thumbnail area. Default: 160px */
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
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Play/pause video on hover
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !previewUrl) return;

    if (hovered) {
      // Reset to start for a snappy preview every time
      video.currentTime = 0;
      video.play().catch(() => {
        // Autoplay blocked — silently fall back to thumbnail
        setVideoError(true);
      });
    } else {
      video.pause();
    }
  }, [hovered, previewUrl]);

  const hasPreview = !!previewUrl && !videoError;
  const showVideo = hasPreview && hovered && videoReady;

  return (
    <div
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
      {/* ── Static thumbnail ──────────────────────────── */}
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
        /* Placeholder when no image_url */
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
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: color + "44",
              border: `1px solid ${color}66`,
            }}
          />
        </div>
      )}

      {/* ── Preview video ──────────────────────────────── */}
      {hasPreview && (
        <video
          ref={videoRef}
          src={previewUrl}
          muted
          loop
          playsInline
          preload="metadata" // only load metadata until hover
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
            // Prevents layout shift — video hidden until ready
            display: "block",
          }}
        />
      )}

      {/* ── "Preview" badge — only visible on hover when video exists ── */}
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
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(-4px)",
            transition: "opacity 0.25s, transform 0.25s",
            pointerEvents: "none",
            zIndex: 3,
          }}
        >
          ▶ PREVIEW
        </div>
      )}

      {/* ── Hover gradient overlay (always present, subtle) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, transparent 40%, ${color}22 100%)`,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.35s ease",
          pointerEvents: "none",
          zIndex: 2,
          borderRadius: 8,
        }}
      />
    </div>
  );
}
