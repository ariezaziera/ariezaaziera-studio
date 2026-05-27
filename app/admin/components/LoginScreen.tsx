"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { YELLOW, RED, inputStyle, btnStyle } from "../layout";

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!supabase) { setError("Supabase not configured."); return; }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else onLogin();
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: -1, marginBottom: 8 }}>
            AA<span style={{ color: YELLOW }}>.</span> Admin
          </div>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: 1 }}>PORTFOLIO CMS</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={inputStyle}
          />
          {error && <div style={{ fontSize: 11, color: RED, letterSpacing: 0.5 }}>{error}</div>}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ ...btnStyle, background: YELLOW, color: "#000", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "SIGNING IN..." : "SIGN IN →"}
          </button>
        </div>
      </div>
    </div>
  );
}
