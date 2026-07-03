const riskCopy = {
  aprobado: {
    title: "Riesgo bajo",
    message: "El cliente no presenta alertas relevantes para esta cotización.",
    color: "success"
  },
  pendiente: {
    title: "Riesgo medio",
    message: "El caso requiere revisión manual antes de la aprobación definitiva.",
    color: "warning"
  },
  rechazado: {
    title: "Riesgo alto",
    message: "La situación crediticia sugiere rechazar o revisar con máxima cautela.",
    color: "danger"
  }
};

export function Semaforo({ resultado }) {
  if (!resultado) return null;

  const estado = resultado.estadoSugerido || "aprobado";
  const copy = riskCopy[estado] || riskCopy.aprobado;

  return (
    <section className={`risk-card risk-${copy.color}`}>
      <div className="risk-light" aria-hidden="true" />
      <div>
        <p className="eyebrow">Resultado BCRA</p>
        <h2>{copy.title}</h2>
        <p>{copy.message}</p>
        <div className="risk-meta">
          <span>Situación: {resultado.situacion ?? "Sin registros"}</span>
          <span>Período: {resultado.periodo || "No informado"}</span>
          <span>Entidades: {resultado.entidades?.length || 0}</span>
        </div>
      </div>
    </section>
  );
}
