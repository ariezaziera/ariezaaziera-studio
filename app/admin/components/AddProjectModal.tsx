"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/types";
import { YELLOW, BORDER, CARD, RED, btnStyle, inputStyle } from "../layout";
import { Field } from "./Field";

const PRESET_COLORS = [
  "#F5C542", "#60A5FA", "#4ADE80", "#C084FC", "#FB923C", "#F87171",
];

export function AddProjectModal({
  onCreated,
  onClose,
}: {
  onCreated: (p: Project) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    tagline: "",
    slug: "",
    type: "Product",
    tech: "",
    color: "#F5C542",
    featured: false,
    role: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof typeof form) => (v: string) => {
    setForm((f) => {
      const updated = { ...f, [key]: v };
      // Auto-generate slug from title
      if (key === "title") {
        updated.slug = v
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }
      return updated;
    });
  };

  const handleCreate = async () => {
    if (!supabase) {
      setError("Supabase not configured.");
      return;
    }
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!form.slug.trim()) {
      setError("Slug is required.");
      return;
    }

    setSaving(true);
    setError("");

    const newProject = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      tagline: form.tagline.trim() || "Short project description",
      type: form.type.trim() || "Product",
      tech: form.tech
        ? form.tech.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      color: form.color,
      featured: form.featured,
      role: form.role.trim(),
      context: "",
      problem: "",
      solution: "",
      outcome: "",
      screenshots: { mobile: [], desktop: [] },
      mockup_type: "desktop",
      github_url: null,
      live_url: null,
      video_url: null,
      image_url: null,
    };

    const { data, error: dbError } = await supabase
      .from("projects")
      .insert(newProject)
      .select()
      .single();

    setSaving(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    if (data) {
      onCreated(data as Project);
      onClose();
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)",
      zIndex: 200, overflowY: "auto", padding: "40px 24px",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
    }}>
      <div style={{
        width: "100%", maxWidth: 520, background: CARD,
        border: `1px solid ${BORDER}`, borderRadius: 12, padding: 32,
        marginTop: 40,
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>
              New Project
            </div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginTop: 4 }}>ADD TO PORTFOLIO</div>
          </div>
          <button onClick={onClose} style={{ ...btnStyle, padding: "6px 14px", fontSize: 10 }}>✕ CLOSE</button>
        </div>

        {/* Fields */}
        <Field label="TITLE *" value={form.title} onChange={set("title")} placeholder="e.g. Savvyra" />

        {/* Slug preview */}
        <div style={{ marginTop: -8, marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 6 }}>SLUG (auto-generated, editable)</div>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="e.g. savvyra"
            style={inputStyle}
          />
        </div>

        <Field label="TAGLINE" value={form.tagline} onChange={set("tagline")} placeholder="One-line description" />
        <Field label="ROLE" value={form.role} onChange={set("role")} placeholder="e.g. Solo — Product Design, Frontend" />
        <Field label="TECH (comma separated)" value={form.tech} onChange={set("tech")} placeholder="React, Next.js, Supabase" />

        {/* Type */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 6 }}>TYPE</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Product", "Systems", "UI"].map((t) => (
              <button
                key={t}
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                style={{
                  ...btnStyle,
                  fontSize: 10,
                  padding: "6px 16px",
                  borderColor: form.type === t ? YELLOW : BORDER,
                  color: form.type === t ? YELLOW : "#555",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 8 }}>ACCENT COLOR</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setForm((f) => ({ ...f, color: c }))}
                style={{
                  width: 28, height: 28, borderRadius: 6, background: c,
                  border: form.color === c ? `2px solid #fff` : "2px solid transparent",
                  cursor: "pointer", flexShrink: 0,
                }}
              />
            ))}
            <input
              type="text"
              value={form.color}
              onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              style={{ ...inputStyle, width: 110, fontSize: 11 }}
            />
          </div>
        </div>

        {/* Featured toggle */}
        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "#888", cursor: "pointer", marginBottom: 24 }}>
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
            style={{ accentColor: YELLOW, width: 14, height: 14 }}
          />
          MARK AS FEATURED
        </label>

        {error && (
          <div style={{ fontSize: 11, color: RED, marginBottom: 16, padding: "10px 14px", background: "#ff000010", border: "1px solid #ff000030", borderRadius: 6 }}>
            ⚠ {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleCreate}
            disabled={saving}
            style={{ ...btnStyle, background: YELLOW, color: "#000", flex: 1, opacity: saving ? 0.6 : 1, fontSize: 11, fontWeight: 700 }}
          >
            {saving ? "CREATING..." : "CREATE PROJECT →"}
          </button>
          <button onClick={onClose} style={{ ...btnStyle }}>CANCEL</button>
        </div>

        <div style={{ marginTop: 12, fontSize: 10, color: "#444", lineHeight: 1.6 }}>
          Project will be created and opened for full editing (screenshots, case study content, links).
        </div>
      </div>
    </div>
  );
}
