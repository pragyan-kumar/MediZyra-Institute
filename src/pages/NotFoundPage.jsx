import { Link } from "react-router-dom";
import { EmptyState } from "../components/Shared";

export default function NotFoundPage() {
  return (
    <section className="section">
      <div className="container">
        <EmptyState
          title="That page is not available"
          description="Return to the MediZyra overview or open the portal from the main navigation."
          action={
            <Link className="button button-primary" to="/">
              Back to homepage
            </Link>
          }
        />
      </div>
    </section>
  );
}
