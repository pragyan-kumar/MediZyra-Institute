import { Link } from "react-router-dom";
import medVid from "../assets/med-vid.mp4";
import {
  formalFeatures,
  platformHighlights,
  roleCards,
} from "../data/siteData";
import { useAppContext } from "../context/useAppContext";
import { isUpcomingAppointment } from "../lib/appointments";
import { DoctorCard, MetricCard, SectionHeading } from "../components/Shared";

export default function HomePage() {
  const { appointments, doctors, users } = useAppContext();
  const featuredDoctors = doctors.slice(0, 3);
  const patientCount = users.filter((user) => user.role === "patient").length;
  const requestedCount = appointments.filter(
    (appointment) => appointment.status === "Requested",
  ).length;
  const upcomingCount = appointments.filter(isUpcomingAppointment).length;

  return (
    <>
      <section className="hero-section">
        <div aria-hidden="true" className="hero-video-backdrop">
          <video autoPlay className="hero-bg-video hero-bg-video-active" loop muted playsInline>
            <source src={medVid} type="video/mp4" />
          </video>
          <div className="hero-video-overlay" />
        </div>

        <div className="container hero-stage">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Integrated patient care coordination</p>
              <h2>
                MediZyra turns appointments, triage, and doctor follow-up into one
                clean care operations workspace.
              </h2>
              <p className="lead">
                This version keeps the real hospital roles from the earlier HMS concept,
                but changes the visual identity and the flow itself: patients send care
                requests, admins triage them, and doctors complete visits with digital
                summaries and prescriptions.
              </p>
              <div className="hero-actions">
                <Link className="button button-primary" to="/doctors">
                  Browse specialists
                </Link>
                <Link className="button button-secondary" to="/signin">
                  Sign in
                </Link>
              </div>
              <div className="metric-strip">
                <MetricCard label="Specialists live" value={`${doctors.length}`} tone="teal" />
                <MetricCard label="Patients stored" value={`${patientCount}`} tone="gold" />
                <MetricCard label="Open care requests" value={`${requestedCount}`} tone="coral" />
                <MetricCard label="Upcoming visits" value={`${upcomingCount}`} tone="navy" />
              </div>
            </div>

            <div className="hero-visual panel">
              <div className="hero-board">
                <div className="hero-board-header">
                  <span className="badge">Live care dashboard</span>
                  <strong>Triage flow</strong>
                </div>
                <div className="hero-board-grid">
                  <article className="hero-mini-card">
                    <span>Step 1</span>
                    <strong>Patient request</strong>
                    <p>Email login and slot selection from the doctor profile.</p>
                  </article>
                  <article className="hero-mini-card">
                    <span>Step 2</span>
                    <strong>Admin review</strong>
                    <p>Requests are confirmed, rescheduled, or cancelled with intake notes.</p>
                  </article>
                  <article className="hero-mini-card">
                    <span>Step 3</span>
                    <strong>Doctor closure</strong>
                    <p>Doctors save clinical notes, prescriptions, and follow-up plans.</p>
                  </article>
                  <article className="hero-mini-card hero-highlight">
                    <span>Result</span>
                    <strong>Patient timeline</strong>
                    <p>Every visit becomes part of the patient's medical history record.</p>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            title="Platform modules"
            subtitle="Designed to support modern hospital coordination with clear patient, admin, and doctor workflows."
          />
          <div className="card-grid four-up">
            {platformHighlights.map((item) => (
              <article className="panel feature-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section muted-section">
        <div className="container">
          <SectionHeading
            title="Role-led care flow"
            subtitle="Each workspace is tailored to the responsibilities of patients, administrators, and doctors."
          />
          <div className="card-grid three-up">
            {roleCards.map((roleCard) => (
              <article className="panel role-card" key={roleCard.role}>
                <span className="badge">{roleCard.badge}</span>
                <h3>{roleCard.role}</h3>
                <ul className="clean-list">
                  {roleCard.capabilities.map((capability) => (
                    <li key={capability}>{capability}</li>
                  ))}
                </ul>
                <Link className="button button-inline" to="/portal">
                  Open {roleCard.role.toLowerCase()} portal
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split-section">
          <div className="split-section-full">
            <SectionHeading
              title="Professional care platform features"
              subtitle="MediZyra is designed to feel like a polished healthcare service website while still supporting practical care operations behind the scenes."
            />
            <div className="card-grid three-up">
              {formalFeatures.map((item) => (
                <article className="panel feature-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section muted-section">
        <div className="container">
          <SectionHeading
            title="Care desk lineup"
            subtitle="These specialists anchor the core booking and consultation flows in the demo."
          />
          <div className="card-grid three-up">
            {featuredDoctors.map((doctor) => (
              <DoctorCard doctor={doctor} key={doctor.id} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
