import { useState } from "react";
import { brand } from "../data/siteData";
import { useAppContext } from "../context/useAppContext";
import { SectionHeading } from "../components/Shared";

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  category: "General question",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const { currentUser, submitContactMessage } = useAppContext();
  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    name: currentUser?.name ?? "",
    email: currentUser?.email ?? "",
    phone: currentUser?.phone ?? "",
  }));
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback("");
    setError("");
    setIsSubmitting(true);

    const result = await submitContactMessage(form);
    if (!result.ok) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setFeedback("Your message has been sent to the care support desk.");
    setForm((current) => ({
      ...INITIAL_FORM,
      name: currentUser?.name ?? current.name,
      email: currentUser?.email ?? current.email,
      phone: currentUser?.phone ?? current.phone,
    }));
    setIsSubmitting(false);
  };

  return (
    <section className="section">
      <div className="container detail-grid">
        <article className="panel contact-panel">
          <SectionHeading
            eyebrow="Patient support"
            title="Contact the MediZyra care desk"
            subtitle="Send a service question, concern, or support request and the admin team will see it inside the portal."
          />

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field-block">
                <span>Full name</span>
                <input
                  className="text-input"
                  type="text"
                  value={form.name}
                  onChange={updateField("name")}
                  placeholder="Enter your name"
                />
              </label>

              <label className="field-block">
                <span>Email</span>
                <input
                  className="text-input"
                  type="email"
                  value={form.email}
                  onChange={updateField("email")}
                  placeholder="Enter your email"
                />
              </label>

              <label className="field-block">
                <span>Mobile number</span>
                <input
                  className="text-input"
                  type="tel"
                  value={form.phone}
                  onChange={updateField("phone")}
                  placeholder="Enter your contact number"
                />
              </label>

              <label className="field-block">
                <span>Category</span>
                <select
                  className="text-input"
                  value={form.category}
                  onChange={updateField("category")}
                >
                  <option>General question</option>
                  <option>Appointment help</option>
                  <option>Billing query</option>
                  <option>Technical issue</option>
                  <option>Feedback</option>
                </select>
              </label>
            </div>

            <label className="field-block">
              <span>Subject</span>
              <input
                className="text-input"
                type="text"
                value={form.subject}
                onChange={updateField("subject")}
                placeholder="Short summary of your request"
              />
            </label>

            <label className="field-block">
              <span>Message</span>
              <textarea
                className="text-input textarea"
                rows="6"
                value={form.message}
                onChange={updateField("message")}
                placeholder="Share your question, doubt, or feedback in detail."
              />
            </label>

            {error ? <p className="form-error">{error}</p> : null}
            {feedback ? <p className="form-success">{feedback}</p> : null}

            <button className="button button-primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Sending..." : "Send to support desk"}
            </button>
          </form>
        </article>

        <article className="panel contact-info-card">
          <SectionHeading
            eyebrow="Reach us"
            title="Support details"
            subtitle="Patients can use the contact form for help related to services, scheduling, and platform questions."
          />
          <div className="stack-list">
            <article className="panel stack-card contact-note-card">
              <h3>Care support line</h3>
              <p>{brand.emergencyLine}</p>
            </article>
            <article className="panel stack-card contact-note-card">
              <h3>Email support</h3>
              <p>{brand.email}</p>
            </article>
            <article className="panel stack-card contact-note-card">
              <h3>Address</h3>
              <p>{brand.address}</p>
            </article>
          </div>
        </article>
      </div>
    </section>
  );
}
