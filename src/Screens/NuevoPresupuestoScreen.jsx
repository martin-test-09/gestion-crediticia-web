import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ClienteInline } from "../components/ClienteInline.jsx";
import { Semaforo } from "../components/Semaforo.jsx";
import { consultarBcra } from "../services/bcra.service.js";
import { crearPresupuesto } from "../services/presupuestos.service.js";
import { calcularCuotaMensual, formatMoney } from "../utils/amortization.js";

const initialQuote = {
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

const stepLabels = ["Cliente y BCRA", "Resultado", "Cotización"];

export function NuevoPresupuestoScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [cuit, setCuit] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [bcraResult, setBcraResult] = useState(null);
  const [quote, setQuote] = useState(initialQuote);
  const [status, setStatus] = useState({ loading: false, error: "" });

  const montoFinanciado = Math.max(Number(quote.precio || 0) - Number(quote.anticipo || 0), 0);
  const cuotaPreview = useMemo(() => calcularCuotaMensual({
    montoFinanciado,
    tasaNominalAnual: quote.tasa,
    plazoMeses: quote.plazo
  }), [montoFinanciado, quote.tasa, quote.plazo]);

  function updateQuote(event) {
    const { name, value, type } = event.target;
    setQuote((current) => ({ ...current, [name]: type === "number" ? Number(value) : value }));
  }

  async function handleBcraLookup(event) {
    event.preventDefault();
    setStatus({ loading: true, error: "" });

    if (!/^\d{11}$/.test(cuit)) {
      setStatus({ loading: false, error: "El CUIT debe tener exactamente 11 dígitos." });
      return;
    }

    if (!selectedClient) {
      setStatus({ loading: false, error: "Seleccioná o creá un cliente antes de consultar BCRA." });
      return;
    }

    try {
      const response = await consultarBcra(cuit);
      setBcraResult(response.data);
      setStep(2);
      setStatus({ loading: false, error: "" });
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    setStatus({ loading: true, error: "" });

    try {
      const response = await crearPresupuesto({
        cliente: selectedClient._id,
        vehiculo: {
          marca: quote.marca,
          modelo: quote.modelo,
          precio: quote.precio
        },
        anticipo: quote.anticipo,
        tasa: quote.tasa,
        plazo: quote.plazo,
        gastos: quote.gastos,
        seguro: quote.seguro,
        vigencia: quote.vigencia || undefined
      });
      navigate(`/presupuestos/${response.data._id}`);
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  }

  return (
    <section className="content-card">
      <div className="section-header">
        <div>
          <p className="eyebrow">Nuevo presupuesto</p>
          <h1>Crear presupuesto crediticio</h1>
          <p className="muted">Completá el flujo en tres pasos. El estado final lo define el backend al guardar.</p>
        </div>
      </div>

      <div className="stepper" aria-label="Progreso del presupuesto">
        {stepLabels.map((label, index) => {
          const number = index + 1;
          return (
            <div className={`step ${number <= step ? "step-active" : ""}`} key={label}>
              <span>{number}</span>
              <p>{label}</p>
            </div>
          );
        })}
      </div>

      {status.error && <p className="error-text">{status.error}</p>}

      {step === 1 && (
        <form className="stack narrow" onSubmit={handleBcraLookup}>
          <label>
            CUIT / CUIL
            <input
              value={cuit}
              onChange={(event) => setCuit(event.target.value.replace(/\D/g, "").slice(0, 11))}
              placeholder="20000000001"
              inputMode="numeric"
            />
          </label>
          <ClienteInline cuit={cuit} selectedClient={selectedClient} onClientSelected={setSelectedClient} />
          <button className="button button-full" type="submit" disabled={status.loading}>
            {status.loading ? "Consultando BCRA..." : "Consultar BCRA y continuar"}
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="stack">
          <Semaforo resultado={bcraResult} />
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
                {(bcraResult?.entidades || []).map((entidad, index) => (
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
                {bcraResult?.sinRegistros && (
                  <tr><td colSpan="5">Sin registros en BCRA.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="actions-row">
            <button className="button button-ghost" type="button" onClick={() => setStep(1)}>Volver</button>
            <button className="button" type="button" onClick={() => setStep(3)}>
              {bcraResult?.estadoSugerido === "rechazado" ? "Continuar de todos modos" : "Continuar"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form className="quote-layout" onSubmit={handleCreate}>
          <div className="form-grid">
            <label>
              Marca
              <input name="marca" value={quote.marca} onChange={updateQuote} placeholder="Toyota" />
            </label>
            <label>
              Modelo
              <input name="modelo" value={quote.modelo} onChange={updateQuote} placeholder="Corolla XEI" />
            </label>
            <label>
              Precio del vehículo
              <input name="precio" type="number" min="0" value={quote.precio} onChange={updateQuote} />
            </label>
            <label>
              Anticipo
              <input name="anticipo" type="number" min="0" value={quote.anticipo} onChange={updateQuote} />
            </label>
            <label>
              Tasa TNA (%)
              <input name="tasa" type="number" min="0" value={quote.tasa} onChange={updateQuote} />
            </label>
            <label>
              Plazo
              <select name="plazo" value={quote.plazo} onChange={updateQuote}>
                <option value={12}>12 meses</option>
                <option value={24}>24 meses</option>
                <option value={36}>36 meses</option>
                <option value={48}>48 meses</option>
                <option value={60}>60 meses</option>
              </select>
            </label>
            <label>
              Gastos
              <input name="gastos" type="number" min="0" value={quote.gastos} onChange={updateQuote} />
            </label>
            <label>
              Seguro
              <input name="seguro" type="number" min="0" value={quote.seguro} onChange={updateQuote} />
            </label>
            <label>
              Vigencia
              <input name="vigencia" type="date" value={quote.vigencia} onChange={updateQuote} />
            </label>
          </div>
          <aside className="summary-card">
            <p className="eyebrow">Resumen</p>
            <h2>{formatMoney(cuotaPreview)}</h2>
            <p>Cuota mensual fija · {quote.plazo} meses</p>
            <dl>
              <div><dt>Cliente</dt><dd>{selectedClient?.nombre}</dd></div>
              <div><dt>Monto a financiar</dt><dd>{formatMoney(montoFinanciado)}</dd></div>
              <div><dt>Gastos</dt><dd>{formatMoney(quote.gastos)}</dd></div>
              <div><dt>Seguro</dt><dd>{formatMoney(quote.seguro)}</dd></div>
              <div><dt>Estado sugerido</dt><dd>{bcraResult?.estadoSugerido}</dd></div>
            </dl>
            <div className="actions-row">
              <button className="button button-ghost" type="button" onClick={() => setStep(2)}>Volver</button>
              <button className="button" type="submit" disabled={status.loading}>
                {status.loading ? "Creando..." : "Crear presupuesto"}
              </button>
            </div>
          </aside>
        </form>
      )}
    </section>
  );
}
