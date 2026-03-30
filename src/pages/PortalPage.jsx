import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, SectionHeading, StatusBadge, SummaryCard } from "../components/Shared";
import { useAppContext } from "../context/useAppContext";
import {
  formatCurrency,
  formatFriendlyDate,
  formatFriendlyDateTime,
  isUpcomingAppointment,
  sortAppointmentsNewestFirst,
} from "../lib/appointments";

const STATUS_OPTIONS = ["All", "Requested", "Confirmed", "Completed", "Cancelled"];
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
    languages: doctor.languages.join(", "),
    focusAreas: doctor.focusAreas.join(", "),
    credentials: doctor.credentials,
    intro: doctor.intro,
    about: doctor.about,
    tone: doctor.tone,
    email: linkedUser?.email ?? "",
    phone: linkedUser?.phone ?? "",
    availabilityDate: doctor.schedule?.[0]?.date ?? DOCTOR_FORM_TEMPLATE.availabilityDate,
  };
}

function filterAppointments(appointments, searchTerm, statusFilter) {
  const normalizedQuery = searchTerm.trim().toLowerCase();

  return appointments.filter((appointment) => {
    const matchesStatus =
      statusFilter === "All" || appointment.status === statusFilter;
    const matchesQuery =
      !normalizedQuery ||
      appointment.patientName.toLowerCase().includes(normalizedQuery) ||
      appointment.patientEmail.toLowerCase().includes(normalizedQuery) ||
      appointment.phone.toLowerCase().includes(normalizedQuery) ||
      appointment.reason.toLowerCase().includes(normalizedQuery) ||
      appointment.symptoms.toLowerCase().includes(normalizedQuery) ||
      appointment.doctorName.toLowerCase().includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });
}

function PortalToolbar({
  label,
  placeholder,
  searchValue,
  statusValue,
  onSearchChange,
  onStatusChange,
}) {
  return (
    <div className="panel filter-bar portal-toolbar">
      <label className="field-block">
        <span>{label}</span>
        <input
          className="text-input"
          type="search"
          value={searchValue}
          onChange={onSearchChange}
          placeholder={placeholder}
        />
      </label>

      <label className="field-block">
        <span>Status</span>
        <select className="text-input" value={statusValue} onChange={onStatusChange}>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function AdminAppointmentCard({ appointment, doctor, onSave }) {
  const [form, setForm] = useState({
    appointmentDate: appointment.appointmentDate,
    appointmentSlot: appointment.appointmentSlot,
    consultationMode: appointment.consultationMode,
    adminSummary: appointment.adminSummary,
  });
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const schedule = doctor?.schedule ?? [];
  const activeSchedule =
    schedule.find((slot) => slot.date === form.appointmentDate) ?? schedule[0];

  const updateField = (field) => (event) => {
    const value = event.target.value;

    if (field === "appointmentDate") {
      const nextSchedule =
        schedule.find((slot) => slot.date === value) ?? schedule[0];
      setForm((current) => ({
        ...current,
        appointmentDate: value,
        appointmentSlot: nextSchedule?.slots?.[0] ?? "",
      }));
      return;
    }

    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitChange = async (status) => {
    setIsSaving(true);
    const result = await onSave({
      appointmentId: appointment.id,
      status,
      ...form,
    });

    setFeedback(result.ok ? `Request marked ${status.toLowerCase()}.` : result.error);
    setIsSaving(false);
  };

  return (
    <article className="panel portal-card">
      <div className="portal-card-head">
        <div>
          <StatusBadge value={appointment.status} />
          <h3>{appointment.patientName}</h3>
          <p>
            {appointment.doctorName} | {appointment.specialty}
          </p>
        </div>
        <div className="portal-meta">
          <span>{appointment.priority}</span>
          <span>{appointment.consultationMode}</span>
        </div>
      </div>

      <div className="portal-grid">
        <div>
          <strong>Patient contact</strong>
          <p>{appointment.patientEmail}</p>
          <p>{appointment.phone}</p>
        </div>
        <div>
          <strong>Visit window</strong>
          <p>{formatFriendlyDate(appointment.appointmentDate)}</p>
          <p>{appointment.appointmentSlot}</p>
        </div>
        <div>
          <strong>Reason</strong>
          <p>{appointment.reason}</p>
        </div>
        <div>
          <strong>Symptoms</strong>
          <p>{appointment.symptoms}</p>
        </div>
      </div>

      <div className="form-grid portal-form-grid">
        <label className="field-block">
          <span>Date</span>
          <select
            className="text-input"
            value={form.appointmentDate}
            onChange={updateField("appointmentDate")}
          >
            {schedule.map((slot) => (
              <option key={slot.date} value={slot.date}>
                {slot.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field-block">
          <span>Slot</span>
          <select
            className="text-input"
            value={form.appointmentSlot}
            onChange={updateField("appointmentSlot")}
          >
            {activeSchedule?.slots?.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </label>

        <label className="field-block">
          <span>Mode</span>
          <select
            className="text-input"
            value={form.consultationMode}
            onChange={updateField("consultationMode")}
          >
            <option>In-clinic</option>
            <option>Tele-consult</option>
          </select>
        </label>
      </div>

      <label className="field-block">
        <span>Admin intake note</span>
        <textarea
          className="text-input textarea"
          rows="3"
          value={form.adminSummary}
          onChange={updateField("adminSummary")}
        />
      </label>

      {feedback ? <p className="portal-feedback">{feedback}</p> : null}

      <div className="card-actions">
        <button
          className="button button-primary"
          disabled={isSaving}
          type="button"
          onClick={() => submitChange("Confirmed")}
        >
          {isSaving ? "Saving..." : "Confirm slot"}
        </button>
        <button
          className="button button-secondary"
          disabled={isSaving}
          type="button"
          onClick={() => submitChange("Cancelled")}
        >
          Cancel request
        </button>
      </div>
    </article>
  );
}

function DoctorAppointmentCard({ appointment, doctorFee, onComplete }) {
  const [doctorSummary, setDoctorSummary] = useState(appointment.doctorSummary);
  const [prescriptionItems, setPrescriptionItems] = useState(
    appointment.prescription.join(", "),
  );
  const [followUpDate, setFollowUpDate] = useState(appointment.followUpDate);
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleComplete = async () => {
    setIsSaving(true);
    const result = await onComplete({
      appointmentId: appointment.id,
      doctorSummary,
      followUpDate,
      prescriptionItems,
    });

    setFeedback(result.ok ? "Consultation saved to patient history." : result.error);
    setIsSaving(false);
  };

  return (
    <article className="panel portal-card">
      <div className="portal-card-head">
        <div>
          <StatusBadge value={appointment.status} />
          <h3>{appointment.patientName}</h3>
          <p>
            {formatFriendlyDate(appointment.appointmentDate)} at {appointment.appointmentSlot}
          </p>
        </div>
        <div className="portal-meta">
          <span>{appointment.priority}</span>
          <span>{appointment.consultationMode}</span>
        </div>
      </div>

      <div className="portal-grid">
        <div>
          <strong>Patient contact</strong>
          <p>{appointment.patientEmail}</p>
          <p>{appointment.phone}</p>
        </div>
        <div>
          <strong>Consultation fee</strong>
          <p>{formatCurrency(doctorFee)}</p>
        </div>
        <div>
          <strong>Patient reason</strong>
          <p>{appointment.reason}</p>
        </div>
        <div>
          <strong>Intake note</strong>
          <p>{appointment.adminSummary || "No admin note added yet."}</p>
        </div>
      </div>

      <label className="field-block">
        <span>Consultation summary</span>
        <textarea
          className="text-input textarea"
          rows="4"
          value={doctorSummary}
          onChange={(event) => setDoctorSummary(event.target.value)}
        />
      </label>

      <div className="form-grid portal-form-grid">
        <label className="field-block">
          <span>Prescription items</span>
          <input
            className="text-input"
            type="text"
            value={prescriptionItems}
            onChange={(event) => setPrescriptionItems(event.target.value)}
            placeholder="Comma-separated medicines or advice"
          />
        </label>

        <label className="field-block">
          <span>Follow-up date</span>
          <input
            className="text-input"
            type="date"
            value={followUpDate}
            onChange={(event) => setFollowUpDate(event.target.value)}
          />
        </label>
      </div>

      {feedback ? <p className="portal-feedback">{feedback}</p> : null}

      <div className="card-actions">
        <button className="button button-primary" disabled={isSaving} type="button" onClick={handleComplete}>
          {isSaving ? "Saving..." : "Save consultation"}
        </button>
      </div>
    </article>
  );
}

function PatientHistoryCard({ appointment, doctorFee }) {
  return (
    <article className="panel portal-card">
      <div className="portal-card-head">
        <div>
          <StatusBadge value={appointment.status} />
          <h3>{appointment.doctorName}</h3>
          <p>{appointment.specialty}</p>
        </div>
        <div className="portal-meta">
          <span>{appointment.consultationMode}</span>
          <span>{appointment.priority}</span>
        </div>
      </div>

      <div className="portal-grid">
        <div>
          <strong>Visit window</strong>
          <p>
            {formatFriendlyDate(appointment.appointmentDate)} at {appointment.appointmentSlot}
          </p>
        </div>
        <div>
          <strong>Consultation fee</strong>
          <p>{formatCurrency(doctorFee)}</p>
        </div>
        <div>
          <strong>Requested for</strong>
          <p>{appointment.reason}</p>
        </div>
        <div>
          <strong>Doctor contact</strong>
          <p>{appointment.doctorName}</p>
          <p>{appointment.specialty}</p>
        </div>
      </div>

      <div className="detail-stack">
        <div>
          <strong>Triage note</strong>
          <p>{appointment.adminSummary || "Pending admin review."}</p>
        </div>
        <div>
          <strong>Doctor note</strong>
          <p>{appointment.doctorSummary || "This visit has not been completed yet."}</p>
        </div>
      </div>

      {appointment.prescription.length ? (
        <div className="chip-row">
          {appointment.prescription.map((item) => (
            <span className="chip" key={item}>
              {item}
            </span>
          ))}
        </div>
      ) : null}

      {appointment.followUpDate ? (
        <p className="muted-copy">
          Follow-up scheduled for {formatFriendlyDate(appointment.followUpDate)}
        </p>
      ) : null}
    </article>
  );
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

function DoctorManagementPanel({ doctors, saveDoctorProfile, users }) {
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

function ContactInbox({ contactMessages }) {
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

function AdminPortal({ appointments, contactMessages, doctors, onSave, saveDoctorProfile, users }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const deferredSearch = useDeferredValue(searchTerm);
  const filteredAppointments = useMemo(
    () =>
      filterAppointments(sortAppointmentsNewestFirst(appointments), deferredSearch, statusFilter),
    [appointments, deferredSearch, statusFilter],
  );

  return (
    <>
      <div className="summary-grid">
        <SummaryCard
          label="Doctors onboarded"
          value={doctors.length}
          helper="Active specialists in the roster"
        />
        <SummaryCard
          label="Requested queue"
          value={appointments.filter((item) => item.status === "Requested").length}
          helper="Needs triage"
        />
        <SummaryCard
          label="Confirmed visits"
          value={appointments.filter((item) => item.status === "Confirmed").length}
          helper="Ready for doctor review"
        />
        <SummaryCard
          label="Support inbox"
          value={contactMessages.length}
          helper="Patient messages waiting for admin review"
        />
      </div>

      <PortalToolbar
        label="Search patient requests"
        placeholder="Search by patient name, email, phone, reason, or doctor..."
        searchValue={searchTerm}
        statusValue={statusFilter}
        onSearchChange={(event) => {
          const nextValue = event.target.value;
          startTransition(() => setSearchTerm(nextValue));
        }}
        onStatusChange={(event) => setStatusFilter(event.target.value)}
      />

      {filteredAppointments.length ? (
        <div className="portal-list">
          {filteredAppointments.map((appointment) => (
            <AdminAppointmentCard
              appointment={appointment}
              doctor={doctors.find((doctor) => doctor.id === appointment.doctorId)}
              key={appointment.id}
              onSave={onSave}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No matching requests"
          description="Try a different search term or switch the status filter to view more patient requests."
        />
      )}

      <div className="portal-admin-grid">
        <DoctorManagementPanel
          doctors={doctors}
          saveDoctorProfile={saveDoctorProfile}
          users={users}
        />
        <ContactInbox contactMessages={contactMessages} />
      </div>
    </>
  );
}

function DoctorPortal({ appointments, doctors, onComplete, currentUser }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const deferredSearch = useDeferredValue(searchTerm);
  const filteredAppointments = useMemo(
    () =>
      filterAppointments(sortAppointmentsNewestFirst(appointments), deferredSearch, statusFilter),
    [appointments, deferredSearch, statusFilter],
  );

  const doctorProfile = doctors.find((doctor) => doctor.id === currentUser.linkedDoctorId);
  const doctorFee = doctorProfile?.fee ?? 0;
  const upcomingRevenue = appointments
    .filter((appointment) => appointment.status === "Confirmed" && isUpcomingAppointment(appointment))
    .reduce((total) => total + doctorFee, 0);
  const totalEarned = appointments
    .filter((appointment) => appointment.status === "Completed")
    .reduce((total) => total + doctorFee, 0);

  if (!appointments.length) {
    return (
      <EmptyState
        title="No assigned appointments"
        description="Confirmed appointments for this doctor will appear here with patient context and intake notes."
      />
    );
  }

  return (
    <>
      <div className="summary-grid">
        <SummaryCard
          label="Assigned queue"
          value={appointments.length}
          helper="Visible only for this doctor account"
        />
        <SummaryCard
          label="Upcoming visits"
          value={appointments.filter(isUpcomingAppointment).length}
          helper="Appointments still ahead of the care calendar"
        />
        <SummaryCard
          label="Upcoming patient pay"
          value={formatCurrency(upcomingRevenue)}
          helper="Expected from upcoming confirmed appointments"
        />
        <SummaryCard
          label="Total earned"
          value={formatCurrency(totalEarned)}
          helper="Completed consultation earnings so far"
        />
      </div>

      <PortalToolbar
        label="Search patient details"
        placeholder="Search by patient name, email, phone, reason, or symptoms..."
        searchValue={searchTerm}
        statusValue={statusFilter}
        onSearchChange={(event) => {
          const nextValue = event.target.value;
          startTransition(() => setSearchTerm(nextValue));
        }}
        onStatusChange={(event) => setStatusFilter(event.target.value)}
      />

      {filteredAppointments.length ? (
        <div className="portal-list">
          {filteredAppointments.map((appointment) => (
            <DoctorAppointmentCard
              appointment={appointment}
              doctorFee={doctorFee}
              key={appointment.id}
              onComplete={onComplete}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No matching patient cards"
          description="Try a different search term or switch the status filter to see more appointments."
        />
      )}
    </>
  );
}

function PatientPortal({ appointments, currentUser, doctors }) {
  if (!appointments.length) {
    return (
      <EmptyState
        title="No appointments yet"
        description="Book your first specialist visit and the request will appear here for tracking."
        action={
          <Link className="button button-primary" to="/doctors">
            Browse specialists
          </Link>
        }
      />
    );
  }

  const sortedAppointments = sortAppointmentsNewestFirst(appointments);
  const nextAppointment = sortedAppointments.find(isUpcomingAppointment);
  const completedCount = appointments.filter(
    (appointment) => appointment.status === "Completed",
  ).length;

  return (
    <>
      <div className="summary-grid">
        <SummaryCard
          label="Logged in as"
          value={currentUser.email}
          helper="Patient account"
        />
        <SummaryCard
          label="Upcoming visit"
          value={nextAppointment ? formatFriendlyDate(nextAppointment.appointmentDate) : "None"}
          helper={nextAppointment ? nextAppointment.doctorName : "Book a specialist"}
        />
        <SummaryCard
          label="Completed visits"
          value={completedCount}
          helper="Saved with notes and prescriptions"
        />
      </div>

      <div className="portal-list">
        {sortedAppointments.map((appointment) => {
          const doctorFee =
            doctors.find((doctor) => doctor.id === appointment.doctorId)?.fee ?? 0;

          return (
            <PatientHistoryCard
              appointment={appointment}
              doctorFee={doctorFee}
              key={appointment.id}
            />
          );
        })}
      </div>
    </>
  );
}

export default function PortalPage() {
  const {
    appointments,
    backendError,
    completeAppointmentByDoctor,
    contactMessages,
    currentUser,
    doctors,
    isHydrating,
    saveDoctorProfile,
    updateAppointmentByAdmin,
    users,
  } = useAppContext();

  if (isHydrating) {
    return (
      <section className="section">
        <div className="container">
          <EmptyState
            title="Loading portal workspace"
            description="The portal is syncing the latest records before opening your dashboard."
          />
        </div>
      </section>
    );
  }

  if (!currentUser) {
    return (
      <section className="section">
        <div className="container">
          <EmptyState
            title="Sign in to open the portal"
            description="The portal changes based on role, so use the seeded email accounts or create a patient account first."
            action={
              <Link className="button button-primary" to="/signin">
                Go to sign in
              </Link>
            }
          />
        </div>
      </section>
    );
  }

  const portalAppointments =
    currentUser.role === "admin"
      ? appointments
      : currentUser.role === "doctor"
        ? appointments.filter(
            (appointment) => appointment.doctorId === currentUser.linkedDoctorId,
          )
        : appointments.filter((appointment) => appointment.patientId === currentUser.id);

  return (
    <section className="section">
      <div className="container">
        <SectionHeading
          eyebrow={`${currentUser.role} workspace`}
          title={`Welcome back, ${currentUser.name}`}
          subtitle={`Last activity synced ${formatFriendlyDateTime(
            new Date().toISOString(),
          )} in your Mongo-backed care workspace.`}
        />

        {backendError ? (
          <article className="panel">
            <p className="muted-copy">
              Backend sync warning: {backendError}
            </p>
          </article>
        ) : null}

        {currentUser.role === "admin" ? (
          <AdminPortal
            appointments={portalAppointments}
            contactMessages={contactMessages}
            doctors={doctors}
            onSave={updateAppointmentByAdmin}
            saveDoctorProfile={saveDoctorProfile}
            users={users}
          />
        ) : null}

        {currentUser.role === "doctor" ? (
          <DoctorPortal
            appointments={portalAppointments}
            currentUser={currentUser}
            doctors={doctors}
            onComplete={completeAppointmentByDoctor}
          />
        ) : null}

        {currentUser.role === "patient" ? (
          <PatientPortal
            appointments={portalAppointments}
            currentUser={currentUser}
            doctors={doctors}
          />
        ) : null}
      </div>
    </section>
  );
}
