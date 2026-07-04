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

function safeText(value, fallback = "") {
  return typeof value === "string" ? value : value == null ? fallback : String(value);
}

function filterAppointments(appointments, searchTerm, statusFilter) {
  const normalizedQuery = searchTerm.trim().toLowerCase();

  return appointments.filter((appointment) => {
    const matchesStatus =
      statusFilter === "All" || appointment.status === statusFilter;
    const matchesQuery =
      !normalizedQuery ||
      safeText(appointment.patientName).toLowerCase().includes(normalizedQuery) ||
      safeText(appointment.patientEmail).toLowerCase().includes(normalizedQuery) ||
      safeText(appointment.phone).toLowerCase().includes(normalizedQuery) ||
      safeText(appointment.reason).toLowerCase().includes(normalizedQuery) ||
      safeText(appointment.symptoms).toLowerCase().includes(normalizedQuery) ||
      safeText(appointment.doctorName).toLowerCase().includes(normalizedQuery);

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
  const canEditDetails = ["Requested", "Confirmed"].includes(appointment.status);
  const canConfirm = appointment.status === "Requested";
  const canCancel = appointment.status === "Requested" || appointment.status === "Confirmed";
  const canSaveEdits = canEditDetails;

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

  const submitChange = async (status, successMessage) => {
    setIsSaving(true);
    const result = await onSave({
      appointmentId: appointment.id,
      status,
      ...form,
    });

    setFeedback(result.ok ? successMessage : result.error);
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
            disabled={!canEditDetails}
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
            disabled={!canEditDetails}
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
            disabled={!canEditDetails}
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
          disabled={!canEditDetails}
          rows="3"
          value={form.adminSummary}
          onChange={updateField("adminSummary")}
        />
      </label>

      {feedback ? <p className="portal-feedback">{feedback}</p> : null}

      <div className="card-actions">
        {canSaveEdits ? (
          <button
            className="button button-secondary"
            disabled={isSaving}
            type="button"
            onClick={() => submitChange(appointment.status, "Appointment changes saved.")}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        ) : null}
        {canConfirm ? (
          <button
            className="button button-primary"
            disabled={isSaving}
            type="button"
            onClick={() => submitChange("Confirmed", "Request marked confirmed.")}
          >
            {isSaving ? "Saving..." : "Confirm slot"}
          </button>
        ) : null}
        {canCancel ? (
          <button
            className="button button-secondary"
            disabled={isSaving}
            type="button"
            onClick={() => submitChange("Cancelled", "Request marked cancelled.")}
          >
            Cancel request
          </button>
        ) : null}
        {!canConfirm && !canCancel ? (
          <p className="muted-copy">
            {appointment.status === "Completed"
              ? "Completed visits can no longer be cancelled or re-triaged."
              : "This appointment is no longer editable from admin triage."}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function DoctorAppointmentCard({ appointment, doctorFee, onUpdate }) {
  const [doctorSummary, setDoctorSummary] = useState(appointment.doctorSummary);
  const [prescriptionItems, setPrescriptionItems] = useState(
    appointment.prescription.join(", "),
  );
  const [followUpDate, setFollowUpDate] = useState(appointment.followUpDate);
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const canConfirm = appointment.status === "Requested";
  const canComplete = appointment.status === "Confirmed";
  const fieldsDisabled = !canComplete;

  const handleDoctorAction = async (status) => {
    setIsSaving(true);
    const result = await onUpdate(
      status === "Confirmed"
        ? {
            appointmentId: appointment.id,
            status,
          }
        : {
            appointmentId: appointment.id,
            doctorSummary,
            followUpDate,
            prescriptionItems,
            status,
          },
    );

    setFeedback(
      result.ok
        ? status === "Confirmed"
          ? "Appointment confirmed and ready for consultation."
          : "Consultation saved to patient history."
        : result.error,
    );
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
          disabled={fieldsDisabled}
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
            disabled={fieldsDisabled}
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
            disabled={fieldsDisabled}
            type="date"
            value={followUpDate}
            onChange={(event) => setFollowUpDate(event.target.value)}
          />
        </label>
      </div>

      {feedback ? <p className="portal-feedback">{feedback}</p> : null}

      <div className="card-actions">
        {canConfirm ? (
          <button
            className="button button-primary"
            disabled={isSaving}
            type="button"
            onClick={() => handleDoctorAction("Confirmed")}
          >
            {isSaving ? "Saving..." : "Confirm request"}
          </button>
        ) : null}
        {canComplete ? (
          <button
            className="button button-primary"
            disabled={isSaving}
            type="button"
            onClick={() => handleDoctorAction("Completed")}
          >
            {isSaving ? "Saving..." : "Mark completed"}
          </button>
        ) : null}
        {!canConfirm && !canComplete ? (
          <p className="muted-copy">
            {appointment.status === "Completed"
              ? "This appointment is already completed."
              : "Only admin can cancel a confirmed appointment."}
          </p>
        ) : null}
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

function AdminPortal({ appointments, contactMessages, doctors, onSave }) {
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

      <div className="panel portal-admin-entry">
        <SectionHeading
          eyebrow="Admin tools"
          title="Open admin controls"
          subtitle="Manage specialist profiles and review patient messages from a dedicated controls workspace."
        />
        <div className="card-actions">
          <Link className="button button-primary" to="/portal/admin-controls">
            Admin controls
          </Link>
        </div>
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
    </>
  );
}

function DoctorPortal({ appointments, doctors, onUpdate, currentUser }) {
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
              onUpdate={onUpdate}
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
    contactMessages,
    currentUser,
    doctors,
    isHydrating,
    updateAppointmentByDoctor,
    updateAppointmentByAdmin,
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
          />
        ) : null}

        {currentUser.role === "doctor" ? (
          <DoctorPortal
            appointments={portalAppointments}
            currentUser={currentUser}
            doctors={doctors}
            onUpdate={updateAppointmentByDoctor}
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
