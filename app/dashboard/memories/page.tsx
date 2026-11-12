
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Event = {
  id: string;
  title: string;
};

type Photo = {
  id: string;
  event_id: string;
  storage_path: string;
  caption: string | null;
  status: string;
  created_at: string;
  image_url: string;
};

export default function ManageMemories() {
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [eventId, setEventId] = useState("");
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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
      await loadPhotos();
      setLoading(false);
    }

    checkFounder();
  }, [router]);

  async function loadEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("id, title")
      .order("starts_at", { ascending: false });

    if (error) {
      setMessage("Unable to load events: " + error.message);
      return;
    }

    setEvents(data || []);
  }

  async function loadPhotos() {
    const { data, error } = await supabase
      .from("event_photos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Unable to load photos: " + error.message);
      return;
    }

    const photosWithUrls = await Promise.all(
      (data || []).map(async (photo) => {
        const { data: signedImage } = await supabase.storage
          .from("event-memories")
          .createSignedUrl(photo.storage_path, 3600);

        return {
          ...photo,
          image_url: signedImage?.signedUrl || "",
        };
      })
    );

    setPhotos(photosWithUrls);
  }

  async function uploadPhotos(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!eventId || files.length === 0) {
      setMessage("Please select an event and at least one photo.");
      return;
    }

    if (files.some((file) => !file.type.startsWith("image/"))) {
      setMessage("Please select image files only.");
      return;
    }

    if (files.some((file) => file.size > 10 * 1024 * 1024)) {
      setMessage("Each photo must be 10 MB or smaller.");
      return;
    }

    setUploading(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please log in again.");
      setUploading(false);
      return;
    }

    let successfulUploads = 0;

    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath =
        `${eventId}/${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("event-memories")
        .upload(storagePath, file);

      if (uploadError) {
        setMessage("Photo upload failed: " + uploadError.message);
        continue;
      }

      const { error: recordError } = await supabase
        .from("event_photos")
        .insert({
          event_id: eventId,
          storage_path: storagePath,
          caption: caption.trim() || null,
          status: "pending",
          uploaded_by: user.id,
        });

      if (recordError) {
        await supabase.storage
          .from("event-memories")
          .remove([storagePath]);

        setMessage("Could not save photo details: " + recordError.message);
        continue;
      }

      successfulUploads++;
    }

    if (successfulUploads > 0) {
      setMessage(
        `${successfulUploads} photo(s) uploaded and awaiting approval!`
      );
      setFiles([]);
      setCaption("");
      await loadPhotos();
    }

    setUploading(false);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("event_photos")
      .update({ status })
      .eq("id", id);

    if (error) {
      setMessage("Unable to update photo: " + error.message);
      return;
    }

    setMessage(
      status === "approved"
        ? "Photo approved! It can now appear in the public gallery."
        : "Photo rejected."
    );

    await loadPhotos();
  }

  async function deletePhoto(photo: Photo) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this photo?"
    );

    if (!confirmed) return;

    const { error: storageError } = await supabase.storage
      .from("event-memories")
      .remove([photo.storage_path]);

    if (storageError) {
      setMessage("Unable to delete photo file: " + storageError.message);
      return;
    }

    const { error } = await supabase
      .from("event_photos")
      .delete()
      .eq("id", photo.id);

    if (error) {
      setMessage("Unable to delete photo record: " + error.message);
      return;
    }

    setMessage("Photo deleted successfully.");
    await loadPhotos();
  }

  if (loading) {
    return (
      <main style={{ padding: "50px", textAlign: "center" }}>
        Preparing your Memories Gallery...
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
        style={backStyle}
      >
        ← Back to Founders' Dashboard
      </button>

      <header style={{ textAlign: "center", marginBottom: "45px" }}>
        <p style={{ letterSpacing: "3px", fontSize: "10px", color: "#A4777B" }}>
          THE SOCIAL BLOOM
        </p>

        <h1 style={{
          fontFamily: "var(--font-cormorant), serif",
          fontSize: "48px",
          fontWeight: 500,
          margin: "10px 0"
        }}>
          Our Memories 🌷
        </h1>

        <p style={{ color: "#806F65", fontSize: "13px" }}>
          Every beautiful moment deserves to be remembered.
        </p>
      </header>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>Upload Event Photographs</h2>

        <form onSubmit={uploadPhotos} style={{
          display: "grid",
          gap: "18px"
        }}>
          <label>
            Select Event *
            <select
              required
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              style={inputStyle}
            >
              <option value="">Choose an event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            Select Photographs *
            <input
              required
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              style={inputStyle}
            />
            <small style={{ color: "#806F65" }}>
              You can select multiple photos. Maximum 10 MB per photo.
            </small>
          </label>

          <label>
            Photo Caption
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a little description about these memories..."
              style={{ ...inputStyle, minHeight: "90px" }}
            />
          </label>

          <button type="submit" disabled={uploading} style={buttonStyle}>
            {uploading ? "Uploading..." : "Upload Photographs"}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: "20px", color: "#A4777B" }}>
            {message}
          </p>
        )}
      </section>

      <section style={{ maxWidth: "1100px", margin: "60px auto" }}>
        <h2 style={headingStyle}>Review Our Photographs</h2>

        {photos.length === 0 ? (
          <p style={{ color: "#806F65" }}>
            No photographs uploaded yet. Your event memories will appear here.
          </p>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "22px"
          }}>
            {photos.map((photo) => {
              const event = events.find((item) => item.id === photo.event_id);

              return (
                <article key={photo.id} style={{
                  background: "#FFFDFC",
                  border: "1px solid #E8D6B9",
                  borderRadius: "8px",
                  overflow: "hidden"
                }}>
                  {photo.image_url ? (
                    <img
                      src={photo.image_url}
                      alt={photo.caption || "Social Bloom event memory"}
                      style={{
                        width: "100%",
                        height: "230px",
                        objectFit: "cover"
                      }}
                    />
                  ) : (
                    <div style={{
                      height: "230px",
                      display: "grid",
                      placeItems: "center",
                      color: "#806F65"
                    }}>
                      Photo preview unavailable
                    </div>
                  )}

                  <div style={{ padding: "20px" }}>
                    <p style={{
                      color: "#A4777B",
                      fontSize: "10px",
                      letterSpacing: "1px"
                    }}>
                      {(photo.status || "pending").toUpperCase()}
                    </p>

                    <h3 style={headingStyle}>
                      {event?.title || "Social Bloom Event"}
                    </h3>

                    <p style={{ fontSize: "13px", color: "#806F65" }}>
                      {photo.caption || "No caption added."}
                    </p>

                    <div style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginTop: "18px"
                    }}>
                      {photo.status !== "approved" && (
                        <button
                          onClick={() => updateStatus(photo.id, "approved")}
                          style={buttonStyle}
                        >
                          Approve
                        </button>
                      )}

                      {photo.status !== "rejected" && (
                        <button
                          onClick={() => updateStatus(photo.id, "rejected")}
                          style={cancelStyle}
                        >
                          Reject
                        </button>
                      )}

                      <button
                        onClick={() => deletePhoto(photo)}
                        style={deleteStyle}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

const sectionStyle: React.CSSProperties = {
  maxWidth: "850px",
  margin: "auto",
  background: "#FFFDFC",
  padding: "35px",
  border: "1px solid #E8D6B9",
  borderRadius: "8px"
};

const headingStyle: React.CSSProperties = {
  fontFamily: "var(--font-cormorant), serif",
  fontSize: "30px",
  fontWeight: 500
};

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
  fontSize: "11px",
  borderRadius: "4px"
};

const backStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#A4777B",
  marginBottom: "25px",
  cursor: "pointer"
};

const cancelStyle: React.CSSProperties = {
  background: "#F4E3E5",
  color: "#795548",
  border: "none",
  padding: "12px 15px",
  cursor: "pointer",
  borderRadius: "4px"
};

const deleteStyle: React.CSSProperties = {
  background: "#F4E3E5",
  color: "#A4777B",
  border: "none",
  padding: "12px 15px",
  cursor: "pointer",
  borderRadius: "4px"
};
