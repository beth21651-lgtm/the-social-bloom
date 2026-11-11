
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Welcome to The Social Bloom! You are successfully logged in.");
      router.push("/dashboard");
    }

    setLoading(false);
  }

  async function handleForgotPassword() {
    if (!email) {
      setMessage("Please enter your email address first.");
      return;
    }

    setLoading(true);
    setMessage("");

const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: "https://the-social-bloom.vercel.app/update-password",
});

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for a password reset link.");
    }

    setLoading(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px 20px",
        background:
          "linear-gradient(135deg, #F4E3E5 0%, #F6F0E7 50%, #E8D6B9 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#FFFDFC",
          padding: "48px 40px",
          borderRadius: "22px",
          border: "1px solid #E8D6B9",
          boxShadow: "0 15px 45px rgba(89, 66, 56, 0.10)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "35px" }}>
          <p
            style={{
              color: "#B98591",
              fontSize: "11px",
              letterSpacing: "4px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            A little space to bloom
          </p>

          <h1
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: "42px",
              fontWeight: 600,
              color: "#795548",
              margin: 0,
            }}
          >
            The Social Bloom
          </h1>

          <div
            style={{
              width: "55px",
              height: "1px",
              background: "#E8D6B9",
              margin: "18px auto",
            }}
          />

          <p
            style={{
              color: "#9B8177",
              fontSize: "14px",
              lineHeight: 1.7,
            }}
          >
            Welcome back, beautiful soul.
            <br />
            Your community is waiting for you.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <label
            style={{
              display: "block",
              color: "#795548",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "9px",
            }}
          >
            Email Address
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "22px",
              border: "1px solid #E8D6B9",
              borderRadius: "9px",
              background: "#FFFDFC",
              color: "#594238",
              fontSize: "14px",
              outlineColor: "#B98591",
            }}
          />

          <label
            style={{
              display: "block",
              color: "#795548",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "9px",
            }}
          >
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "12px",
              border: "1px solid #E8D6B9",
              borderRadius: "9px",
              background: "#FFFDFC",
              color: "#594238",
              fontSize: "14px",
              outlineColor: "#B98591",
            }}
          />

          <div style={{ textAlign: "right", marginBottom: "25px" }}>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              style={{
                color: "#B98591",
                background: "none",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                padding: 0,
              }}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              background: "#795548",
              color: "#FFFDFC",
              border: "none",
              borderRadius: "9px",
              fontSize: "14px",
              letterSpacing: "1px",
              fontWeight: 600,
            }}
          >
            {loading ? "PLEASE WAIT..." : "ENTER YOUR SPACE"}
          </button>

          {message && (
            <p
              style={{
                textAlign: "center",
                marginTop: "20px",
                color: "#9B6478",
                fontSize: "13px",
                lineHeight: 1.6,
              }}
            >
              {message}
            </p>
          )}
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "32px",
            paddingTop: "22px",
            borderTop: "1px solid #F0E5D8",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#9B8177",
              fontSize: "13px",
            }}
          >
            ← Return to The Social Bloom
          </Link>

          <p
            style={{
              fontFamily: "var(--font-cormorant), serif",
              color: "#B98591",
              fontSize: "18px",
              fontStyle: "italic",
              marginTop: "20px",
            }}
          >
            One Circle. Beautiful Connections.
          </p>
        </div>
      </div>
    </main>
  );
}
