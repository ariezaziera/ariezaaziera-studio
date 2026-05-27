"use client";

import { useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/data";
import { YELLOW, BORDER, CARD, RED, btnStyle } from "../layout";
import { Field } from "./Field";
import { ProfilePhotoUpload } from "./ProfilePhotoUpload";

export function ProfileEditor({
  profile,
  onClose,
}: {
  profile: Profile;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    ...profile,
    about: profile.about.join("\n\n"),
    skills: profile.skills.join(", "),
    photo_url: (profile as Profile & { photo_url?: string }).photo_url || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const originalPhoto = useMemo(() => (profile as Profile & { photo_url?: string }).photo_url || "", [profile]);

  const hasUnsavedMedia = form.photo_url !== originalPhoto;

  const set = (key: string) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const handleSave = async () => {
    if (!supabase) return;
    setSaving(true);
    setError("");
    const { error } = await supabase
      .from("profile")
      .update({
        name: form.name,
        title: form.title,
        tagline: form.tagline,
        about: form.about.split("\n\n").map((s) => s.trim()).filter(Boolean),
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        email: form.email,
        github: form.github,
        linkedin: form.linkedin,
        photo_url: form.photo_url || null,
      })
      .eq("id", 1);
    setSaving(false);
    if (error) setError(error.message);
    else { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, overflowY: "auto", padding: "40px 24px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 32 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>Profile</div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginTop: 4 }}>EDITING PROFILE</div>
          </div>
          <button onClick={onClose} style={{ ...btnStyle, padding: "6px 14px", fontSize: 10 }}>✕ CLOSE</button>
        </div>

        {/* Unsaved photo warning */}
        {hasUnsavedMedia && (
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            background: "#F5C54210",
            border: `1px solid ${YELLOW}40`,
            borderRadius: 8,
            padding: "12px 14px",
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 14, lineHeight: 1, marginTop: 1 }}>⚠</div>
            <div>
              <div style={{ fontSize: 10, color: YELLOW, letterSpacing: 1, fontWeight: 700, marginBottom: 3 }}>
                UNSAVED PHOTO CHANGES
              </div>
              <div style={{ fontSize: 10, color: "#888", lineHeight: 1.6 }}>
                Profile photo changes won't take effect until you hit <span style={{ color: "#fff" }}>SAVE CHANGES</span> below. Closing without saving will discard them.
              </div>
            </div>
          </div>
        )}

        <ProfilePhotoUpload
          currentUrl={form.photo_url}
          onUploaded={(url) => setForm((f) => ({ ...f, photo_url: url }))}
        />
        <Field label="NAME" value={form.name} onChange={set("name")} />
        <Field label="TITLE" value={form.title} onChange={set("title")} />
        <Field label="TAGLINE" value={form.tagline} onChange={set("tagline")} />
        <Field label="ABOUT (separate paragraphs with blank line)" value={form.about} onChange={set("about")} multiline />
        <Field label="SKILLS (comma separated)" value={form.skills} onChange={set("skills")} />
        <Field label="EMAIL" value={form.email} onChange={set("email")} />
        <Field label="GITHUB URL" value={form.github} onChange={set("github")} />
        <Field label="LINKEDIN URL" value={form.linkedin} onChange={set("linkedin")} />

        {error && <div style={{ fontSize: 11, color: RED, marginBottom: 12 }}>{error}</div>}

        {hasUnsavedMedia && (
          <div style={{ fontSize: 10, color: YELLOW, marginBottom: 8, letterSpacing: 0.5 }}>
            ⚠ Photo changes pending — save below to apply.
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button onClick={handleSave} disabled={saving} style={{ ...btnStyle, background: YELLOW, color: "#000", flex: 1, opacity: saving ? 0.6 : 1 }}>
            {saving ? "SAVING..." : saved ? "✓ SAVED" : "SAVE CHANGES"}
          </button>
          <button onClick={onClose} style={{ ...btnStyle }}>CANCEL</button>
        </div>

      </div>
    </div>
  );
}
