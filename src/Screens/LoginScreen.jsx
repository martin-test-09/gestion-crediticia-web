import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { useForm } from "../hooks/useForm.jsx";
import { loginUser } from "../services/auth.service.js";

export function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { values, handleChange } = useForm({ email: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ loading: true, error: "" });

    try {
      const response = await loginUser(values);
      login(response.data.access_token);
      navigate("/presupuestos");
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark">gc</span>
          <strong>Gestión Crediticia</strong>
        </div>
        <h1>Iniciar sesión</h1>
        <p className="muted">Ingresá con tu usuario verificado para administrar presupuestos.</p>
        <form onSubmit={handleSubmit} className="stack">
          <label>
            Email
            <input name="email" type="email" value={values.email} onChange={handleChange} placeholder="test@test.com" />
          </label>
          <label>
            Contraseña
            <input name="password" type="password" value={values.password} onChange={handleChange} placeholder="Tu contraseña" />
          </label>
          {status.error && <p className="error-text">{status.error}</p>}
          <button className="button button-full" disabled={status.loading} type="submit">
            {status.loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
        <p className="auth-footer">¿No tenés cuenta? <Link to="/registro">Registrate</Link></p>
      </section>
    </main>
  );
}
