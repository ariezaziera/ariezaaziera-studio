"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { YELLOW, BORDER, GREEN, RED, btnStyle } from "../layout";

export function ProfilePhotoUpload({
  currentUrl,
  onUploaded,
}: {
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

  const handleConfirm = async () => {
    if (!pendingFile || !supabase) return;
    setUploading(true);
    setError("");
    const ext = pendingFile.name.split(".").pop();
    const path = `profile/photo-${Date.now()}.${ext}`;
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
  };

  const shownImage = localPreview || confirmedUrl;
  const isPending = !!localPreview && !!pendingFile;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 8 }}>PROFILE PHOTO</div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div
          onClick={() => !shownImage && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) selectFile(f); }}
          style={{
            width: 96, height: 96, borderRadius: "50%", flexShrink: 0,
            border: `2px ${shownImage ? "solid" : "dashed"} ${isPending ? YELLOW : dragOver ? YELLOW : shownImage ? BORDER : "#333"}`,
            overflow: "hidden", cursor: shownImage ? "default" : "pointer",
            background: "#0a0a0a", position: "relative",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {shownImage
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={shownImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover", filter: isPending ? "brightness(0.6)" : "none" }} />
            : <div style={{ fontSize: 28, color: "#333" }}>+</div>
          }
        </div>

        <div style={{ flex: 1 }}>
          {isPending ? (
            <div>
              <div style={{ fontSize: 10, color: YELLOW, letterSpacing: 1, marginBottom: 8 }}>● PREVIEW — NOT UPLOADED</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleConfirm}
                  disabled={uploading}
                  style={{ ...btnStyle, fontSize: 9, padding: "5px 12px", background: uploading ? "transparent" : YELLOW, color: uploading ? "#888" : "#000", border: `1px solid ${YELLOW}` }}
                >
                  {uploading ? "UPLOADING..." : "CONFIRM ↑"}
                </button>
                <button
                  onClick={() => { if (localPreview) URL.revokeObjectURL(localPreview); setLocalPreview(""); setPendingFile(null); }}
                  style={{ ...btnStyle, fontSize: 9, padding: "5px 10px" }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          ) : confirmedUrl ? (
            <div>
              <div style={{ fontSize: 10, color: GREEN, letterSpacing: 1, marginBottom: 8 }}>✓ UPLOADED</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => inputRef.current?.click()} style={{ ...btnStyle, fontSize: 9, padding: "5px 10px" }}>REPLACE</button>
                <button
                  onClick={() => { setConfirmedUrl(""); onUploaded(""); }}
                  style={{ ...btnStyle, fontSize: 9, padding: "5px 10px", border: `1px solid ${RED}`, color: RED }}
                >
                  REMOVE
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>Click circle or drag photo here</div>
              <button onClick={() => inputRef.current?.click()} style={{ ...btnStyle, fontSize: 9, padding: "5px 12px" }}>BROWSE FILE</button>
            </div>
          )}
          {error && <div style={{ fontSize: 10, color: RED, marginTop: 6 }}>{error}</div>}
        </div>
      </div>

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
