import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import { EstadoBadge } from "../components/EstadoBadge.jsx";
import { eliminarPresupuesto, listarPresupuestos } from "../services/presupuestos.service.js";
import { formatDate, formatMoney } from "../utils/amortization.js";

function getClienteName(presupuesto) {
  return presupuesto.cliente?.nombre || "Cliente no disponible";
}

function getSearchText(presupuesto) {
  return [
    presupuesto.numero,
    presupuesto.cuit,
    presupuesto.cliente?.nombre,
    presupuesto.vehiculo?.marca,
    presupuesto.vehiculo?.modelo
  ].join(" ").toLowerCase();
}

export function PresupuestosScreen() {
  const [presupuestos, setPresupuestos] = useState([]);
  const [filters, setFilters] = useState({ estado: "todos", text: "" });
  const [status, setStatus] = useState({ loading: true, error: "", message: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    listarPresupuestos()
      .then((response) => {
        setPresupuestos(response.data || []);
        setStatus({ loading: false, error: "", message: "" });
      })
      .catch((error) => setStatus({ loading: false, error: error.message, message: "" }));
  }, []);

  const filteredPresupuestos = useMemo(() => {
    const text = filters.text.trim().toLowerCase();
    return presupuestos.filter((presupuesto) => {
      const matchesEstado = filters.estado === "todos" || presupuesto.estado === filters.estado;
      const matchesText = !text || getSearchText(presupuesto).includes(text);
      return matchesEstado && matchesText;
    });
  }, [presupuestos, filters]);

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      await eliminarPresupuesto(deleteTarget._id);
      setPresupuestos((current) => current.filter((item) => item._id !== deleteTarget._id));
      setStatus({ loading: false, error: "", message: "Presupuesto eliminado correctamente." });
      setDeleteTarget(null);
    } catch (error) {
      setStatus({ loading: false, error: error.message, message: "" });
      setDeleteTarget(null);
    }
  }

  return (
    <section className="content-card">
      <div className="section-header">
        <div>
          <p className="eyebrow">Gestión Crediticia</p>
          <h1>Presupuestos</h1>
          <p className="muted">Listado de presupuestos activos con filtros en vivo.</p>
        </div>
        <Link className="button" to="/presupuestos/nuevo">Nuevo presupuesto</Link>
      </div>

      <div className="filters">
        <label>
          Buscar por cliente, CUIT o número
          <input
            value={filters.text}
            onChange={(event) => setFilters((current) => ({ ...current, text: event.target.value }))}
            placeholder="Ej.: P-00001 o 20000000001"
          />
        </label>
        <label>
          Estado
          <select value={filters.estado} onChange={(event) => setFilters((current) => ({ ...current, estado: event.target.value }))}>
            <option value="todos">Todos</option>
            <option value="aprobado">Aprobado</option>
            <option value="pendiente">Pendiente</option>
            <option value="rechazado">Rechazado</option>
          </select>
        </label>
      </div>

      {status.loading && <p className="muted">Cargando presupuestos...</p>}
      {status.error && <p className="error-text">{status.error}</p>}
      {status.message && <p className="success-text">{status.message}</p>}

      {!status.loading && filteredPresupuestos.length === 0 && (
        <div className="empty-state">No hay presupuestos para los filtros seleccionados.</div>
      )}

      <div className="cards-list">
        {filteredPresupuestos.map((presupuesto) => (
          <article className="budget-card" key={presupuesto._id}>
            <div className="card-row">
              <strong>{presupuesto.numero}</strong>
              <EstadoBadge estado={presupuesto.estado} />
            </div>
            <p>{getClienteName(presupuesto)}</p>
            <p className="muted">{presupuesto.cuit}</p>
            <p>{presupuesto.vehiculo?.marca} {presupuesto.vehiculo?.modelo}</p>
            <p className="money">{formatMoney(presupuesto.cuota_mensual)} / mes</p>
            <div className="card-actions">
              <Link className="button button-ghost" to={`/presupuestos/${presupuesto._id}`}>Ver</Link>
              <Link className="button button-ghost" to={`/presupuestos/${presupuesto._id}/editar`}>Editar</Link>
              <button className="button button-danger" type="button" onClick={() => setDeleteTarget(presupuesto)}>Eliminar</button>
            </div>
          </article>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Vehículo</th>
              <th>Monto</th>
              <th>Cuota</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredPresupuestos.map((presupuesto) => (
              <tr key={presupuesto._id}>
                <td>{presupuesto.numero}</td>
                <td>{formatDate(presupuesto.fecha_creacion)}</td>
                <td>{getClienteName(presupuesto)}<br /><span className="muted">{presupuesto.cuit}</span></td>
                <td>{presupuesto.vehiculo?.marca} {presupuesto.vehiculo?.modelo}</td>
                <td>{formatMoney(presupuesto.monto_financiado)}</td>
                <td>{formatMoney(presupuesto.cuota_mensual)}</td>
                <td><EstadoBadge estado={presupuesto.estado} /></td>
                <td className="table-actions">
                  <Link to={`/presupuestos/${presupuesto._id}`}>Ver</Link>
                  <Link to={`/presupuestos/${presupuesto._id}/editar`}>Editar</Link>
                  <button type="button" onClick={() => setDeleteTarget(presupuesto)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar presupuesto"
        message={`¿Querés eliminar ${deleteTarget?.numero}? Esta acción hará una baja lógica.`}
        confirmLabel="Eliminar"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
