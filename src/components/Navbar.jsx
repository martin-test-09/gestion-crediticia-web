import { Link, NavLink } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <Link to="/presupuestos" className="brand">
        <span className="brand-mark">gc</span>
        <span>Gestión Crediticia</span>
      </Link>
      <nav className="nav-links">
        <NavLink to="/presupuestos">Presupuestos</NavLink>
        <NavLink to="/clientes">Clientes</NavLink>
        <NavLink to="/presupuestos/nuevo">Nuevo presupuesto</NavLink>
      </nav>
      <div className="user-panel">
        <span>{user?.nombre || "Operador"}</span>
        <button className="button button-ghost" type="button" onClick={() => logout({ redirect: true })}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
