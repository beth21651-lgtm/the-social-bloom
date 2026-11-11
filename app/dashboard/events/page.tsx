
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  parish: string | null;
  starts_at: string;
  ends_at: string | null;
  status: string;
  is_private: boolean;
};

const emptyForm = {
  title: "",
  description: "",
  location: "",
  parish: "",
  starts_at: "",
  ends_at: "",
  status: "draft",
  is_private: false,
};

export default function ManageEvents() {
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

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

      await loadEvents();
      setLoading(false);
    }

    checkFounder();
  }, [router]);

  async function loadEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("starts_at", { ascending: true });

    if (error) {
      setMessage("Unable to load events: " + error.message);
      return;
    }

    setEvents(data || []);
  }

  function updateField(
    field: keyof typeof emptyForm,
    value: string | boolean
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function editEvent(event: Event) {
    setEditingId(event.id);

    setForm({
      title: event.title,
      description: event.description || "",
      location: event.location || "",
      parish: event.parish || "",
      starts_at: event.starts_at.slice(0, 16),
      ends_at: event.ends_at ? event.ends_at.slice(0, 16) : "",
      status: event.status,
      is_private: event.is_private,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
  }

  async function saveEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const eventData = {
      title: form.title,
      description: form.description || null,
      location: form.location || null,
      parish: form.parish || null,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: form.ends_at
        ? new Date(form.ends_at).toISOString()
        : null,
      status: form.status,
      is_private: form.is_private,
    };

    const result = editingId
      ? await supabase
          .from("events")
          .update(eventData)
          .eq("id", editingId)
      : await supabase
          .from("events")
          .insert(eventData);

    if (result.error) {
      setMessage("Something went wrong: " + result.error.message);
    } else {
      setMessage(editingId ? "Event updated successfully!" : "Event added successfully!");
      resetForm();
      await loadEvents();
    }

    setSaving(false);
  }

  async function deleteEvent(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage("Unable to delete event: " + error.message);
    } else {
      setMessage("Event deleted successfully.");
      await loadEvents();
    }
  }

  if (loading) {
    return (
      <main style={{ padding: "50px", textAlign: "center" }}>
        Preparing your event management space...
      </main>
    );
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#F6F0E7",
      padding: "50px 7%",
      color: "#594238"
    }}>

      <button
        onClick={() => router.push("/dashboard")}
        style={{
          border: "none",
          background: "transparent",
          color: "#A4777B",
          marginBottom: "25px"
        }}
      >
        ← Back to Founders' Dashboard
      </button>

      <header style={{ textAlign: "center", marginBottom: "45px" }}>
        <p style={{
          letterSpacing: "3px",
          fontSize: "10px",
          color: "#A4777B"
        }}>
          THE SOCIAL BLOOM
        </p>

        <h1 style={{
          fontFamily: "var(--font-cormorant), serif",
          fontSize: "48px",
          fontWeight: 500,
          margin: "10px 0"
        }}>
          Manage Experiences
        </h1>

        <p style={{ color: "#806F65", fontSize: "13px" }}>
          Your shared space to plan, organise and manage our events.
        </p>
      </header>

      <section style={{
        maxWidth: "850px",
        margin: "auto",
        background: "#FFFDFC",
        padding: "35px",
        border: "1px solid #E8D6B9"
      }}>

        <h2 style={{
          fontFamily: "var(--font-cormorant), serif",
          fontSize: "30px",
          fontWeight: 500
        }}>
          {editingId ? "Edit Event" : "Create a New Event"}
        </h2>

        <form onSubmit={saveEvent} style={{
          display: "grid",
          gap: "18px"
        }}>

          <label>
            Event Name *
            <input
              required
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. Blue Lagoon & Monkey Island"
              style={inputStyle}
            />
          </label>

          <label>
            Event Description
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Tell everyone about this experience..."
              style={{ ...inputStyle, minHeight: "100px" }}
            />
          </label>

          <label>
            Location
            <input
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="e.g. Blue Lagoon"
              style={inputStyle}
            />
          </label>

          <label>
            Parish
            <input
              value={form.parish}
              onChange={(e) => updateField("parish", e.target.value)}
              placeholder="e.g. Portland"
              style={inputStyle}
            />
          </label>

          <label>
            Starting Date and Time *
            <input
              type="datetime-local"
              required
              value={form.starts_at}
              onChange={(e) => updateField("starts_at", e.target.value)}
              style={inputStyle}
            />
          </label>

          <label>
            Ending Date and Time
            <input
              type="datetime-local"
              value={form.ends_at}
              onChange={(e) => updateField("ends_at", e.target.value)}
              style={inputStyle}
            />
          </label>

          <label>
            Event Status
            <select
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
              style={inputStyle}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="completed">Completed</option>
              <option value="postponed">Postponed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <label style={{
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <input
              type="checkbox"
              checked={form.is_private}
              onChange={(e) => updateField("is_private", e.target.checked)}
            />
            Private event (Founders' Inner Circle)
          </label>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button type="submit" disabled={saving} style={buttonStyle}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Save Changes"
                  : "Add Event"}
            </button>

            {editingId && (
              <button type="button" onClick={resetForm} style={cancelStyle}>
                Cancel Editing
              </button>
            )}
          </div>

        </form>

        {message && (
          <p style={{ marginTop: "20px", color: "#A4777B" }}>
            {message}
          </p>
        )}
      </section>

      <section style={{ maxWidth: "1000px", margin: "65px auto" }}>
        <h2 style={{
          fontFamily: "var(--font-cormorant), serif",
          fontSize: "34px",
          fontWeight: 500
        }}>
          Our Events
        </h2>

        {events.length === 0 ? (
          <p style={{ color: "#806F65" }}>
            No events have been added yet. Create your first event above.
          </p>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px"
          }}>
            {events.map((event) => (
              <article key={event.id} style={{
                background: "#FFFDFC",
                padding: "25px",
                border: "1px solid #E8D6B9",
                borderRadius: "8px"
              }}>
                <p style={{
                  color: "#A4777B",
                  fontSize: "10px",
                  letterSpacing: "2px"
                }}>
                  {event.status.toUpperCase()}
                </p>

                <h3 style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "27px",
                  fontWeight: 500
                }}>
                  {event.title}
                </h3>

                <p style={{ fontSize: "13px", color: "#806F65" }}>
                  {event.parish || event.location || "Location to be announced"}
                </p>

                <p style={{ fontSize: "12px", color: "#806F65" }}>
                  {new Date(event.starts_at).toLocaleString()}
                </p>

                {event.is_private && (
                  <p style={{ color: "#A4777B", fontSize: "11px" }}>
                    Private Founders' Event
                  </p>
                )}

                <div style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "20px"
                }}>
                  <button onClick={() => editEvent(event)} style={buttonStyle}>
                    Edit
                  </button>

                  <button
                    onClick={() => deleteEvent(event.id)}
                    style={deleteStyle}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  border: "1px solid #E8D6B9",
  background: "#FFFDFC",
  color: "#594238",
  fontSize: "13px",
  borderRadius: "4px"
};

const buttonStyle: React.CSSProperties = {
  background: "#795548",
  color: "#FFFDFC",
  border: "none",
  padding: "12px 20px",
  cursor: "pointer",
  fontSize: "11px"
};

const cancelStyle: React.CSSProperties = {
  background: "#F4E3E5",
  color: "#795548",
  border: "none",
  padding: "12px 20px",
  cursor: "pointer"
};

const deleteStyle: React.CSSProperties = {
  background: "#F4E3E5",
  color: "#A4777B",
  border: "none",
  padding: "12px 20px",
  cursor: "pointer"
};
