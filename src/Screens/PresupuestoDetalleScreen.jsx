import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import { EstadoBadge } from "../components/EstadoBadge.jsx";
import { Semaforo } from "../components/Semaforo.jsx";
import {
  actualizarEstadoPresupuesto,
  eliminarPresupuesto,
  obtenerPresupuesto
} from "../services/presupuestos.service.js";
import { formatDate, formatMoney } from "../utils/amortization.js";

function situacionToEstado(situacion, sinRegistros) {
  if (sinRegistros) return "aprobado";

  const value = Number(situacion);

  if (!Number.isFinite(value) || value <= 1) return "aprobado";
  if (value === 2 || value === 3) return "pendiente";

  return "rechazado";
}

function toBcraResult(presupuesto) {
  if (!presupuesto?.resultado_buro) return null;

  const resultadoBuro = presupuesto.resultado_buro;

  return {
    estadoSugerido: situacionToEstado(resultadoBuro.situacion, resultadoBuro.sin_registros),
    situacion: resultadoBuro.situacion,
    periodo: resultadoBuro.periodo,
    entidades: resultadoBuro.entidades || [],
    sinRegistros: resultadoBuro.sin_registros
  };
}

export function PresupuestoDetalleScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [presupuesto, setPresupuesto] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: "", message: "" });
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    obtenerPresupuesto(id)
      .then((response) => {
        setPresupuesto(response.data);
        setStatus({ loading: false, error: "", message: "" });
      })
      .catch((error) => setStatus({ loading: false, error: error.message, message: "" }));
  }, [id]);

  async function resolveEstado(estado) {
    setStatus((current) => ({ ...current, error: "", message: "" }));
    try {
      const response = await actualizarEstadoPresupuesto(id, estado);
      setPresupuesto(response.data);
      setStatus({ loading: false, error: "", message: "Estado actualizado correctamente." });
    } catch (error) {
      setStatus({ loading: false, error: error.message, message: "" });
    }
  }

  async function confirmDelete() {
    try {
      await eliminarPresupuesto(id);
      navigate("/presupuestos");
    } catch (error) {
      setStatus({ loading: false, error: error.message, message: "" });
      setDeleteOpen(false);
    }
  }

  if (status.loading) {
    return <section className="content-card"><p className="muted">Cargando presupuesto...</p></section>;
  }

  if (status.error && !presupuesto) {
    return <section className="content-card"><p className="error-text">{status.error}</p></section>;
  }

  return (
    <section className="content-card">
      <div className="section-header">
        <div>
          <p className="eyebrow">Detalle</p>
          <h1>{presupuesto.numero}</h1>
          <p className="muted">{presupuesto.cliente?.nombre} · {presupuesto.cuit}</p>
        </div>
        <EstadoBadge estado={presupuesto.estado} />
      </div>

      {status.error && <p className="error-text">{status.error}</p>}
      {status.message && <p className="success-text">{status.message}</p>}

      <div className="detail-grid">
        <article className="detail-card">
          <h2>Datos del presupuesto</h2>
          <dl>
            <div><dt>Cliente</dt><dd>{presupuesto.cliente?.nombre}</dd></div>
            <div><dt>Email</dt><dd>{presupuesto.cliente?.email}</dd></div>
            <div><dt>CUIT</dt><dd>{presupuesto.cuit}</dd></div>
            <div><dt>Vehículo</dt><dd>{presupuesto.vehiculo?.marca} {presupuesto.vehiculo?.modelo}</dd></div>
            <div><dt>Precio</dt><dd>{formatMoney(presupuesto.vehiculo?.precio)}</dd></div>
            <div><dt>Anticipo</dt><dd>{formatMoney(presupuesto.anticipo)}</dd></div>
            <div><dt>Monto financiado</dt><dd>{formatMoney(presupuesto.monto_financiado)}</dd></div>
            <div><dt>Tasa / plazo</dt><dd>{presupuesto.tasa}% · {presupuesto.plazo} meses</dd></div>
            <div><dt>Gastos</dt><dd>{formatMoney(presupuesto.gastos)}</dd></div>
            <div><dt>Seguro</dt><dd>{formatMoney(presupuesto.seguro)}</dd></div>
            <div><dt>Vigencia</dt><dd>{formatDate(presupuesto.vigencia)}</dd></div>
            <div><dt>Fecha de creación</dt><dd>{formatDate(presupuesto.fecha_creacion)}</dd></div>
            <div><dt>Estado final</dt><dd><EstadoBadge estado={presupuesto.estado} /></dd></div>
          </dl>
        </article>

        <article className="summary-card detail-summary">
          <p className="eyebrow">Cuota mensual</p>
          <h2>{formatMoney(presupuesto.cuota_mensual)}</h2>
          <p>Sistema francés · gastos y seguro informativos.</p>
          <div className="actions-row wrap">
            <Link className="button" to={`/presupuestos/${id}/editar`}>Editar</Link>
            <button className="button button-danger" type="button" onClick={() => setDeleteOpen(true)}>Eliminar</button>
          </div>
          {presupuesto.estado === "pendiente" && (
            <div className="manual-resolution">
              <h3>Resolución manual</h3>
              <p>Este presupuesto está pendiente. Podés resolverlo manualmente.</p>
              <div className="actions-row wrap">
                <button className="button" type="button" onClick={() => resolveEstado("aprobado")}>Aprobar</button>
                <button className="button button-danger" type="button" onClick={() => resolveEstado("rechazado")}>Rechazar</button>
              </div>
            </div>
          )}
        </article>
      </div>

      <Semaforo resultado={toBcraResult(presupuesto)} />

      <div className="table-wrap always-visible">
        <table>
          <thead>
            <tr>
              <th>Entidad</th>
              <th>Situación</th>
              <th>Monto</th>
              <th>Atraso</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {(presupuesto.resultado_buro?.entidades || []).map((entidad, index) => (
              <tr key={`${entidad.entidad}-${index}`}>
                <td>{entidad.entidad}</td>
                <td>{entidad.situacion}</td>
                <td>{formatMoney(entidad.monto)}</td>
                <td>{entidad.diasAtrasoPago || 0} días</td>
                <td>{[
                  entidad.refinanciaciones ? "Refinanciaciones" : null,
                  entidad.enRevision ? "En revisión" : null,
                  entidad.procesoJud ? "Proceso judicial" : null
                ].filter(Boolean).join(", ") || "Sin observaciones"}</td>
              </tr>
            ))}
            {presupuesto.resultado_buro?.sin_registros && (
              <tr><td colSpan="5">Sin registros en BCRA.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Eliminar presupuesto"
        message={`¿Querés eliminar ${presupuesto.numero}? Esta acción hará una baja lógica.`}
        confirmLabel="Eliminar"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
