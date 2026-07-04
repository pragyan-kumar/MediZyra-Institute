import { useState } from "react";
import { SectionHeading } from "./Shared";
import { formatFriendlyDateTime } from "../lib/appointments";

const DOCTOR_FORM_TEMPLATE = {
  doctorId: "",
  name: "",
  specialty: "",
  clinic: "",
  experience: "",
  fee: "",
  location: "",
  languages: "",
  focusAreas: "",
  credentials: "",
  intro: "",
  about: "",
  tone: "teal",
  email: "",
  phone: "",
  availabilityDate: "2026-03-30",
};

function createDoctorFormState(doctor, users) {
  if (!doctor) {
    return DOCTOR_FORM_TEMPLATE;
  }

  const linkedUser = users.find((user) => user.linkedDoctorId === doctor.id);

  return {
    doctorId: doctor.id,
    name: doctor.name,
    specialty: doctor.specialty,
    clinic: doctor.clinic,
    experience: doctor.experience,
    fee: String(doctor.fee),
    location: doctor.location,
    languages: Array.isArray(doctor.languages) ? doctor.languages.join(", ") : "",
    focusAreas: Array.isArray(doctor.focusAreas) ? doctor.focusAreas.join(", ") : "",
    credentials: doctor.credentials,
    intro: doctor.intro,
    about: doctor.about,
    tone: doctor.tone,
    email: linkedUser?.email ?? "",
    phone: linkedUser?.phone ?? "",
    availabilityDate: doctor.schedule?.[0]?.date ?? DOCTOR_FORM_TEMPLATE.availabilityDate,
  };
}

function ContactMessageCard({ message }) {
  return (
    <article className="panel support-ticket-card">
      <div className="portal-card-head">
        <div>
          <span className="badge">{message.category}</span>
          <h3>{message.subject}</h3>
          <p>{message.name}</p>
        </div>
        <div className="portal-meta">
          <span>{message.submittedByRole}</span>
          <span>{formatFriendlyDateTime(message.createdAt)}</span>
        </div>
      </div>
      <div className="portal-grid">
        <div>
          <strong>Email</strong>
          <p>{message.email}</p>
        </div>
        <div>
          <strong>Phone</strong>
          <p>{message.phone || "Not provided"}</p>
        </div>
      </div>
      <p>{message.message}</p>
    </article>
  );
}

export function DoctorManagementPanel({ doctors, saveDoctorProfile, users }) {
  const [selectedDoctorId, setSelectedDoctorId] = useState("new");
  const [form, setForm] = useState(DOCTOR_FORM_TEMPLATE);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleDoctorSelection = (event) => {
    const doctorId = event.target.value;
    setSelectedDoctorId(doctorId);
    setFeedback("");
    setError("");

    if (doctorId === "new") {
      setForm(DOCTOR_FORM_TEMPLATE);
      return;
    }

    const doctor = doctors.find((item) => item.id === doctorId);
    setForm(createDoctorFormState(doctor, users));
  };

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback("");
    setError("");
    setIsSaving(true);

    const result = await saveDoctorProfile(form);
    if (!result.ok) {
      setError(result.error);
      setIsSaving(false);
      return;
    }

    setFeedback(result.message);
    if (!form.doctorId) {
      setSelectedDoctorId("new");
      setForm(DOCTOR_FORM_TEMPLATE);
    }
    setIsSaving(false);
  };

  return (
    <article className="panel admin-doctor-panel">
      <SectionHeading
        eyebrow="Admin controls"
        title="Manage specialist profiles"
        subtitle="Add a new doctor or update an existing profile so listings, fees, and portal-linked details stay accurate."
      />

      <label className="field-block">
        <span>Choose profile</span>
        <select className="text-input" value={selectedDoctorId} onChange={handleDoctorSelection}>
          <option value="new">Add new doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name}
            </option>
          ))}
        </select>
      </label>

      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field-block">
            <span>Name</span>
            <input className="text-input" value={form.name} onChange={updateField("name")} />
          </label>
          <label className="field-block">
            <span>Specialty</span>
            <input
              className="text-input"
              value={form.specialty}
              onChange={updateField("specialty")}
            />
          </label>
          <label className="field-block">
            <span>Clinic</span>
            <input className="text-input" value={form.clinic} onChange={updateField("clinic")} />
          </label>
          <label className="field-block">
            <span>Experience</span>
            <input
              className="text-input"
              value={form.experience}
              onChange={updateField("experience")}
              placeholder="e.g. 12 years"
            />
          </label>
          <label className="field-block">
            <span>Fee</span>
            <input
              className="text-input"
              type="number"
              min="1"
              value={form.fee}
              onChange={updateField("fee")}
            />
          </label>
          <label className="field-block">
            <span>Location</span>
            <input
              className="text-input"
              value={form.location}
              onChange={updateField("location")}
            />
          </label>
          <label className="field-block">
            <span>Doctor email</span>
            <input
              className="text-input"
              type="email"
              value={form.email}
              onChange={updateField("email")}
            />
          </label>
          <label className="field-block">
            <span>Doctor phone</span>
            <input className="text-input" value={form.phone} onChange={updateField("phone")} />
          </label>
          <label className="field-block">
            <span>Availability date</span>
            <input
              className="text-input"
              type="date"
              value={form.availabilityDate}
              onChange={updateField("availabilityDate")}
            />
          </label>
          <label className="field-block">
            <span>Color tone</span>
            <select className="text-input" value={form.tone} onChange={updateField("tone")}>
              <option value="teal">Teal</option>
              <option value="coral">Coral</option>
              <option value="gold">Gold</option>
              <option value="navy">Navy</option>
            </select>
          </label>
          <label className="field-block form-grid-span">
            <span>Languages</span>
            <input
              className="text-input"
              value={form.languages}
              onChange={updateField("languages")}
              placeholder="English, Hindi"
            />
          </label>
          <label className="field-block form-grid-span">
            <span>Focus areas</span>
            <input
              className="text-input"
              value={form.focusAreas}
              onChange={updateField("focusAreas")}
              placeholder="Migraine pathway, Sleep review"
            />
          </label>
          <label className="field-block form-grid-span">
            <span>Credentials</span>
            <input
              className="text-input"
              value={form.credentials}
              onChange={updateField("credentials")}
            />
          </label>
        </div>

        <label className="field-block">
          <span>Short intro</span>
          <textarea
            className="text-input textarea"
            rows="3"
            value={form.intro}
            onChange={updateField("intro")}
          />
        </label>

        <label className="field-block">
          <span>About</span>
          <textarea
            className="text-input textarea"
            rows="4"
            value={form.about}
            onChange={updateField("about")}
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}
        {feedback ? <p className="form-success">{feedback}</p> : null}

        <button className="button button-primary" disabled={isSaving} type="submit">
          {isSaving ? "Saving profile..." : "Save doctor profile"}
        </button>
      </form>
      <p className="muted-copy">
        New doctor accounts use the default password <code>Doctor@123</code> until you
        change it in the account workflow.
      </p>
    </article>
  );
}

export function ContactInbox({ contactMessages }) {
  if (!contactMessages.length) {
    return (
      <article className="panel">
        <SectionHeading
          eyebrow="Support inbox"
          title="No patient messages yet"
          subtitle="Questions and service feedback submitted from the contact page will appear here for admins."
        />
      </article>
    );
  }

  return (
    <article className="panel admin-contact-panel">
      <SectionHeading
        eyebrow="Support inbox"
        title="Patient questions and feedback"
        subtitle="Admins can review patient concerns, service doubts, and support requests from the contact desk."
      />
      <div className="support-ticket-list">
        {contactMessages.map((message) => (
          <ContactMessageCard key={message.id} message={message} />
        ))}
      </div>
    </article>
  );
}
