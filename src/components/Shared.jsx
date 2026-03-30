import { Link } from "react-router-dom";
import { formatCurrency } from "../lib/appointments";

export function SectionHeading({ eyebrow = "MediZyra", title, subtitle, align = "left" }) {
  return (
    <div className={`section-heading section-heading-${align}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

export function MetricCard({ label, value, tone = "default" }) {
  return (
    <article className={`metric-card metric-card-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export function SummaryCard({ label, value, helper }) {
  return (
    <article className="panel summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {helper ? <p>{helper}</p> : null}
    </article>
  );
}

export function StatusBadge({ value }) {
  const normalized = value.toLowerCase().replace(/\s+/g, "-");
  return <span className={`status-pill status-${normalized}`}>{value}</span>;
}

export function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function AvatarBadge({ label, tone = "teal", size = "medium" }) {
  return (
    <div className={`avatar-badge avatar-${tone} avatar-${size}`}>
      <span>{label}</span>
    </div>
  );
}

export function DoctorIdentity({ doctor, size = "medium" }) {
  if (doctor.photo) {
    return (
      <img
        className={`doctor-photo doctor-photo-${size}`}
        src={doctor.photo}
        alt={`${doctor.name} specialist portrait`}
        loading="lazy"
      />
    );
  }

  return <AvatarBadge label={doctor.avatarLabel} tone={doctor.tone} size={size} />;
}

export function DoctorCard({ doctor }) {
  return (
    <article className={`panel doctor-card doctor-card-${doctor.tone}`}>
      <div className="doctor-card-top">
        <DoctorIdentity doctor={doctor} />
        <div>
          <span className="badge">{doctor.specialty}</span>
          <h3>{doctor.name}</h3>
          <p>{doctor.clinic}</p>
        </div>
      </div>

      <p className="doctor-blurb">{doctor.intro}</p>

      <div className="doctor-meta">
        <span>{doctor.experience}</span>
        <span>{doctor.location}</span>
        <span>{formatCurrency(doctor.fee)}</span>
      </div>

      <div className="chip-row">
        {doctor.focusAreas.map((area) => (
          <span className="chip" key={area}>
            {area}
          </span>
        ))}
      </div>

      <div className="card-actions">
        <span className="muted-copy">Next opening: {doctor.nextAvailable}</span>
        <Link className="button button-inline" to={`/doctors/${doctor.id}`}>
          Review care desk
        </Link>
      </div>
    </article>
  );
}

export function EmptyState({ action, description, title }) {
  return (
    <article className="panel empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </article>
  );
}
