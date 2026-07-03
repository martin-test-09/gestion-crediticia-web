import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { verifyEmailToken } from "../services/auth.service.js";

export function VerifyEmailScreen() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState({ loading: true, message: "", error: "" });

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus({ loading: false, message: "", error: "No encontramos el token de verificación." });
      return;
    }

    verifyEmailToken(token)
      .then((response) => setStatus({ loading: false, message: response.message, error: "" }))
      .catch((error) => setStatus({ loading: false, message: "", error: error.message }));
  }, [searchParams]);

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark">gc</span>
          <strong>Gestión Crediticia</strong>
        </div>
        <h1>Verificación de email</h1>
        {status.loading && <p className="muted">Verificando tu cuenta...</p>}
        {status.message && <p className="success-text">{status.message}</p>}
        {status.error && <p className="error-text">{status.error}</p>}
        <Link className="button button-full" to="/login">Ir a iniciar sesión</Link>
      </section>
    </main>
  );
}
