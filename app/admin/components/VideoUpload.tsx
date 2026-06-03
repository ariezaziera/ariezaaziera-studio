"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { YELLOW, BORDER, RED } from "../layout";

interface VideoUploadProps {
  label: string;
  storagePath: string;
  currentUrl?: string;
  onUploaded: (url: string) => void;
}

export function VideoUpload({ label, storagePath, currentUrl, onUploaded }: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(currentUrl || "");

  const handleFile = async (file: File) => {
    if (!supabase) return;

    if (!file.type.startsWith("video/")) {
      setError("Please upload a video file (MP4 recommended).");
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      setError("File too large. Max 30MB.");
      return;
    }

    setUploading(true);
    setError("");

    const ext = file.name.split(".").pop() || "mp4";
    const path = `${storagePath}/preview.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("project-assets")
      .upload(path, file, { upsert: true });

    if (upErr) {
      setError(upErr.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("project-assets")
      .getPublicUrl(path);

    const url = data.publicUrl;
    setPreviewUrl(url);
    onUploaded(url);
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreviewUrl("");
    onUploaded("");
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 8 }}>
        {label}
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `1px dashed ${previewUrl ? YELLOW + "44" : BORDER}`,
          borderRadius: 8,
          padding: "20px",
          textAlign: "center",
          cursor: "pointer",
          background: previewUrl ? YELLOW + "06" : "#0a0a0a",
          transition: "all 0.2s",
        }}
      >
        {uploading ? (
          <div style={{ fontSize: 11, color: YELLOW, letterSpacing: 1 }}>UPLOADING...</div>
        ) : previewUrl ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <video
              src={previewUrl}
              muted
              loop
              autoPlay
              playsInline
              style={{
                width: "100%", maxHeight: 120,
                objectFit: "cover", borderRadius: 6,
                border: `1px solid ${YELLOW}33`,
              }}
            />
            <div style={{ fontSize: 9, color: "#555", letterSpacing: 1 }}>Click to replace</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 22, opacity: 0.3 }}>▶</div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 1 }}>
              Drop MP4 here or click to upload
            </div>
            <div style={{ fontSize: 9, color: "#333", letterSpacing: 0.5 }}>
              Max 30MB · MP4 recommended · Keep under 10 seconds
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {previewUrl && (
        <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
          <div style={{
            flex: 1, fontSize: 9, color: "#444",
            fontFamily: "'DM Mono', monospace",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {previewUrl}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleRemove(); }}
            style={{
              fontSize: 9, color: RED, background: "none",
              border: `1px solid ${RED}33`, borderRadius: 4,
              padding: "3px 8px", cursor: "pointer", letterSpacing: 1,
              flexShrink: 0,
            }}
          >
            REMOVE
          </button>
        </div>
      )}

      {error && (
        <div style={{ fontSize: 10, color: RED, marginTop: 6 }}>{error}</div>
      )}
    </div>
  );
}
