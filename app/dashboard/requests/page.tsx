
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function ManageRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredRequests =
    activeFilter === "all"
      ? requests
      : requests.filter((request) => request.status === activeFilter);

  const pendingCount = requests.filter(
    (request) => request.status === "pending"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "approved"
  ).length;

  const declinedCount = requests.filter(
    (request) => request.status === "declined"
  ).length;

  async function loadRequests() {
    setLoading(true);

    const { data, error } = await supabase
      .from("event_requests")
      .select(`
        *,
        events (
          title,
          starts_at,
          location,
          parish
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Unable to load requests. Please try again.");
      console.error(error);
    } else {
      setRequests(data || []);
      setMessage("");
    }

    setLoading(false);
  }

  async function updateRequest(id: string, status: string) {
    const { error } = await supabase
      .from("event_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      setMessage("Unable to update this request. Please try again.");
      console.error(error);
      return;
    }

    setMessage(`Request ${status} successfully.`);
    await loadRequests();
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

      await loadRequests();
    }

    checkFounder();
  }, []);

  return (
    <main className="requests-page">
      <div className="requests-heading">
        <p className="eyebrow">THE SOCIAL BLOOM</p>
        <h1>Registration Requests</h1>
        <p>Review and manage requests to join our community experiences.</p>
      </div>

      {message && <p className="request-message">{message}</p>}

      <div className="refresh-container">
        <button
          type="button"
          className="refresh-button"
          onClick={loadRequests}
          disabled={loading}
        >
          {loading ? "REFRESHING..." : "↻ REFRESH REQUESTS"}
        </button>
      </div>

      <div className="request-summary">
        <div className="summary-card pending-summary">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </div>

        <div className="summary-card approved-summary">
          <span>Approved</span>
          <strong>{approvedCount}</strong>
        </div>

        <div className="summary-card declined-summary">
          <span>Declined</span>
          <strong>{declinedCount}</strong>
        </div>
      </div>

      <div className="request-filters">
        {["all", "pending", "approved", "declined"].map((filter) => (
          <button
            key={filter}
            type="button"
            className={activeFilter === filter ? "active-filter" : ""}
            onClick={() => setActiveFilter(filter)}
          >
            {filter.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading requests...</p>
      ) : filteredRequests.length === 0 ? (
        <p>
          {activeFilter === "all"
            ? "No registration requests yet."
            : `No ${activeFilter} requests found.`}
        </p>
      ) : (
        <div className="requests-list">
          {filteredRequests.map((request) => (
            <article className="request-card" key={request.id}>
              <p className="request-status">
                {request.status.toUpperCase()}
              </p>

              <h2>{request.full_name}</h2>

              <p><strong>Event:</strong> {request.events?.title || "Event unavailable"}</p>
              <p><strong>Email:</strong> {request.email}</p>
              <p><strong>Phone:</strong> {request.phone}</p>
              <p><strong>People attending:</strong> {request.attendees}</p>

              {request.events?.starts_at && (
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(request.events.starts_at).toLocaleDateString()}
                </p>
              )}

              {request.events?.location && (
                <p><strong>Location:</strong> {request.events.location}</p>
              )}

              {request.events?.parish && (
                <p><strong>Parish:</strong> {request.events.parish}</p>
              )}

              {request.additional_info && (
                <p>
                  <strong>Additional information:</strong>{" "}
                  {request.additional_info}
                </p>
              )}

              {request.status === "pending" && (
                <div className="request-actions">
                  <button
                    type="button"
                    onClick={() => updateRequest(request.id, "approved")}
                  >
                    APPROVE
                  </button>

                  <button
                    type="button"
                    onClick={() => updateRequest(request.id, "declined")}
                  >
                    DECLINE
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
