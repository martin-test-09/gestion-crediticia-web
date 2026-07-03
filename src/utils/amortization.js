export function calcularCuotaMensual({ montoFinanciado, tasaNominalAnual, plazoMeses }) {
  const monto = Number(montoFinanciado);
  const tasa = Number(tasaNominalAnual);
  const plazo = Number(plazoMeses);

  if (!Number.isFinite(monto) || monto <= 0 || !Number.isFinite(tasa) || tasa <= 0 || !Number.isFinite(plazo)) {
    return 0;
  }

  const tasaMensual = (tasa / 100) / 12;
  const cuota = tasaMensual === 0
    ? monto / plazo
    : (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazo));

  return Math.round(cuota * 100) / 100;
}

export function formatMoney(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-AR").format(new Date(value));
}
