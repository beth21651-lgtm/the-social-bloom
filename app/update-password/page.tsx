
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdatePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Your password has been updated successfully!");
      setTimeout(() => router.push("/login"), 2000);
    }

    setLoading(false);
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f8edf1",
      padding: "20px"
    }}>
      <form onSubmit={handleUpdatePassword} style={{
        background: "white",
        padding: "40px",
        borderRadius: "18px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)"
      }}>
        <h1 style={{ color: "#9b6478", textAlign: "center" }}>
          Create a New Password
        </h1>

        <p style={{ textAlign: "center", color: "#777" }}>
          Choose a new password for your Social Bloom account.
        </p>

        <label>New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          style={{ width: "100%", padding: "12px", margin: "10px 0 20px" }}
        />

        <button type="submit" disabled={loading} style={{
          width: "100%",
          padding: "14px",
          background: "#9b6478",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}>
          {loading ? "Updating..." : "Update Password"}
        </button>

        {message && (
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            {message}
          </p>
        )}
      </form>
    </main>
  );
}
