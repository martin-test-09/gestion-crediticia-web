import { apiFetch } from "./api.service.js";

export function listarPresupuestos() {
  return apiFetch("/presupuestos");
}

export function obtenerPresupuesto(id) {
  return apiFetch(`/presupuestos/${id}`);
}

export function crearPresupuesto(data) {
  return apiFetch("/presupuestos", { method: "POST", body: data });
}

export function actualizarPresupuesto(id, data) {
  return apiFetch(`/presupuestos/${id}`, { method: "PUT", body: data });
}

export function actualizarEstadoPresupuesto(id, estado) {
  return apiFetch(`/presupuestos/${id}/estado`, { method: "PATCH", body: { estado } });
}

export function eliminarPresupuesto(id) {
  return apiFetch(`/presupuestos/${id}`, { method: "DELETE" });
}
