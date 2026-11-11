
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Member = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  parish: string | null;
  status: "invited" | "active" | "inactive";
};

export default function CommunityPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [parish, setParish] = useState("");

  async function loadMembers() {
    const { data, error } = await supabase
      .from("community_members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Unable to load community members.");
      console.error(error);
    } else {
      setMembers(data || []);
      setMessage("");
    }

    setLoading(false);
  }

  async function addMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { error } = await supabase
      .from("community_members")
      .insert({
        full_name: fullName,
        email: email,
        phone: phone || null,
        parish: parish || null,
        status: "invited",
      });

    if (error) {
      setMessage("Unable to add this member. Please try again.");
      console.error(error);
      return;
    }

    setFullName("");
    setEmail("");
    setPhone("");
    setParish("");
    setMessage("Community member added successfully! 🌸");

    await loadMembers();
  }

  async function updateMemberStatus(id: string, status: string) {
    const { error } = await supabase
      .from("community_members")
      .update({ status })
      .eq("id", id);

    if (error) {
      setMessage("Unable to update membership status.");
      console.error(error);
      return;
    }

    setMessage("Membership status updated successfully.");
    await loadMembers();
  }

  useEffect(() => {
    async function checkFounder() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || profile?.role !== "founder") {
        window.location.href = "/dashboard";
        return;
      }

      await loadMembers();
    }

    checkFounder();
  }, []);

  return (
    <main className="requests-page">
      <div className="requests-heading">
        <p className="eyebrow">THE SOCIAL BLOOM</p>
        <h1>Our Community</h1>
        <p>Growing friendships, one beautiful connection at a time.</p>
      </div>

      {message && <p className="request-message">{message}</p>}

      <section className="request-card">
        <h2>Add a Community Member</h2>

        <form onSubmit={addMember} className="community-form">
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            type="text"
            placeholder="Parish"
            value={parish}
            onChange={(e) => setParish(e.target.value)}
          />

          <button type="submit">ADD MEMBER</button>
        </form>
      </section>

      <section className="requests-list">
        <h2>Community Members</h2>

        {loading ? (
          <p>Loading community members...</p>
        ) : members.length === 0 ? (
          <p>No community members have been added yet.</p>
        ) : (
          members.map((member) => (
            <article className="request-card" key={member.id}>
              <h2>{member.full_name}</h2>

              <p><strong>Email:</strong> {member.email}</p>
              <p><strong>Phone:</strong> {member.phone || "Not provided"}</p>
              <p><strong>Parish:</strong> {member.parish || "Not provided"}</p>

              <p>
                <strong>Membership status:</strong>{" "}
                {member.status.toUpperCase()}
              </p>

              <select
                value={member.status}
                onChange={(e) =>
                  updateMemberStatus(member.id, e.target.value)
                }
              >
                <option value="invited">Invited</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
