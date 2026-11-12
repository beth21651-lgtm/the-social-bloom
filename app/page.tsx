
'use client';
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [fullHouseStatus, setFullHouseStatus] = useState<string | null>(null);
  const [publicEvents, setPublicEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
const [fullName, setFullName] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
const [attendees, setAttendees] = useState(1);
const [additionalInfo, setAdditionalInfo] = useState("");
const [requestMessage, setRequestMessage] = useState("");
async function submitRequest() {
  if (!selectedEvent) return;

  const { error } = await supabase
    .from("event_requests")
    .insert({
      event_id: selectedEvent.id,
      full_name: fullName,
      email: email,
      phone: phone,
      attendees: attendees,
      additional_info: additionalInfo,
    });

  if (error) {
    setRequestMessage("Sorry, your request could not be submitted. Please try again.");
    return;
  }

  setRequestMessage("Your request has been received! Our founders will review it.");

  setFullName("");
  setEmail("");
  setPhone("");
  setAttendees(1);
  setAdditionalInfo("");
}
  useEffect(() => {
    async function loadFullHouseStatus() {
      const { data, error } = await supabase.rpc(
        "get_full_house_event_status"
      );

      if (!error && data) {
        setFullHouseStatus(data);
      }
    }
async function loadPublicEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_private", false)
    .order("starts_at", { ascending: true });

  if (!error && data) {
    setPublicEvents(data);
  }
}

loadPublicEvents();
    loadFullHouseStatus();
  }, []);

  return (
    <main className="site">

      {/* NAVIGATION */}
      <nav className="navbar">
        <a className="brand" href="#home">
          THE SOCIAL BLOOM<span>✿</span>
        </a>

        <div className="navlinks">
          <a href="#home">Home</a>
          <a href="#about">Our Story</a>
          <a href="#events">Experiences</a>
          <a href="/memories">Our Memories</a>
          <a href="#community">Community</a>
        </div>

        <a className="login" href="/login">Member Login</a>
      </nav>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-content">
          <p className="eyebrow">A COMMUNITY OF BEAUTIFUL CONNECTIONS</p>

          <h1>
            Where Friendships
            <br />
            <span>Blossom</span> & Connections Grow.
          </h1>

          <div className="hero-divider">✧ &nbsp; ✿ &nbsp; ✧</div>

          <p className="intro">
            A beautiful space for genuine friendships, shared experiences,
            unforgettable adventures and meaningful connections.
          </p>

          <a className="mainbutton" href="#events">
            Discover Our World <span>→</span>
          </a>

          <p className="smallnote">
            A little friendship. A lifetime of beautiful memories.
          </p>
        </div>

        <div className="hero-decoration">
          <span>✿</span>
          <span>✧</span>
          <span>✿</span>
        </div>
      </section>

      {/* BRAND STRIP */}
      <section className="brand-strip">
        <span>FRIENDSHIP</span>
        <i>✧</i>
        <span>CONNECTION</span>
        <i>✧</i>
        <span>COMMUNITY</span>
      </section>

      {/* ABOUT */}
      <section className="welcome" id="about">
        <div className="section-heading">
          <p className="eyebrow">A LITTLE ABOUT US</p>
          <h2>
            More than a friendship.
            <br />
            <span>A growing community.</span>
          </h2>
          <div className="heading-flower">✿</div>
        </div>

        <p className="welcome-text">
          The Social Bloom was created to bring people together.
          From our founders' special traditions to exciting community
          adventures, every connection is an opportunity to bloom.
          We believe in creating meaningful friendships, embracing
          new experiences and making memories that last.
        </p>

        <div className="founders">
          <div className="founder-circle">I</div>
          <div className="founder-circle">V</div>
          <div className="founder-circle">T</div>
        </div>

        <p className="foundertext">
          Founded with love by Ishama, Vanissa & Techelle
        </p>
      </section>

           {/* EVENTS */}
      <section className="events" id="events">
        <p className="eyebrow">THE SOCIAL BLOOM EXPERIENCE</p>

        <h2>Experiences Worth Sharing.</h2>

        <p className="section-description">
          From beautiful adventures to meaningful connections, every experience
          brings us closer together.
        </p>

        <p className="event-intro">
          Explore our upcoming experiences and discover opportunities to connect
          with our growing community.
          <span>Participation in community outings is subject to founder approval.</span>
        </p>

        <div className="eventgrid">

          <div className="eventcard">
            <p className="event-date">NOVEMBER 14, 2026</p>
            <h3>Disney Night</h3>
            <p>
              A magical evening filled with laughter, memories and a little
              Disney magic.
            </p>
            <span className="event-status private-status">
  PRIVATE · FOUNDERS' INNER CIRCLE
</span>

{fullHouseStatus && (
  <span className="event-status private-status">
    {fullHouseStatus === "published"
      ? "UPCOMING"
      : fullHouseStatus.toUpperCase()}
  </span>
)}
          </div>

          
{publicEvents.map((event) => (
  <div className="eventcard featured" key={event.id}>
    <p className="event-date">
      {new Date(event.starts_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).toUpperCase()}
    </p>

    <h3>{event.title}</h3>

    <p>{event.description}</p>

    {event.location && (
      <p>{event.location}{event.parish ? `, ${event.parish}` : ""}</p>
    )}

    <span className="event-status community-status">
      {event.status === "published"
        ? "UPCOMING"
        : event.status.toUpperCase()}
    </span>

   <button
  className="event-button"
  onClick={() => {
    setSelectedEvent(event);
    setRequestMessage(""); 
  }}
>
  REQUEST YOUR PLACE
</button>
  </div>
))}


        </div>

{selectedEvent && (
  <div className="registration-overlay">
    <div className="registration-form">
      <button
        type="button"
        onClick={() => setSelectedEvent(null)}
      >
        ✕
      </button>

      <p className="eyebrow">JOIN OUR COMMUNITY EXPERIENCE</p>
      <h2>Request Your Place</h2>
      <p>{selectedEvent.title}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitRequest();
        }}
      >
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <label>Number of people attending</label>
        <input
          type="number"
          min="1"
          max="20"
          value={attendees}
          onChange={(e) => setAttendees(Number(e.target.value))}
          required
        />

        <textarea
          placeholder="Additional information (optional)"
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
        />

        <button type="submit" className="event-button">
          SUBMIT REQUEST
        </button>
      </form>

      {requestMessage && <p>{requestMessage}</p>}

      <p>
        Submitting a request does not guarantee approval.
        Our founders will review your request.
      </p>
    </div>
  </div>
)}

        <div className="parish-message">
          <h3>12 Months. 12 Parishes.</h3>
          <p>
            One beautiful island, countless experiences and new friendships
            waiting to blossom.
          </p>
        </div>

        <div className="event-policy">
          <p className="policy-flower">✿</p>
          <h3>Every Connection Begins Somewhere.</h3>
          <p>
            Our community outings are opportunities to meet new people,
            create memories and build meaningful friendships. All participation
            requests are reviewed by our founders.
          </p>
          <p className="policy-note">
            Attending an event does not automatically make someone a member
            of The Social Bloom.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <h2>THE SOCIAL BLOOM <span>✿</span></h2>
        <p className="footer-tagline">
          Where Friendships Blossom & Connections Grow.
        </p>

        <div className="footer-divider"></div>

        <p className="footer-values">
          Friendship &nbsp; · &nbsp; Connection &nbsp; · &nbsp; Community
        </p>

        <p className="copyright">© 2026 The Social Bloom. All rights reserved.</p>
      </footer>

      {/* PAGE STYLING */}
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #F6F0E7;
          color: #594238;
          font-family: var(--font-dm-sans), sans-serif;
        }

        .site {
          overflow: hidden;
          width: 100%;
        }

        a {
          text-decoration: none;
        }

        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 25px 7%;
          background: #FFFDFC;
          gap: 25px;
          flex-wrap: wrap;
        }

        .brand {
          font-family: var(--font-cormorant), serif;
          font-size: 25px;
          font-weight: 600;
          letter-spacing: 2px;
          color: #795548;
        }

        .brand span {
          color: #B98591;
          margin-left: 8px;
        }

        .navlinks {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
        }

        .navlinks a {
          color: #795F54;
          font-size: 12px;
          letter-spacing: 1px;
          transition: color 0.3s ease;
        }

        .navlinks a:hover {
          color: #B98591;
        }

        .login {
          background: #795548;
          color: #FFFDFC;
          padding: 13px 23px;
          border-radius: 3px;
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .hero {
          position: relative;
          background: linear-gradient(
            135deg,
            #F4E3E5,
            #F6F0E7 55%,
            #E8D6B9
          );
          text-align: center;
          padding: 120px 20px 115px;
          min-height: 590px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-content {
          max-width: 850px;
          position: relative;
          z-index: 2;
        }

        .eyebrow {
          font-size: 10px;
          letter-spacing: 3px;
          color: #A4777B;
          font-family: var(--font-dm-sans), sans-serif;
          text-transform: uppercase;
          line-height: 1.8;
        }

        h1 {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(48px, 7vw, 83px);
          font-weight: 400;
          line-height: 1.03;
          color: #594238;
          margin: 28px 0;
        }

        h1 span,
        h2 span {
          color: #A4777B;
          font-style: italic;
        }

        .hero-divider {
          color: #B98591;
          font-size: 20px;
          margin: 25px 0;
        }

        .intro {
          max-width: 570px;
          margin: 0 auto 35px;
          font-size: 14px;
          line-height: 2;
          color: #79665D;
        }

        .mainbutton {
          display: inline-block;
          background: #795548;
          color: #FFFDFC;
          padding: 16px 30px;
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          transition: background 0.3s ease;
        }

        .mainbutton:hover {
          background: #A4777B;
        }

        .mainbutton span {
          margin-left: 12px;
        }

        .smallnote {
          margin-top: 30px;
          font-family: var(--font-cormorant), serif;
          font-size: 19px;
          font-style: italic;
          color: #94776C;
        }

        .hero-decoration {
          position: absolute;
          inset: 0;
          pointer-events: none;
          color: rgba(169, 116, 126, 0.22);
        }

        .hero-decoration span:nth-child(1) {
          position: absolute;
          left: 8%;
          top: 18%;
          font-size: 65px;
        }

        .hero-decoration span:nth-child(2) {
          position: absolute;
          right: 12%;
          top: 25%;
          font-size: 35px;
        }

        .hero-decoration span:nth-child(3) {
          position: absolute;
          right: 8%;
          bottom: 12%;
          font-size: 75px;
        }

        .brand-strip {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 40px;
          padding: 24px 15px;
          background: #795548;
          color: #FFFDFC;
          font-size: 10px;
          letter-spacing: 3px;
          flex-wrap: wrap;
        }

        .brand-strip i {
          color: #E8D6B9;
          font-style: normal;
        }

        .welcome {
          text-align: center;
          padding: 105px 20px;
          background: #FFFDFC;
        }

        .section-heading {
          text-align: center;
        }

        h2 {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(37px, 5vw, 53px);
          line-height: 1.15;
          font-weight: 400;
          color: #594238;
          margin: 22px 0;
        }

        .heading-flower {
          color: #B98591;
          font-size: 25px;
          margin-top: 15px;
        }

        .welcome-text {
          max-width: 660px;
          margin: 25px auto;
          line-height: 2;
          font-size: 14px;
          color: #806F65;
        }

        .founders {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 45px;
        }

        .founder-circle {
          width: 64px;
          height: 64px;
          border: 1px solid #D8BDBB;
          border-radius: 50%;
          background: #F4E3E5;
          display: grid;
          place-items: center;
          color: #795548;
          font-family: var(--font-cormorant), serif;
          font-size: 29px;
          font-style: italic;
        }

        .foundertext {
          font-family: var(--font-cormorant), serif;
          font-size: 20px;
          font-style: italic;
          color: #94776C;
          margin-top: 25px;
        }

        .events {
          background: #F6F0E7;
          padding: 100px 7%;
        }

        .event-intro {
  max-width: 650px;
  text-align: center;
  margin: 25px auto 0;
  color: #806F65;
  font-size: 13px;
  line-height: 1.9;
}

.event-intro span {
  display: block;
  margin-top: 10px;
  color: #A4777B;
  font-family: var(--font-cormorant), serif;
  font-size: 17px;
  font-style: italic;
}

.event-status {
  display: inline-block;
  align-self: flex-start;
  margin-top: 20px;
  padding: 7px 10px;
  font-size: 9px;
  letter-spacing: 1.5px;
}

.private-status {
  background: #F6F0E7;
  color: #795548;
}

.community-status {
  background: #FFFDFC;
  color: #A4777B;
}

.event-button {
  margin-top: 22px;
  padding: 13px 10px;
  width: 100%;
  border: 1px solid #B98591;
  background: transparent;
  color: #A4777B;
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: not-allowed;
  opacity: 0.8;
}

.event-button {
  cursor: pointer;
  opacity: 1;
}

.event-button:hover {
  background: #795548;
  color: #FFFDFC;
}

.registration-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(59, 43, 37, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  overflow-y: auto;
}

.registration-form {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  background: #FFFDFC;
  padding: 40px 30px;
  border: 1px solid #E8D6B9;
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.15);
}

.registration-form form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 25px;
}

.registration-form input,
.registration-form textarea {
  width: 100%;
  padding: 14px;
  border: 1px solid #E8D6B9;
  background: #F6F0E7;
  color: #594238;
  font-family: inherit;
  font-size: 13px;
}

.registration-form textarea {
  min-height: 100px;
  resize: vertical;
}

.registration-form label {
  font-size: 12px;
  color: #795548;
}

.registration-form > button:first-child {
  display: block;
  margin-left: auto;
  border: none;
  background: transparent;
  color: #795548;
  font-size: 22px;
}


.event-policy {
  max-width: 700px;
  margin: 65px auto 0;
  padding: 40px 25px;
  text-align: center;
  background: #FFFDFC;
  border: 1px solid #E8D6B9;
}

.policy-flower {
  color: #B98591;
  font-size: 27px;
}

.event-policy h3 {
  font-family: var(--font-cormorant), serif;
  color: #795548;
  font-size: 29px;
  font-weight: 500;
}

.event-policy > p:not(.policy-flower) {
  color: #806F65;
  font-size: 13px;
  line-height: 1.9;
}

.event-policy .policy-note {
  color: #A4777B;
  font-family: var(--font-cormorant), serif;
  font-size: 17px;
  font-style: italic;
  margin-top: 22px;
}
        .eventgrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
          max-width: 1200px;
          margin: 55px auto 0;
        }

        .eventcard {
          position: relative;
          background: #FFFDFC;
          padding: 38px 30px;
          min-height: 300px;
          border: 1px solid #E8D6B9;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .eventcard:hover {
          transform: translateY(-6px);
          box-shadow: 0 15px 35px rgba(89, 66, 56, 0.09);
        }

        .eventcard.featured {
          background: #F4E3E5;
          border-color: #D9B9BE;
        }

        .event-number {
          position: absolute;
          right: 25px;
          top: 18px;
          font-family: var(--font-cormorant), serif;
          font-size: 38px;
          color: #E8D6B9;
        }

        .event-date {
          font-size: 9px;
          letter-spacing: 2px;
          color: #A4777B;
        }

        .eventcard h3 {
          font-family: var(--font-cormorant), serif;
          font-size: 32px;
          font-weight: 500;
          color: #795548;
          margin: 25px 0 12px;
        }

        .eventcard p {
          font-size: 13px;
          line-height: 1.9;
          color: #806F65;
        }

        .event-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 25px;
          border-top: 1px solid #E8D6B9;
        }

        .event-footer small {
          color: #94776C;
          font-size: 10px;
          font-style: italic;
        }

        .event-footer span {
          color: #B98591;
        }

        .community {
          text-align: center;
          padding: 110px 20px;
          background: linear-gradient(135deg, #E8D6B9, #F4E3E5);
        }

        .community-content {
          max-width: 650px;
          margin: auto;
        }

        .community-content > p:not(.eyebrow) {
          color: #79665D;
          font-size: 14px;
          line-height: 2;
          max-width: 560px;
          margin: 25px auto;
        }

        .community-flower {
          font-size: 55px;
          color: #A4777B;
          margin-top: 30px;
        }

        footer {
          background: #594238;
          color: #FFFDFC;
          text-align: center;
          padding: 65px 20px 30px;
        }

        footer h2 {
          color: #FFFDFC;
          font-family: var(--font-cormorant), serif;
          font-size: 29px;
          letter-spacing: 3px;
        }

        footer h2 span {
          color: #E8D6B9;
        }

        .footer-tagline {
          font-family: var(--font-cormorant), serif;
          font-size: 19px;
          font-style: italic;
          color: #E8D6B9;
        }

        .footer-divider {
          width: 65px;
          height: 1px;
          background: #B98591;
          margin: 30px auto;
        }

        .footer-values {
          font-size: 10px;
          letter-spacing: 2px;
          color: #E8D6B9;
        }

        .copyright {
          margin-top: 45px;
          font-size: 10px;
          color: #D8BDBB;
        }

        @media (max-width: 850px) {
          .navbar {
            justify-content: center;
            text-align: center;
          }

          .navlinks {
            justify-content: center;
            gap: 20px;
          }

          .eventgrid {
            grid-template-columns: 1fr;
            max-width: 520px;
          }
        }

        @media (max-width: 600px) {
          .navbar {
            padding: 22px 15px;
          }

          .brand {
            font-size: 22px;
          }

          .navlinks {
            gap: 15px;
          }

          .navlinks a {
            font-size: 11px;
          }

          .hero {
            min-height: 540px;
            padding: 80px 20px;
          }

          .hero-decoration span:nth-child(1) {
            left: 3%;
            font-size: 35px;
          }

          .hero-decoration span:nth-child(2) {
            right: 5%;
          }

          .hero-decoration span:nth-child(3) {
            right: 3%;
            font-size: 40px;
          }

          .brand-strip {
            gap: 15px;
            font-size: 8px;
          }

          .welcome,
          .events,
          .community {
            padding: 75px 20px;
          }

          .eventcard {
            padding: 30px 24px;
          }
        }
      `}</style>

    </main>
  );
}
