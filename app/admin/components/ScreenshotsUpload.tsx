"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { YELLOW, BORDER, GREEN, RED, btnStyle } from "../layout";
import type { SplitScreenshots } from "@/types/split-screenshots";

// ─── Crop aspect ratios per device ───────────────────────────────────────────
const CROP_RATIOS = {
  mobile: 9 / 19.5,  // modern phone ratio ~718x1556
  desktop: 16 / 10,   // landscape 4:3-ish
};

export type { SplitScreenshots } from "@/types/split-screenshots";

// ─── Styles ───────────────────────────────────────────────────────────────────
const MOBILE_ACCENT = "#A78BFA";
const DESKTOP_ACCENT = "#60A5FA";
const MOBILE_ACCENT_BG = "rgba(167,139,250,0.10)";
const DESKTOP_ACCENT_BG = "rgba(96,165,250,0.10)";

// ─── useViewportSize hook ─────────────────────────────────────────────────────
function useViewportSize() {
  const [size, setSize] = useState({
    w: typeof window !== "undefined" ? window.innerWidth : 480,
    h: typeof window !== "undefined" ? window.innerHeight : 800,
  });
  useEffect(() => {
    const handler = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return size;
}

// ─── CropModal ────────────────────────────────────────────────────────────────
function CropModal({
  file,
  deviceType,
  queueIndex,
  queueTotal,
  onConfirm,
  onSkip,
  onCancel,
}: {
  file: File;
  deviceType: "mobile" | "desktop";
  queueIndex: number;
  queueTotal: number;
  onConfirm: (blob: Blob) => void;
  onSkip: () => void;
  onCancel: () => void;
}) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgSrc] = useState(() => URL.createObjectURL(file));
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropW, setCropW] = useState(0);
  const [cropH, setCropH] = useState(0);
  const [imgNaturalW, setImgNaturalW] = useState(0);
  const [imgNaturalH, setImgNaturalH] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });

  const { w: vw, h: vh } = useViewportSize();

  // FIX 1: Responsive — 32px padding each side, max 520px
  const PREVIEW_W = Math.min(520, vw - 64);
  const targetRatio = CROP_RATIOS[deviceType];
  const accent = deviceType === "mobile" ? MOBILE_ACCENT : DESKTOP_ACCENT;

  const initCrop = useCallback(
    (natW: number, natH: number) => {
      const imgRatio = natW / natH;
      let cw: number, ch: number;
      if (imgRatio > targetRatio) {
        ch = natH;
        cw = Math.round(ch * targetRatio);
      } else {
        cw = natW;
        ch = Math.round(cw / targetRatio);
      }
      setCropW(cw);
      setCropH(ch);
      setCropX(Math.round((natW - cw) / 2));
      setCropY(Math.round((natH - ch) / 2));
      setImgNaturalW(natW);
      setImgNaturalH(natH);
    },
    [targetRatio]
  );

  const scaleW = imgNaturalW > 0 ? PREVIEW_W / imgNaturalW : 1;
  const fullPreviewH = Math.round(imgNaturalH * scaleW);

  // FIX 2: Cap height — leave 180px for header + buttons
  const maxPreviewH = Math.max(100, vh - 200);
  const previewH = Math.min(fullPreviewH || 300, maxPreviewH);

  // FIX 3: Recalc effective scale + width if height was clamped
  const effectiveScale = fullPreviewH > 0 ? (previewH / fullPreviewH) * scaleW : scaleW;
  const previewW = imgNaturalW > 0 ? Math.round(imgNaturalW * effectiveScale) : PREVIEW_W;

  const clampCrop = (x: number, y: number) => ({
    x: Math.max(0, Math.min(imgNaturalW - cropW, x)),
    y: Math.max(0, Math.min(imgNaturalH - cropH, y)),
  });

  // Mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOrigin({ x: cropX, y: cropY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const { x, y } = clampCrop(
      Math.round(dragOrigin.x + (e.clientX - dragStart.x) / effectiveScale),
      Math.round(dragOrigin.y + (e.clientY - dragStart.y) / effectiveScale)
    );
    setCropX(x);
    setCropY(y);
  };

  // Touch drag
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setDragging(true);
    setDragStart({ x: t.clientX, y: t.clientY });
    setDragOrigin({ x: cropX, y: cropY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    e.preventDefault();
    const t = e.touches[0];
    const { x, y } = clampCrop(
      Math.round(dragOrigin.x + (t.clientX - dragStart.x) / effectiveScale),
      Math.round(dragOrigin.y + (t.clientY - dragStart.y) / effectiveScale)
    );
    setCropX(x);
    setCropY(y);
  };

  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    canvas.toBlob((blob) => { if (blob) onConfirm(blob); }, "image/webp", 0.92);
  };

  const boxX = Math.round(cropX * effectiveScale);
  const boxY = Math.round(cropY * effectiveScale);
  const boxW = Math.round(cropW * effectiveScale);
  const boxH = Math.round(cropH * effectiveScale);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)",
      zIndex: 999,
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      overflowY: "auto",
      padding: "4vh 16px 24px",
    }}>
      <div style={{
        background: "#0f0f0f", border: `1px solid #1e1e1e`,
        borderRadius: 14, padding: 20,
        width: "100%",
        maxWidth: 560,  // FIX: was Math.max(effectivePreviewW + 40, 320)
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7, background: `${accent}18`,
            border: `1px solid ${accent}30`, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 14, flexShrink: 0,
          }}>
            ✂️
          </div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>
              Crop to fit
            </div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 1 }}>
              {deviceType === "mobile" ? "Portrait · 9:19.5" : "Landscape · 4:3"} — drag to reposition
            </div>
          </div>
        </div>
        
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {queueIndex < queueTotal - 1 ? (
            // Not last image — show "Crop & Next" button
            <button
              onClick={handleConfirm}
              style={{ ...btnStyle, flex: 1, background: accent, color: "#000", border: `1px solid ${accent}`, fontSize: 12, fontWeight: 600 }}
            >
              Crop &amp; Next →
            </button>
          ) : (
            // Last image — show "Confirm crop"
            <button
              onClick={handleConfirm}
              style={{ ...btnStyle, flex: 1, background: accent, color: "#000", border: `1px solid ${accent}`, fontSize: 12, fontWeight: 600 }}
            >
              Confirm crop
            </button>
          )}
          {queueIndex < queueTotal - 1 && (
            <button
              onClick={onSkip}
              style={{ ...btnStyle, fontSize: 12 }}
              title="Skip this image"
            >
              Skip
            </button>
          )}
          <button
            onClick={() => { URL.revokeObjectURL(imgSrc); onCancel(); }}
            style={{ ...btnStyle, fontSize: 12 }}
          >
            Cancel
          </button>
        </div>

        {/* Crop canvas */}
        <div
          style={{
            position: "relative",
            width: previewW,   // FIX: was effectivePreviewW (broken calc)
            height: previewH,  // FIX: was clampedPreviewH
            overflow: "visible", border: `1px solid #1e1e1e`,
            cursor: dragging ? "grabbing" : "grab", userSelect: "none",
            margin: "0 auto 10px", background: "#080808",
            touchAction: "none",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => setDragging(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={imgSrc}
            alt="Crop preview"
            onLoad={(e) => {
              const img = e.currentTarget;
              initCrop(img.naturalWidth, img.naturalHeight);
            }}
            style={{
              width: previewW,   // FIX: was effectivePreviewW
              height: previewH,  // FIX: was clampedPreviewH
              objectFit: "fill",
              display: "block",
              pointerEvents: "none",
              filter: "brightness(0.3)",
              borderRadius: 10,
            }}
          />
          {cropW > 0 && (
            <>
              {/* Dark overlays around crop box */}
              {/* Top */}
              <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: boxY, background: "rgba(0,0,0,0.5)", pointerEvents: "none" }} />
              {/* Bottom */}
              <div style={{ position: "absolute", left: 0, right: 0, top: boxY + boxH, bottom: 0, background: "rgba(0,0,0,0.5)", pointerEvents: "none" }} />
              {/* Left */}
              <div style={{ position: "absolute", left: 0, width: boxX, top: boxY, height: boxH, background: "rgba(0,0,0,0.5)", pointerEvents: "none" }} />
              {/* Right */}
              <div style={{ position: "absolute", left: boxX + boxW, right: 0, top: boxY, height: boxH, background: "rgba(0,0,0,0.5)", pointerEvents: "none" }} />
          
              {/* Crop border + grid lines */}
              <div style={{
                position: "absolute",
                left: boxX, top: boxY,
                width: boxW, height: boxH,
                border: `2px solid ${accent}`,
                pointerEvents: "none",
              }}>
                {[1, 2].map(n => (
                  <div key={`h${n}`} style={{ position: "absolute", left: 0, right: 0, top: `${(n / 3) * 100}%`, height: 1, background: `${accent}30` }} />
                ))}
                {[1, 2].map(n => (
                  <div key={`v${n}`} style={{ position: "absolute", top: 0, bottom: 0, left: `${(n / 3) * 100}%`, width: 1, background: `${accent}30` }} />
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ fontSize: 10, color: "#383838", textAlign: "center", marginBottom: 16, letterSpacing: 0.5 }}>
          {cropW} × {cropH}px
          {queueTotal > 1 && (
            <span style={{ marginLeft: 10, color: "#444" }}>
              {queueIndex + 1} / {queueTotal}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ThumbnailGrid ────────────────────────────────────────────────────────────
function ThumbnailGrid({
  deviceType,
  screenshots,
  onRemove,
  onMove,
}: {
  deviceType: "mobile" | "desktop";
  screenshots: string[];
  onRemove: (idx: number) => void;
  onMove: (idx: number, dir: -1 | 1) => void;
}) {
  const isMobile = deviceType === "mobile";
  const accent = isMobile ? MOBILE_ACCENT : DESKTOP_ACCENT;

  if (screenshots.length === 0) return null;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: isMobile
        ? "repeat(auto-fill, minmax(72px, 1fr))"
        : "repeat(auto-fill, minmax(144px, 1fr))",
      gap: 8,
      marginBottom: 12,
    }}>
      {screenshots.map((url, i) => (
        <div
          key={url + i}
          style={{
            position: "relative",
            borderRadius: 8,
            overflow: "hidden",
            border: `1px solid ${i === 0 ? accent + "50" : BORDER}`,
            aspectRatio: isMobile ? "9/16" : "16/9",
            background: "#0a0a0a",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={`${deviceType} ${i + 1}`}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
          />
          {i === 0 && (
            <div style={{
              position: "absolute", bottom: 4, left: 4,
              fontSize: 9, fontWeight: 600, letterSpacing: 0.5,
              color: accent, background: "rgba(0,0,0,0.88)",
              border: `1px solid ${accent}30`, padding: "2px 6px", borderRadius: 4,
            }}>
              Hero
            </div>
          )}
          <div style={{ position: "absolute", top: 4, right: 4, display: "flex", gap: 3 }}>
            <button
              onClick={() => onMove(i, -1)}
              disabled={i === 0}
              title="Move left"
              style={{
                ...btnStyle, fontSize: 9, padding: "2px 5px",
                background: "rgba(0,0,0,0.88)", opacity: i === 0 ? 0.25 : 1,
              }}
            >◀</button>
            <button
              onClick={() => onMove(i, 1)}
              disabled={i === screenshots.length - 1}
              title="Move right"
              style={{
                ...btnStyle, fontSize: 9, padding: "2px 5px",
                background: "rgba(0,0,0,0.88)", opacity: i === screenshots.length - 1 ? 0.25 : 1,
              }}
            >▶</button>
            <button
              onClick={() => onRemove(i)}
              title="Remove"
              style={{ ...btnStyle, fontSize: 9, padding: "2px 5px", background: "rgba(0,0,0,0.88)", border: `1px solid ${RED}40`, color: RED }}
            >✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── DropZone ─────────────────────────────────────────────────────────────────
function DropZone({
  deviceType,
  uploading,
  uploadProgress,
  onFilesSelected,
}: {
  deviceType: "mobile" | "desktop";
  uploading: boolean;
  uploadProgress: string;
  onFilesSelected: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const isMobile = deviceType === "mobile";
  const accent = isMobile ? MOBILE_ACCENT : DESKTOP_ACCENT;
  const accentBg = isMobile ? MOBILE_ACCENT_BG : DESKTOP_ACCENT_BG;

  return (
    <>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
          if (files.length) onFilesSelected(files);
        }}
        style={{
          border: `1.5px dashed ${dragOver ? accent : BORDER}`,
          borderRadius: 10, padding: "28px 20px", textAlign: "center",
          cursor: uploading ? "not-allowed" : "pointer",
          background: dragOver ? accentBg : "transparent",
          transition: "border-color 0.15s, background 0.15s",
          opacity: uploading ? 0.6 : 1,
        }}
      >
        {uploading ? (
          <div style={{ fontSize: 12, color: accent, letterSpacing: 0.5 }}>{uploadProgress}</div>
        ) : (
          <>
            <div style={{ fontSize: 22, marginBottom: 8, color: "#333" }}>↑</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#888", marginBottom: 4 }}>
              {dragOver
                ? `Drop to upload ${isMobile ? "mobile" : "desktop"} screenshots`
                : `Add ${isMobile ? "mobile" : "desktop"} screenshots`}
            </div>
            <div style={{ fontSize: 11, color: "#444" }}>
              Click or drag &amp; drop · Multiple allowed · Max 5 MB each
            </div>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) onFilesSelected(files);
          e.target.value = "";
        }}
        style={{ display: "none" }}
      />
    </>
  );
}

// ─── AutoDetectBanner ─────────────────────────────────────────────────────────
function AutoDetectBanner({ mobile, desktop }: { mobile: number; desktop: number }) {
  if (mobile === 0 && desktop === 0) return null;

  let message: string;
  if (mobile > 0 && desktop > 0) {
    message = "Both phone + browser mockups will be shown together";
  } else if (mobile > 0) {
    message = mobile === 1 ? "1 phone mockup" : `Phone mockup with ${mobile}-image carousel (◀▶)`;
  } else {
    message = desktop === 1 ? "1 browser mockup" : `Browser mockup with ${desktop}-image carousel (◀▶)`;
  }

  return (
    <div style={{
      marginTop: 14, padding: "9px 14px",
      background: "#0a0a0a", border: `1px solid #1a1a1a`,
      borderRadius: 8, display: "flex", alignItems: "center", gap: 8,
    }}>
      <div style={{ fontSize: 11, color: YELLOW, letterSpacing: 0.3, flexShrink: 0 }}>Auto-detect</div>
      <div style={{ width: 1, height: 10, background: "#222", flexShrink: 0 }} />
      <div style={{ fontSize: 11, color: "#555" }}>{message}</div>
    </div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────
function TabButton({
  label,
  icon,
  active,
  count,
  accent,
  accentBg,
  onClick,
}: {
  label: string;
  icon: string;
  active: boolean;
  count: number;
  accent: string;
  accentBg: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...btnStyle,
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        gap: 7, fontSize: 12, fontWeight: active ? 600 : 400,
        padding: "9px 16px",
        background: active ? accentBg : "transparent",
        border: `1px solid ${active ? accent + "40" : BORDER}`,
        color: active ? accent : "#555",
        borderRadius: 8,
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: 15 }}>{icon}</span>
      {label}
      {count > 0 && (
        <span style={{
          fontSize: 10, fontWeight: 600, minWidth: 18, height: 16,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          borderRadius: 99, background: accent + "20", color: accent,
          padding: "0 5px",
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Hint chips ───────────────────────────────────────────────────────────────
function HintChips({ deviceType }: { deviceType: "mobile" | "desktop" }) {
  const isMobile = deviceType === "mobile";
  const chips = [
    isMobile ? "Portrait · 9:19.5" : "Landscape · 4:3",
    "2+ images → carousel",
    "Auto-crop on upload",
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
      {chips.map(chip => (
        <div key={chip} style={{
          fontSize: 10, color: "#555", padding: "3px 9px", borderRadius: 6,
          background: "#0a0a0a", border: `1px solid #1a1a1a`,
        }}>
          {chip}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function ScreenshotsUpload({
  projectSlug,
  currentScreenshots,
  onUpdate,
}: {
  projectSlug: string;
  currentScreenshots: SplitScreenshots | string[];
  onUpdate: (data: SplitScreenshots) => void;
}) {
  const normaliseLegacy = (v: SplitScreenshots | string[]): SplitScreenshots => {
    if (Array.isArray(v)) return { mobile: v, desktop: [] };
    return { mobile: v.mobile ?? [], desktop: v.desktop ?? [] };
  };

  const [screenshots, setScreenshots] = useState<SplitScreenshots>(
    normaliseLegacy(currentScreenshots)
  );
  const [activeTab, setActiveTab] = useState<"mobile" | "desktop">("mobile");
  const [cropQueue, setCropQueue] = useState<{ file: File; deviceType: "mobile" | "desktop" }[]>([]);
  const [cropQueueTotal, setCropQueueTotal] = useState(0);
  const [uploading, setUploading] = useState<{ mobile: boolean; desktop: boolean }>({ mobile: false, desktop: false });
  const [uploadProgress, setUploadProgress] = useState<{ mobile: string; desktop: string }>({ mobile: "", desktop: "" });
  const [error, setError] = useState("");

  const update = (next: SplitScreenshots) => {
    setScreenshots(next);
    onUpdate(next);
  };

  const handleFilesSelected = (files: File[], deviceType: "mobile" | "desktop") => {
    const imageFiles = files.filter(f => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024);
    const oversized = files.filter(f => f.size > 5 * 1024 * 1024);
    if (oversized.length) setError(`${oversized.length} file(s) exceed 5 MB and were skipped.`);
    else setError("");
    if (!imageFiles.length) return;
    setCropQueueTotal(imageFiles.length);
    setCropQueue(imageFiles.map(file => ({ file, deviceType })));
  };

  const handleCropConfirm = async (blob: Blob) => {
    if (!cropQueue.length) return;

    // FIX: capture deviceType before mutating queue
    const { deviceType } = cropQueue[0];

    // FIX: advance queue immediately so next modal opens right away
    setCropQueue(q => q.slice(1));

    if (!supabase) return;

    setUploading(u => ({ ...u, [deviceType]: true }));
    setUploadProgress(p => ({ ...p, [deviceType]: "Uploading…" }));
    setError("");

    const path = `projects/${projectSlug}-${deviceType}-${Date.now()}.webp`;
    const { error: uploadError } = await supabase.storage
      .from("portfolio-images")
      .upload(path, blob, { upsert: true, contentType: "image/webp" });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(u => ({ ...u, [deviceType]: false }));
      setUploadProgress(p => ({ ...p, [deviceType]: "" }));
      return;
    }

    const { data } = supabase.storage.from("portfolio-images").getPublicUrl(path);

    // FIX: functional update to avoid stale closure across multiple queued uploads
    setScreenshots(prev => {
      const next: SplitScreenshots = {
        ...prev,
        [deviceType]: [...prev[deviceType], data.publicUrl],
      };
      onUpdate(next);
      return next;
    });

    setUploading(u => ({ ...u, [deviceType]: false }));
    setUploadProgress(p => ({ ...p, [deviceType]: "" }));
  };

  const handleCropCancel = () => setCropQueue(q => q.slice(1));

  const handleRemove = (deviceType: "mobile" | "desktop", idx: number) => {
    update({ ...screenshots, [deviceType]: screenshots[deviceType].filter((_, i) => i !== idx) });
  };

  const handleMove = (deviceType: "mobile" | "desktop", idx: number, dir: -1 | 1) => {
    const arr = [...screenshots[deviceType]];
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    update({ ...screenshots, [deviceType]: arr });
  };

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Section label */}
      <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 14 }}>
        SCREENSHOTS
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        <TabButton
          label="Mobile"
          icon="📱"
          active={activeTab === "mobile"}
          count={screenshots.mobile.length}
          accent={MOBILE_ACCENT}
          accentBg={MOBILE_ACCENT_BG}
          onClick={() => setActiveTab("mobile")}
        />
        <TabButton
          label="Desktop"
          icon="🖥"
          active={activeTab === "desktop"}
          count={screenshots.desktop.length}
          accent={DESKTOP_ACCENT}
          accentBg={DESKTOP_ACCENT_BG}
          onClick={() => setActiveTab("desktop")}
        />
      </div>

      {/* Active panel */}
      {activeTab === "mobile" ? (
        <div>
          <HintChips deviceType="mobile" />
          <ThumbnailGrid
            deviceType="mobile"
            screenshots={screenshots.mobile}
            onRemove={(idx) => handleRemove("mobile", idx)}
            onMove={(idx, dir) => handleMove("mobile", idx, dir)}
          />
          <DropZone
            deviceType="mobile"
            uploading={uploading.mobile}
            uploadProgress={uploadProgress.mobile}
            onFilesSelected={(files) => handleFilesSelected(files, "mobile")}
          />
        </div>
      ) : (
        <div>
          <HintChips deviceType="desktop" />
          <ThumbnailGrid
            deviceType="desktop"
            screenshots={screenshots.desktop}
            onRemove={(idx) => handleRemove("desktop", idx)}
            onMove={(idx, dir) => handleMove("desktop", idx, dir)}
          />
          <DropZone
            deviceType="desktop"
            uploading={uploading.desktop}
            uploadProgress={uploadProgress.desktop}
            onFilesSelected={(files) => handleFilesSelected(files, "desktop")}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ fontSize: 11, color: RED, marginTop: 10 }}>{error}</div>
      )}

      {/* Auto-detect banner */}
      <AutoDetectBanner mobile={screenshots.mobile.length} desktop={screenshots.desktop.length} />

      {/* Crop modal */}
      {cropQueue.length > 0 && (
        <CropModal
          key={cropQueue[0].file.name + cropQueue[0].file.lastModified + cropQueue.length}
          file={cropQueue[0].file}
          deviceType={cropQueue[0].deviceType}
          queueIndex={cropQueueTotal - cropQueue.length}
          queueTotal={cropQueueTotal}
          onConfirm={handleCropConfirm}
          onSkip={handleCropCancel}
          onCancel={() => setCropQueue([])}
        />
      )}
    </div>
  );
}