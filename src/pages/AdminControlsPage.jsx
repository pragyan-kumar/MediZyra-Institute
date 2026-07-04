import { Link, Navigate } from "react-router-dom";
import { ContactInbox, DoctorManagementPanel } from "../components/AdminControls";
import { EmptyState, SectionHeading, SummaryCard } from "../components/Shared";
import { useAppContext } from "../context/useAppContext";
import { formatFriendlyDateTime } from "../lib/appointments";

export default function AdminControlsPage() {
  const {
    contactMessages,
    currentUser,
    doctors,
    isHydrating,
    saveDoctorProfile,
    users,
  } = useAppContext();

  if (isHydrating) {
    return (
      <section className="section">
        <div className="container">
          <EmptyState
            title="Loading admin controls"
            description="The controls workspace is syncing the latest doctor and message records."
          />
        </div>
      </section>
    );
  }

  if (!currentUser) {
    return <Navigate replace to="/signin" />;
  }

  if (currentUser.role !== "admin") {
    return (
      <section className="section">
        <div className="container">
          <EmptyState
            title="Admin access only"
            description="Sign in with an admin account to manage specialist profiles and patient messages."
            action={
              <Link className="button button-primary" to="/portal">
                Return to portal
              </Link>
            }
          />
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Admin controls"
          title="Control specialist setup and patient messages"
          subtitle={`Last activity synced ${formatFriendlyDateTime(
            new Date().toISOString(),
          )} in your admin workspace.`}
        />

        <div className="summary-grid">
          <SummaryCard
            label="Doctors onboarded"
            value={doctors.length}
            helper="Active specialists in the roster"
          />
          <SummaryCard
            label="Inbox messages"
            value={contactMessages.length}
            helper="Patient queries waiting for review"
          />
          <SummaryCard
            label="Admin session"
            value={currentUser.name}
            helper="Signed in with admin access"
          />
          <SummaryCard
            label="Back to triage"
            value="Portal"
            helper="Return to patient request review"
          />
        </div>

        <div className="card-actions admin-controls-actions">
          <Link className="button button-secondary" to="/portal">
            Back to portal
          </Link>
        </div>

        <div className="portal-admin-grid">
          <DoctorManagementPanel
            doctors={doctors}
            saveDoctorProfile={saveDoctorProfile}
            users={users}
          />
          <ContactInbox contactMessages={contactMessages} />
        </div>
      </div>
    </section>
  );
}
