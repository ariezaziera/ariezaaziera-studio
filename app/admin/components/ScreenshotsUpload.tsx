"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { YELLOW, BORDER, RED, btnStyle } from "../layout";

export function ScreenshotsUpload({
  projectSlug,
  currentScreenshots,
  onUpdate,
}: {
  projectSlug: string;
  currentScreenshots: string[];
  onUpdate: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [screenshots, setScreenshots] = useState<string[]>(currentScreenshots || []);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const uploadFiles = async (files: File[]) => {
    if (!supabase) return;
    setUploading(true);
    setError("");
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`UPLOADING ${i + 1}/${files.length}...`);
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) { setError(`${file.name} exceeds 5MB`); continue; }
      const ext = file.name.split(".").pop();
      const path = `projects/${projectSlug}-shot-${Date.now()}-${i}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("portfolio-images")
        .upload(path, file, { upsert: true });
      if (uploadError) { setError(uploadError.message); continue; }
      const { data } = supabase.storage.from("portfolio-images").getPublicUrl(path);
      newUrls.push(data.publicUrl);
    }

    const updated = [...screenshots, ...newUrls];
    setScreenshots(updated);
    onUpdate(updated);
    setUploading(false);
    setUploadProgress("");
  };

  const removeScreenshot = (idx: number) => {
    const updated = screenshots.filter((_, i) => i !== idx);
    setScreenshots(updated);
    onUpdate(updated);
  };

  const moveScreenshot = (idx: number, dir: -1 | 1) => {
    const updated = [...screenshots];
    const swap = idx + dir;
    if (swap < 0 || swap >= updated.length) return;
    [updated[idx], updated[swap]] = [updated[swap], updated[idx]];
    setScreenshots(updated);
    onUpdate(updated);
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 9, color: "#555", letterSpacing: 2 }}>SCREENSHOTS ({screenshots.length})</div>
        <div style={{ fontSize: 9, color: "#444" }}>FIRST IMAGE = HERO MOCKUP</div>
      </div>

      {screenshots.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: 8, marginBottom: 10 }}>
          {screenshots.map((url, i) => (
            <div key={url + i} style={{ position: "relative", borderRadius: 6, overflow: "hidden", border: `1px solid ${BORDER}`, aspectRatio: "16/9" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Screenshot ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
              {i === 0 && (
                <div style={{ position: "absolute", bottom: 4, left: 4, fontSize: 8, color: YELLOW, background: "rgba(0,0,0,0.9)", border: `1px solid ${YELLOW}40`, padding: "2px 6px", borderRadius: 3, letterSpacing: 1 }}>
                  HERO
                </div>
              )}
              <div style={{ position: "absolute", top: 4, right: 4, display: "flex", gap: 3 }}>
                <button onClick={() => moveScreenshot(i, -1)} disabled={i === 0} style={{ ...btnStyle, fontSize: 9, padding: "2px 6px", background: "rgba(0,0,0,0.85)", opacity: i === 0 ? 0.3 : 1 }}>◀</button>
                <button onClick={() => moveScreenshot(i, 1)} disabled={i === screenshots.length - 1} style={{ ...btnStyle, fontSize: 9, padding: "2px 6px", background: "rgba(0,0,0,0.85)", opacity: i === screenshots.length - 1 ? 0.3 : 1 }}>▶</button>
                <button onClick={() => removeScreenshot(i)} style={{ ...btnStyle, fontSize: 9, padding: "2px 6px", background: "rgba(0,0,0,0.85)", border: `1px solid ${RED}`, color: RED }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragOver(false);
          const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
          if (files.length) uploadFiles(files);
        }}
        style={{
          border: `1px dashed ${dragOver ? YELLOW : BORDER}`,
          borderRadius: 8, padding: "20px 16px", textAlign: "center",
          cursor: uploading ? "not-allowed" : "pointer",
          background: dragOver ? YELLOW + "08" : "transparent",
          transition: "all 0.2s",
          opacity: uploading ? 0.6 : 1,
        }}
      >
        {uploading ? (
          <div style={{ fontSize: 11, color: YELLOW, letterSpacing: 1 }}>{uploadProgress}</div>
        ) : (
          <>
            <div style={{ fontSize: 18, marginBottom: 6, color: "#444" }}>↑</div>
            <div style={{ fontSize: 11, color: "#666", letterSpacing: 1 }}>ADD SCREENSHOTS</div>
            <div style={{ fontSize: 10, color: "#333", marginTop: 3 }}>Multiple files supported · Drag & drop · Max 5MB each</div>
          </>
        )}
      </div>

      {error && <div style={{ fontSize: 10, color: RED, marginTop: 6 }}>{error}</div>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => { const files = Array.from(e.target.files || []); if (files.length) uploadFiles(files); e.target.value = ""; }}
        style={{ display: "none" }}
      />
    </div>
  );
}
