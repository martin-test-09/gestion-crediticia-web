import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import {
  actualizarPresupuesto,
  eliminarPresupuesto,
  obtenerPresupuesto
} from "../services/presupuestos.service.js";
import { calcularCuotaMensual, formatMoney } from "../utils/amortization.js";

const emptyForm = {
  marca: "",
  modelo: "",
  precio: 0,
  anticipo: 0,
  tasa: 45,
  plazo: 36,
  gastos: 0,
  seguro: 0,
  vigencia: ""
};

function dateInputValue(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function PresupuestoEditarScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [presupuesto, setPresupuesto] = useState(null);
  const [status, setStatus] = useState({ loading: true, saving: false, error: "" });
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    obtenerPresupuesto(id)
      .then((response) => {
        const item = response.data;
        setPresupuesto(item);
        setForm({
          marca: item.vehiculo?.marca || "",
          modelo: item.vehiculo?.modelo || "",
          precio: item.vehiculo?.precio || 0,
          anticipo: item.anticipo || 0,
          tasa: item.tasa || 45,
          plazo: item.plazo || 36,
          gastos: item.gastos || 0,
          seguro: item.seguro || 0,
          vigencia: dateInputValue(item.vigencia)
        });
        setStatus({ loading: false, saving: false, error: "" });
      })
      .catch((error) => setStatus({ loading: false, saving: false, error: error.message }));
  }, [id]);

  const montoFinanciado = Math.max(Number(form.precio || 0) - Number(form.anticipo || 0), 0);
  const cuotaPreview = useMemo(() => calcularCuotaMensual({
    montoFinanciado,
    tasaNominalAnual: form.tasa,
    plazoMeses: form.plazo
  }), [montoFinanciado, form.tasa, form.plazo]);

  function updateForm(event) {
    const { name, value, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === "number" ? Number(value) : value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ loading: false, saving: true, error: "" });

    try {
      const response = await actualizarPresupuesto(id, {
        vehiculo: {
          marca: form.marca,
          modelo: form.modelo,
          precio: form.precio
        },
        anticipo: form.anticipo,
        tasa: form.tasa,
        plazo: form.plazo,
        gastos: form.gastos,
        seguro: form.seguro,
        vigencia: form.vigencia || undefined
      });
      navigate(`/presupuestos/${response.data._id}`);
    } catch (error) {
      setStatus({ loading: false, saving: false, error: error.message });
    }
  }

  async function confirmDelete() {
    try {
      await eliminarPresupuesto(id);
      navigate("/presupuestos");
    } catch (error) {
      setStatus({ loading: false, saving: false, error: error.message });
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
          <p className="eyebrow">Editar</p>
          <h1>{presupuesto.numero}</h1>
          <p className="muted">Cliente y CUIT no se modifican desde esta pantalla.</p>
        </div>
      </div>
      {status.error && <p className="error-text">{status.error}</p>}
      <form className="quote-layout" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Marca
            <input name="marca" value={form.marca} onChange={updateForm} />
          </label>
          <label>
            Modelo
            <input name="modelo" value={form.modelo} onChange={updateForm} />
          </label>
          <label>
            Precio del vehículo
            <input name="precio" type="number" min="0" value={form.precio} onChange={updateForm} />
          </label>
          <label>
            Anticipo
            <input name="anticipo" type="number" min="0" value={form.anticipo} onChange={updateForm} />
          </label>
          <label>
            Tasa TNA (%)
            <input name="tasa" type="number" min="0" value={form.tasa} onChange={updateForm} />
          </label>
          <label>
            Plazo
            <select name="plazo" value={form.plazo} onChange={updateForm}>
              <option value={12}>12 meses</option>
              <option value={24}>24 meses</option>
              <option value={36}>36 meses</option>
              <option value={48}>48 meses</option>
              <option value={60}>60 meses</option>
            </select>
          </label>
          <label>
            Gastos
            <input name="gastos" type="number" min="0" value={form.gastos} onChange={updateForm} />
          </label>
          <label>
            Seguro
            <input name="seguro" type="number" min="0" value={form.seguro} onChange={updateForm} />
          </label>
          <label>
            Vigencia
            <input name="vigencia" type="date" value={form.vigencia} onChange={updateForm} />
          </label>
        </div>
        <aside className="summary-card">
          <p className="eyebrow">Vista previa</p>
          <h2>{formatMoney(cuotaPreview)}</h2>
          <p>Cuota mensual recalculada.</p>
          <dl>
            <div><dt>Cliente</dt><dd>{presupuesto.cliente?.nombre}</dd></div>
            <div><dt>CUIT</dt><dd>{presupuesto.cuit}</dd></div>
            <div><dt>Monto a financiar</dt><dd>{formatMoney(montoFinanciado)}</dd></div>
          </dl>
          <div className="actions-row wrap">
            <button className="button" type="submit" disabled={status.saving}>{status.saving ? "Guardando..." : "Guardar cambios"}</button>
            <button className="button button-danger" type="button" onClick={() => setDeleteOpen(true)}>Eliminar</button>
          </div>
        </aside>
      </form>
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
