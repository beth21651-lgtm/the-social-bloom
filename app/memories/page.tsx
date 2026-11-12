
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Memory = {
  id: string;
  event_id: string;
  storage_path: string;
  caption: string | null;
  created_at: string;
  image_url: string;
  event_title: string;
};

export default function MemoriesGallery() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadMemories() {
      const { data: photos, error } = await supabase
        .from("event_photos")
        .select("id, event_id, storage_path, caption, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage("We couldn't load our memories just yet.");
        setLoading(false);
        return;
      }

      if (!photos || photos.length === 0) {
        setMemories([]);
        setLoading(false);
        return;
      }

      const eventIds = [...new Set(photos.map((photo) => photo.event_id))];

      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("id, title")
        .in("id", eventIds)
        .eq("is_private", false);

      if (eventsError) {
        setMessage("We couldn't load our event details just yet.");
        setLoading(false);
        return;
      }

      const publicEvents = new Map(
        (events || []).map((event) => [event.id, event.title])
      );

      const visiblePhotos = photos.filter((photo) =>
        publicEvents.has(photo.event_id)
      );

      const gallery = await Promise.all(
        visiblePhotos.map(async (photo) => {
          const { data } = await supabase.storage
            .from("event-memories")
            .createSignedUrl(photo.storage_path, 3600);

          return {
            ...photo,
            image_url: data?.signedUrl || "",
            event_title: publicEvents.get(photo.event_id) || "Our Memories",
          };
        })
      );

      setMemories(gallery.filter((photo) => photo.image_url));
      setLoading(false);
    }

    loadMemories();
  }, []);

  return (
    <main style={{
      minHeight: "100vh",
      background: "#F6F0E7",
      padding: "45px 7%",
      color: "#594238"
    }}>
      <header style={{
        textAlign: "center",
        marginBottom: "50px"
      }}>
        <p style={{
          letterSpacing: "3px",
          fontSize: "10px",
          color: "#A4777B"
        }}>
          THE SOCIAL BLOOM
        </p>

        <h1 style={{
          fontFamily: "var(--font-cormorant), serif",
          fontSize: "52px",
          fontWeight: 500,
          margin: "10px 0"
        }}>
          Our Memories 🌷
        </h1>

        <p style={{
          color: "#806F65",
          maxWidth: "550px",
          margin: "auto",
          lineHeight: 1.8
        }}>
          Beautiful moments, wonderful friendships and memories
          that will last a lifetime.
        </p>
      </header>

      {loading ? (
        <p style={{ textAlign: "center" }}>
          Gathering our beautiful memories...
        </p>
      ) : message ? (
        <p style={{ textAlign: "center", color: "#A4777B" }}>
          {message}
        </p>
      ) : memories.length === 0 ? (
        <section style={{
          maxWidth: "650px",
          margin: "auto",
          padding: "45px 25px",
          textAlign: "center",
          background: "#FFFDFC",
          border: "1px solid #E8D6B9",
          borderRadius: "10px"
        }}>
          <h2 style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "32px",
            fontWeight: 500
          }}>
            Our story is still unfolding...
          </h2>

          <p style={{ color: "#806F65", lineHeight: 1.8 }}>
            Our photographs will appear here after our founders
            have uploaded and approved them. We can't wait to
            share these beautiful moments with you!
          </p>
        </section>
      ) : (
        <section style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "25px",
          maxWidth: "1100px",
          margin: "auto"
        }}>
          {memories.map((memory) => (
            <article key={memory.id} style={{
              background: "#FFFDFC",
              border: "1px solid #E8D6B9",
              borderRadius: "9px",
              overflow: "hidden"
            }}>
              <img
                src={memory.image_url}
                alt={memory.caption || memory.event_title}
                style={{
                  width: "100%",
                  height: "280px",
                  objectFit: "cover",
                  display: "block"
                }}
              />

              <div style={{ padding: "20px" }}>
                <p style={{
                  color: "#A4777B",
                  fontSize: "10px",
                  letterSpacing: "2px"
                }}>
                  THE SOCIAL BLOOM
                </p>

                <h2 style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "27px",
                  fontWeight: 500,
                  margin: "5px 0"
                }}>
                  {memory.event_title}
                </h2>

                {memory.caption && (
                  <p style={{
                    color: "#806F65",
                    fontSize: "13px",
                    lineHeight: 1.7
                  }}>
                    {memory.caption}
                  </p>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      <footer style={{
        textAlign: "center",
        marginTop: "65px",
        color: "#A4777B",
        fontSize: "12px"
      }}>
        One Circle. Three Beautiful Stories. A Thousand Memories. 💗
      </footer>
    </main>
  );
}
