import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "../hooks/useForm.jsx";
import { registerUser, resendVerification } from "../services/auth.service.js";

export function RegisterScreen() {
  const { values, handleChange } = useForm({ nombre: "", email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, message: "", error: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ loading: true, message: "", error: "" });

    try {
      const response = await registerUser(values);
      setStatus({ loading: false, message: response.message, error: "" });
    } catch (error) {
      setStatus({ loading: false, message: "", error: error.message });
    }
  }

  async function handleResend() {
    setStatus((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await resendVerification(values.email);
      setStatus({ loading: false, message: response.message, error: "" });
    } catch (error) {
      setStatus({ loading: false, message: "", error: error.message });
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark">gc</span>
          <strong>Gestión Crediticia</strong>
        </div>
        <h1>Crear cuenta</h1>
        <p className="muted">Registrá un operador y verificá el email antes de ingresar.</p>
        <form onSubmit={handleSubmit} className="stack">
          <label>
            Nombre
            <input name="nombre" value={values.nombre} onChange={handleChange} placeholder="Nombre completo" />
          </label>
          <label>
            Email
            <input name="email" type="email" value={values.email} onChange={handleChange} placeholder="operador@email.com" />
          </label>
          <label>
            Contraseña
            <input name="password" type="password" value={values.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" />
          </label>
          {status.error && <p className="error-text">{status.error}</p>}
          {status.message && <p className="success-text">{status.message}</p>}
          <button className="button button-full" disabled={status.loading} type="submit">
            {status.loading ? "Registrando..." : "Registrarme"}
          </button>
          <button className="button button-ghost button-full" disabled={status.loading || !values.email} type="button" onClick={handleResend}>
            Reenviar verificación
          </button>
        </form>
        <p className="auth-footer">¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link></p>
      </section>
    </main>
  );
}
