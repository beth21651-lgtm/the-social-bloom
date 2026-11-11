
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "../../../lib/supabase";

export default function FoundersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

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

      setLoading(false);
    }

    checkFounder();
  }, [router]);

  if (loading) {
    return (
      <p style={{ textAlign: "center", padding: "80px" }}>
        Preparing Founders' Space...
      </p>
    );
  }

  const founders = [
    {
      name: "Ishama",
      image: "/founders/ishama.jpg",
      role: "Co-Founder",
      description: "Bringing the vision of The Social Bloom to life."
    },
    {
      name: "Vanissa",
      image: "/founders/vanissa.jpg",
      role: "Co-Founder",
      description: "Building meaningful friendships and lasting connections."
    },
    {
      name: "Techelle",
      image: "/founders/techelle.jpg",
      role: "Co-Founder",
      description: "Creating beautiful experiences and memories together."
    }
  ];

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f8edf1",
      padding: "35px 20px",
      color: "#59464c"
    }}>
      <div style={{ maxWidth: "950px", margin: "auto" }}>

        <button
          onClick={() => router.push("/dashboard")}
          style={{
            background: "white",
            border: "1px solid #9b6478",
            color: "#9b6478",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          ← Back to Dashboard
        </button>

        <header style={{ textAlign: "center", marginTop: "45px" }}>
          <p style={{ color: "#9b6478", letterSpacing: "3px" }}>
            THE HEART OF OUR COMMUNITY
          </p>

          <h1 style={{
            fontSize: "42px",
            color: "#9b6478",
            fontFamily: "Georgia, serif"
          }}>
            Meet Our Founders 🌷
          </h1>

          <p style={{
            maxWidth: "600px",
            margin: "15px auto",
            lineHeight: 1.7
          }}>
            Three women, one vision, and a beautiful journey of friendship,
            connection and community.
          </p>
        </header>

        <section style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "22px",
          marginTop: "40px"
        }}>
          {founders.map((founder) => (
            <article
              key={founder.name}
              style={{
                background: "white",
                borderRadius: "18px",
                padding: "30px 22px",
                textAlign: "center",
                boxShadow: "0 5px 20px rgba(100, 65, 75, 0.07)"
              }}
            >
              <Image
                src={founder.image}
                alt={`${founder.name}, co-founder of The Social Bloom`}
                width={150}
                height={150}
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  objectPosition: "center",
                  margin: "0 auto 18px",
                  border: "4px solid #f4e3e5"
                }}
              />

              <h2 style={{
                color: "#9b6478",
                fontFamily: "Georgia, serif"
              }}>
                {founder.name}
              </h2>

              <p style={{ letterSpacing: "2px", fontSize: "12px" }}>
                {founder.role.toUpperCase()}
              </p>

              <p style={{ lineHeight: 1.7, fontSize: "14px" }}>
                {founder.description}
              </p>
            </article>
          ))}
        </section>

        <footer style={{
          textAlign: "center",
          marginTop: "55px",
          color: "#9b6478"
        }}>
          <p>One Circle. Three Beautiful Stories. A Thousand Memories. 💗</p>
          <p>The Social Bloom</p>
        </footer>

      </div>
    </main>
  );
}
