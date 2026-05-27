"use client";

import { useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { YELLOW, BORDER, GREEN, RED, btnStyle } from "../layout";

export function ImageUpload({
  label = "PROJECT IMAGE",
  storagePath,
  currentUrl,
  onUploaded,
}: {
  label?: string;
  storagePath: string;
  currentUrl?: string;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState<string>("");
  const [confirmedUrl, setConfirmedUrl] = useState<string>(currentUrl || "");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const selectFile = (file: File) => {
    setError("");
    if (!file.type.startsWith("image/")) { setError("Only image files allowed."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Max file size is 5MB."); return; }
    setLocalPreview(URL.createObjectURL(file));
    setPendingFile(file);
  };

  const handleConfirmUpload = useCallback(async () => {
    if (!pendingFile || !supabase) return;
    setUploading(true);
    setError("");
    const ext = pendingFile.name.split(".").pop();
    const path = `${storagePath}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("portfolio-images")
      .upload(path, pendingFile, { upsert: true });
    if (uploadError) { setError(uploadError.message); setUploading(false); return; }
    const { data } = supabase.storage.from("portfolio-images").getPublicUrl(path);
    setConfirmedUrl(data.publicUrl);
    setLocalPreview("");
    setPendingFile(null);
    onUploaded(data.publicUrl);
    setUploading(false);
  }, [pendingFile, storagePath, onUploaded]);

  const shownImage = localPreview || confirmedUrl;
  const isPending = !!localPreview && !!pendingFile;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 8 }}>{label}</div>

      {shownImage ? (
        <div style={{ border: `1px solid ${isPending ? YELLOW + "60" : BORDER}`, borderRadius: 8, overflow: "hidden", position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shownImage}
            alt="Preview"
            style={{ width: "100%", height: 180, objectFit: "cover", display: "block", filter: isPending ? "brightness(0.7)" : "none", transition: "filter 0.2s" }}
          />
          {isPending && (
            <div style={{ position: "absolute", top: 10, left: 10, fontSize: 9, letterSpacing: 1, color: YELLOW, background: "rgba(0,0,0,0.85)", border: `1px solid ${YELLOW}60`, padding: "4px 10px", borderRadius: 4 }}>
              ● PREVIEW — NOT UPLOADED
            </div>
          )}
          {!isPending && confirmedUrl && (
            <div style={{ position: "absolute", top: 10, left: 10, fontSize: 9, letterSpacing: 1, color: GREEN, background: "rgba(0,0,0,0.85)", border: `1px solid ${GREEN}60`, padding: "4px 10px", borderRadius: 4 }}>
              ✓ UPLOADED
            </div>
          )}
          <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
            {isPending ? (
              <>
                <button
                  onClick={handleConfirmUpload}
                  disabled={uploading}
                  style={{ ...btnStyle, fontSize: 9, padding: "5px 12px", background: uploading ? "rgba(0,0,0,0.8)" : YELLOW, color: uploading ? "#888" : "#000", border: `1px solid ${YELLOW}` }}
                >
                  {uploading ? "UPLOADING..." : "CONFIRM ↑"}
                </button>
                <button
                  onClick={() => { if (localPreview) URL.revokeObjectURL(localPreview); setLocalPreview(""); setPendingFile(null); }}
                  style={{ ...btnStyle, fontSize: 9, padding: "5px 10px", background: "rgba(0,0,0,0.8)" }}
                >
                  CANCEL
                </button>
              </>
            ) : (
              <>
                <button onClick={() => inputRef.current?.click()} style={{ ...btnStyle, fontSize: 9, padding: "5px 10px", background: "rgba(0,0,0,0.8)" }}>REPLACE</button>
                <button
                  onClick={() => { setConfirmedUrl(""); onUploaded(""); }}
                  style={{ ...btnStyle, fontSize: 9, padding: "5px 10px", background: "rgba(0,0,0,0.8)", border: `1px solid ${RED}`, color: RED }}
                >
                  REMOVE
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) selectFile(f); }}
          style={{ border: `1px dashed ${dragOver ? YELLOW : BORDER}`, borderRadius: 8, padding: "32px 24px", textAlign: "center", cursor: "pointer", background: dragOver ? YELLOW + "08" : "transparent", transition: "all 0.2s" }}
        >
          <div style={{ fontSize: 22, marginBottom: 8, color: "#444" }}>↑</div>
          <div style={{ fontSize: 11, color: "#666", letterSpacing: 1 }}>CLICK OR DRAG IMAGE HERE</div>
          <div style={{ fontSize: 10, color: "#333", marginTop: 4 }}>PNG, JPG, WEBP — MAX 5MB</div>
        </div>
      )}

      {error && <div style={{ fontSize: 10, color: RED, marginTop: 6 }}>{error}</div>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) selectFile(f); e.target.value = ""; }}
        style={{ display: "none" }}
      />
    </div>
  );
}
