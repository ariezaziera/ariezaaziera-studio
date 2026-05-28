"use client";

import { useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { YELLOW, BORDER, GREEN, RED, btnStyle } from "../layout";

// ─── Crop aspect ratios per device ───────────────────────────────────────────
const CROP_RATIOS = {
  mobile: 271 / 441,   // matches PHONE_RATIO in CaseStudyPage
  desktop: 1.3256,     // matches DESKTOP_RATIO in CaseStudyPage
};

// ─── Types ────────────────────────────────────────────────────────────────────
export type { SplitScreenshots } from "@/types/split-screenshots";

// ─── CropModal ────────────────────────────────────────────────────────────────
function CropModal({
  file,
  deviceType,
  onConfirm,
  onCancel,
}: {
  file: File;
  deviceType: "mobile" | "desktop";
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  const PREVIEW_W = 480;
  const targetRatio = CROP_RATIOS[deviceType];

  const initCrop = useCallback((natW: number, natH: number) => {
    const imgRatio = natW / natH;
    let cw: number, ch: number;
    if (imgRatio > targetRatio) {
      // image wider than target: constrain by height
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
  }, [targetRatio]);

  const scale = imgNaturalW > 0 ? PREVIEW_W / imgNaturalW : 1;
  const previewH = Math.round(imgNaturalH * scale);

  const clampCrop = (x: number, y: number) => ({
    x: Math.max(0, Math.min(imgNaturalW - cropW, x)),
    y: Math.max(0, Math.min(imgNaturalH - cropH, y)),
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOrigin({ x: cropX, y: cropY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const dx = (e.clientX - dragStart.x) / scale;
    const dy = (e.clientY - dragStart.y) / scale;
    const { x, y } = clampCrop(
      Math.round(dragOrigin.x + dx),
      Math.round(dragOrigin.y + dy)
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
    canvas.toBlob((blob) => {
      if (blob) onConfirm(blob);
    }, "image/webp", 0.92);
  };

  const deviceLabel = deviceType === "mobile" ? "MOBILE (portrait)" : "DESKTOP (landscape)";
  const cropPreviewX = Math.round(cropX * scale);
  const cropPreviewY = Math.round(cropY * scale);
  const cropPreviewW = Math.round(cropW * scale);
  const cropPreviewH = Math.round(cropH * scale);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.96)",
      zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        background: "#0f0f0f", border: `1px solid #1a1a1a`,
        borderRadius: 12, padding: 28, maxWidth: 560, width: "100%",
      }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: -0.5, marginBottom: 4 }}>
            Crop Image
          </div>
          <div style={{ fontSize: 10, color: "#555", letterSpacing: 1 }}>
            {deviceLabel} — drag the highlighted area to reposition
          </div>
        </div>

        {/* Crop canvas */}
        <div
          style={{
            position: "relative", width: PREVIEW_W, height: previewH || 270,
            overflow: "hidden", borderRadius: 8, border: `1px solid #1a1a1a`,
            cursor: "grab", userSelect: "none", margin: "0 auto 16px",
            background: "#080808",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
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
              width: PREVIEW_W, height: previewH || "auto",
              display: "block", pointerEvents: "none",
              filter: "brightness(0.35)",
            }}
          />
          {/* Crop highlight box */}
          {cropW > 0 && (
            <div style={{
              position: "absolute",
              left: cropPreviewX, top: cropPreviewY,
              width: cropPreviewW, height: cropPreviewH,
              border: `2px solid ${YELLOW}`,
              boxShadow: `0 0 0 9999px rgba(0,0,0,0.55)`,
              pointerEvents: "none",
            }}>
              {/* Rule-of-thirds grid */}
              {[1, 2].map(n => (
                <div key={`h${n}`} style={{
                  position: "absolute", left: 0, right: 0,
                  top: `${(n / 3) * 100}%`, height: 1,
                  background: `${YELLOW}30`,
                }} />
              ))}
              {[1, 2].map(n => (
                <div key={`v${n}`} style={{
                  position: "absolute", top: 0, bottom: 0,
                  left: `${(n / 3) * 100}%`, width: 1,
                  background: `${YELLOW}30`,
                }} />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ fontSize: 10, color: "#444", letterSpacing: 1, textAlign: "center", marginBottom: 20 }}>
          CROP SIZE: {cropW} × {cropH}px · RATIO {deviceType === "mobile" ? "9:16 (portrait)" : "4:3 (landscape)"}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleConfirm}
            style={{ ...btnStyle, flex: 1, background: YELLOW, color: "#000", border: `1px solid ${YELLOW}`, fontSize: 11 }}
          >
            CONFIRM CROP ↑
          </button>
          <button
            onClick={() => { URL.revokeObjectURL(imgSrc); onCancel(); }}
            style={{ ...btnStyle, fontSize: 11 }}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── UploadZone ───────────────────────────────────────────────────────────────
function UploadZone({
  deviceType,
  screenshots,
  uploading,
  uploadProgress,
  onFilesSelected,
  onRemove,
  onMove,
}: {
  deviceType: "mobile" | "desktop";
  screenshots: string[];
  uploading: boolean;
  uploadProgress: string;
  onFilesSelected: (files: File[]) => void;
  onRemove: (idx: number) => void;
  onMove: (idx: number, dir: -1 | 1) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const isMobile = deviceType === "mobile";
  const label = isMobile ? "MOBILE SCREENSHOTS" : "DESKTOP SCREENSHOTS";
  const hint = isMobile ? "Portrait · 9:16 ratio" : "Landscape · 4:3 ratio";
  const aspectRatio = isMobile ? "9/16" : "16/9";
  const accentColor = isMobile ? "#C084FC" : "#60A5FA"; // purple for mobile, blue for desktop

  return (
    <div style={{ flex: 1 }}>
      {/* Zone header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{
          fontSize: 9, color: accentColor, letterSpacing: 2,
          background: `${accentColor}12`, border: `1px solid ${accentColor}30`,
          padding: "3px 8px", borderRadius: 3,
        }}>
          {isMobile ? "📱" : "🖥"} {label}
        </div>
        <div style={{ fontSize: 9, color: "#444" }}>{hint}</div>
        {screenshots.length > 0 && (
          <div style={{ marginLeft: "auto", fontSize: 9, color: accentColor, background: `${accentColor}12`, border: `1px solid ${accentColor}30`, padding: "2px 8px", borderRadius: 3 }}>
            {screenshots.length} FILE{screenshots.length > 1 ? "S" : ""}
          </div>
        )}
      </div>

      {/* Thumbnail grid */}
      {screenshots.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "repeat(auto-fill, minmax(70px, 1fr))"
            : "repeat(auto-fill, minmax(130px, 1fr))",
          gap: 6, marginBottom: 8,
        }}>
          {screenshots.map((url, i) => (
            <div key={url + i} style={{
              position: "relative", borderRadius: 5, overflow: "hidden",
              border: `1px solid ${i === 0 ? accentColor + "60" : BORDER}`,
              aspectRatio,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url} alt={`${deviceType} ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
              />
              {i === 0 && (
                <div style={{
                  position: "absolute", bottom: 3, left: 3,
                  fontSize: 7, color: accentColor, background: "rgba(0,0,0,0.9)",
                  border: `1px solid ${accentColor}40`, padding: "1px 5px", borderRadius: 2, letterSpacing: 1,
                }}>
                  HERO
                </div>
              )}
              <div style={{ position: "absolute", top: 3, right: 3, display: "flex", gap: 2 }}>
                <button
                  onClick={() => onMove(i, -1)} disabled={i === 0}
                  style={{ ...btnStyle, fontSize: 8, padding: "1px 4px", background: "rgba(0,0,0,0.85)", opacity: i === 0 ? 0.3 : 1 }}
                >◀</button>
                <button
                  onClick={() => onMove(i, 1)} disabled={i === screenshots.length - 1}
                  style={{ ...btnStyle, fontSize: 8, padding: "1px 4px", background: "rgba(0,0,0,0.85)", opacity: i === screenshots.length - 1 ? 0.3 : 1 }}
                >▶</button>
                <button
                  onClick={() => onRemove(i)}
                  style={{ ...btnStyle, fontSize: 8, padding: "1px 4px", background: "rgba(0,0,0,0.85)", border: `1px solid ${RED}`, color: RED }}
                >✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragOver(false);
          const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
          if (files.length) onFilesSelected(files);
        }}
        style={{
          border: `1px dashed ${dragOver ? accentColor : BORDER}`,
          borderRadius: 7, padding: "16px 12px", textAlign: "center",
          cursor: uploading ? "not-allowed" : "pointer",
          background: dragOver ? `${accentColor}08` : "transparent",
          transition: "all 0.2s", opacity: uploading ? 0.6 : 1,
        }}
      >
        {uploading ? (
          <div style={{ fontSize: 10, color: accentColor, letterSpacing: 1 }}>{uploadProgress}</div>
        ) : (
          <>
            <div style={{ fontSize: 16, marginBottom: 4, color: "#333" }}>↑</div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 1 }}>
              ADD {isMobile ? "MOBILE" : "DESKTOP"}
            </div>
            <div style={{ fontSize: 9, color: "#333", marginTop: 2 }}>
              Click or drag · Multiple · Max 5MB each
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
  // Normalise legacy flat array → split format
  const normaliseLegacy = (v: SplitScreenshots | string[]): SplitScreenshots => {
    if (Array.isArray(v)) return { mobile: v, desktop: [] };
    return { mobile: v.mobile ?? [], desktop: v.desktop ?? [] };
  };

  const [screenshots, setScreenshots] = useState<SplitScreenshots>(
    normaliseLegacy(currentScreenshots)
  );

  // Crop queue: files waiting to be cropped before upload
  const [cropQueue, setCropQueue] = useState<{ file: File; deviceType: "mobile" | "desktop" }[]>([]);

  // Upload state per device
  const [uploading, setUploading] = useState<{ mobile: boolean; desktop: boolean }>({ mobile: false, desktop: false });
  const [uploadProgress, setUploadProgress] = useState<{ mobile: string; desktop: string }>({ mobile: "", desktop: "" });
  const [error, setError] = useState("");

  const update = (next: SplitScreenshots) => {
    setScreenshots(next);
    onUpdate(next);
  };

  // Called when user selects files for a zone — queue them for cropping
  const handleFilesSelected = (files: File[], deviceType: "mobile" | "desktop") => {
    const imageFiles = files.filter(f => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024);
    const oversized = files.filter(f => f.size > 5 * 1024 * 1024);
    if (oversized.length) setError(`${oversized.length} file(s) exceed 5MB and were skipped.`);
    if (!imageFiles.length) return;
    setCropQueue(imageFiles.map(file => ({ file, deviceType })));
  };

  // Called when user confirms crop for current head of queue
  const handleCropConfirm = async (blob: Blob) => {
    if (!cropQueue.length) return;
    const { deviceType } = cropQueue[0];
    setCropQueue(q => q.slice(1)); // advance queue

    if (!supabase) return;
    setUploading(u => ({ ...u, [deviceType]: true }));
    setUploadProgress(p => ({ ...p, [deviceType]: "UPLOADING..." }));
    setError("");

    const ext = "webp";
    const path = `projects/${projectSlug}-${deviceType}-${Date.now()}.${ext}`;
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
    const next: SplitScreenshots = {
      ...screenshots,
      [deviceType]: [...screenshots[deviceType], data.publicUrl],
    };
    update(next);
    setUploading(u => ({ ...u, [deviceType]: false }));
    setUploadProgress(p => ({ ...p, [deviceType]: "" }));
  };

  const handleCropCancel = () => setCropQueue(q => q.slice(1));

  const handleRemove = (deviceType: "mobile" | "desktop", idx: number) => {
    const next: SplitScreenshots = {
      ...screenshots,
      [deviceType]: screenshots[deviceType].filter((_, i) => i !== idx),
    };
    update(next);
  };

  const handleMove = (deviceType: "mobile" | "desktop", idx: number, dir: -1 | 1) => {
    const arr = [...screenshots[deviceType]];
    const swap = idx + dir;
    if (swap < 0 || swap >= arr.length) return;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    update({ ...screenshots, [deviceType]: arr });
  };

  // What will be displayed in the mockup preview
  const totalMobile = screenshots.mobile.length;
  const totalDesktop = screenshots.desktop.length;
  const hasBoth = totalMobile > 0 && totalDesktop > 0;

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: "#555", letterSpacing: 2 }}>
          SCREENSHOTS — MOBILE & DESKTOP
        </div>
        {(totalMobile > 0 || totalDesktop > 0) && (
          <div style={{ fontSize: 9, color: "#444" }}>
            AUTO-DETECT: {
              hasBoth ? "BOTH MOCKUPS"
                : totalMobile > 0 ? "MOBILE ONLY"
                  : "DESKTOP ONLY"
            }
          </div>
        )}
      </div>

      {/* Smart display hint */}
      <div style={{
        background: "#0a0a0a", border: `1px solid #1a1a1a`,
        borderRadius: 8, padding: "10px 14px", marginBottom: 14,
        display: "flex", gap: 16, flexWrap: "wrap",
      }}>
        {[
          { label: "1 mobile", hint: "1 phone mockup" },
          { label: "2+ mobile", hint: "1 phone + arrows ◀▶" },
          { label: "1 desktop", hint: "1 browser mockup" },
          { label: "2+ desktop", hint: "1 browser + arrows ◀▶" },
          { label: "both", hint: "desktop + mobile shown together" },
        ].map(({ label, hint }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 9, color: YELLOW, letterSpacing: 1 }}>{label.toUpperCase()}</span>
            <span style={{ fontSize: 9, color: "#333" }}>→</span>
            <span style={{ fontSize: 9, color: "#555" }}>{hint}</span>
          </div>
        ))}
      </div>

      {/* Two upload zones side by side */}
      <div style={{ display: "flex", gap: 12 }}>
        <UploadZone
          deviceType="mobile"
          screenshots={screenshots.mobile}
          uploading={uploading.mobile}
          uploadProgress={uploadProgress.mobile}
          onFilesSelected={(files) => handleFilesSelected(files, "mobile")}
          onRemove={(idx) => handleRemove("mobile", idx)}
          onMove={(idx, dir) => handleMove("mobile", idx, dir)}
        />
        <div style={{ width: 1, background: BORDER, flexShrink: 0 }} />
        <UploadZone
          deviceType="desktop"
          screenshots={screenshots.desktop}
          uploading={uploading.desktop}
          uploadProgress={uploadProgress.desktop}
          onFilesSelected={(files) => handleFilesSelected(files, "desktop")}
          onRemove={(idx) => handleRemove("desktop", idx)}
          onMove={(idx, dir) => handleMove("desktop", idx, dir)}
        />
      </div>

      {error && <div style={{ fontSize: 10, color: RED, marginTop: 8 }}>{error}</div>}

      {/* Crop modal — processes one file at a time from the queue */}
      {cropQueue.length > 0 && (
        <CropModal
          file={cropQueue[0].file}
          deviceType={cropQueue[0].deviceType}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      {/* Queue progress indicator */}
      {cropQueue.length > 1 && (
        <div style={{ fontSize: 9, color: "#555", marginTop: 6, letterSpacing: 1, textAlign: "center" }}>
          {cropQueue.length - 1} MORE IMAGE{cropQueue.length > 2 ? "S" : ""} TO CROP AFTER THIS
        </div>
      )}
    </div>
  );
}
