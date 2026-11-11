
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function checkFounder() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || profile?.role !== "founder") {
        router.replace("/");
        return;
      }

      setEmail(user.email ?? "");
      setLoading(false);
    }

    checkFounder();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <p style={{ textAlign: "center", padding: "80px" }}>
        Preparing your founders' space...
      </p>
    );
  }

  const dashboardCards = [
    ["📅", "Manage Events", "Plan and organise upcoming activities."],
    ["💌", "Manage Requests", "Review, approve and decline registrations."],
    ["🌷", "Community", "Keep track of our growing community."],
    ["📢", "Announcements", "Share updates with our members."],
    ["👑", "Founders", "Your private founders' space."]
  ];

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f8edf1",
      padding: "30px",
      color: "#59464c"
    }}>
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "15px"
      }}>
        <div>
          <h1 style={{ color: "#9b6478" }}>The Social Bloom</h1>
          <p>Founders' Private Space 🌸</p>
        </div>

        <button onClick={handleLogout} style={{
          padding: "10px 18px",
          border: "1px solid #9b6478",
          borderRadius: "8px",
          background: "white",
          color: "#9b6478",
          cursor: "pointer"
        }}>
          Log Out
        </button>
      </header>

      <section style={{
        background: "white",
        padding: "30px",
        borderRadius: "18px",
        marginTop: "35px"
      }}>
        <h2>Welcome back, Founder! 💗</h2>
        <p>You are logged in as {email}.</p>
        <p>
          This is your private space to help manage
          The Social Bloom and everything we're building together.
        </p>
      </section>

      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px",
        marginTop: "25px"
      }}>
        {dashboardCards.map(([icon, title, description]) => (
          <div
            key={title}
            onClick={() => {
              if (title === "Manage Events") {
                router.push("/dashboard/events");
              } else if (title === "Manage Requests") {
                router.push("/dashboard/requests");
              } else if (title === "Community") {
                router.push("/dashboard/community");
              } else if (title === "Founders") {
                router.push("/dashboard/founders");
              }
            }}
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "15px",
              cursor: ["Manage Events", "Manage Requests", "Community", "Founders"].includes(title)
                ? "pointer"
                : "default"
            }}
          >
            <h2>{icon} {title}</h2>
            <p>{description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
