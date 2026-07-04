import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { demoCredentials } from "../data/siteData";
import { useAppContext } from "../context/useAppContext";
import { SectionHeading } from "../components/Shared";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, registerPatient } = useAppContext();
  const [mode, setMode] = useState("signin");
  const [loginForm, setLoginForm] = useState({
    email: "patient@medizyra.demo",
    password: "Patient@123",
  });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginChange = (field) => (event) => {
    const value = event.target.value;
    setLoginForm((current) => ({ ...current, [field]: value }));
  };

  const handleRegisterChange = (field) => (event) => {
    const value = event.target.value;
    setRegisterForm((current) => ({ ...current, [field]: value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setFeedback("");
    setError("");
    setIsSubmitting(true);

    const result = await login(loginForm);
    if (!result.ok) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setFeedback(`Signed in as ${result.user.role}. Redirecting to your portal...`);
    setTimeout(() => navigate("/portal"), 400);
    setIsSubmitting(false);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setFeedback("");
    setError("");
    setIsSubmitting(true);

    const result = await registerPatient(registerForm);
    if (!result.ok) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setFeedback("Patient profile created successfully. Redirecting to your portal...");
    setTimeout(() => navigate("/portal"), 400);
    setIsSubmitting(false);
  };

  return (
    <section className="section">
      <div className="container auth-layout">
        <article className="panel auth-panel">
          <SectionHeading
            title="Access the demo portal"
            subtitle="Use seeded email accounts for admin and doctor testing, or create a fresh patient profile locally."
          />

          <div className="auth-toggle">
            <button
              className={`auth-tab ${mode === "signin" ? "auth-tab-active" : ""}`}
              type="button"
              onClick={() => setMode("signin")}
            >
              Sign in
            </button>
            <button
              className={`auth-tab ${mode === "register" ? "auth-tab-active" : ""}`}
              type="button"
              onClick={() => setMode("register")}
            >
              Register patient
            </button>
          </div>

          {mode === "signin" ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <label className="field-block">
                <span>Email</span>
                <input
                  className="text-input"
                  type="email"
                  value={loginForm.email}
                  onChange={handleLoginChange("email")}
                />
              </label>
              <label className="field-block">
                <span>Password</span>
                <input
                  className="text-input"
                  type="password"
                  value={loginForm.password}
                  onChange={handleLoginChange("password")}
                />
              </label>
              {error ? <p className="form-error">{error}</p> : null}
              {feedback ? <p className="form-success">{feedback}</p> : null}
              <button className="button button-primary wide" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Signing in..." : "Enter portal"}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegister}>
              <label className="field-block">
                <span>Full name</span>
                <input
                  className="text-input"
                  type="text"
                  value={registerForm.name}
                  onChange={handleRegisterChange("name")}
                />
              </label>
              <label className="field-block">
                <span>Email</span>
                <input
                  className="text-input"
                  type="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange("email")}
                />
              </label>
              <label className="field-block">
                <span>Phone</span>
                <input
                  className="text-input"
                  type="tel"
                  value={registerForm.phone}
                  onChange={handleRegisterChange("phone")}
                />
              </label>
              <label className="field-block">
                <span>Password</span>
                <input
                  className="text-input"
                  type="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange("password")}
                />
              </label>
              {error ? <p className="form-error">{error}</p> : null}
              {feedback ? <p className="form-success">{feedback}</p> : null}
              <button className="button button-primary wide" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Creating patient..." : "Create patient access"}
              </button>
            </form>
          )}
        </article>

        <article className="panel demo-panel">
          <SectionHeading
            eyebrow="Quick testing"
            title="Seeded demo credentials"
            subtitle="These accounts are available immediately for platform testing."
          />
          <div className="demo-credential-list">
            {demoCredentials.map((credential) => (
              <article className="demo-credential" key={credential.role}>
                <strong>{credential.role}</strong>
                <p>{credential.email}</p>
                <code>{credential.password}</code>
              </article>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
