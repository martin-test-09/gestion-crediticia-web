const labels = {
  aprobado: "Aprobado",
  pendiente: "Pendiente",
  rechazado: "Rechazado"
};

export function EstadoBadge({ estado }) {
  return <span className={`badge badge-${estado}`}>{labels[estado] || estado}</span>;
}
