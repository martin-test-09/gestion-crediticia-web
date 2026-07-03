import { apiFetch } from "./api.service.js";

export function listarClientes() {
  return apiFetch("/clientes");
}

export function crearCliente(data) {
  return apiFetch("/clientes", { method: "POST", body: data });
}

export function actualizarCliente(id, data) {
  return apiFetch(`/clientes/${id}`, { method: "PUT", body: data });
}

export function eliminarCliente(id) {
  return apiFetch(`/clientes/${id}`, { method: "DELETE" });
}
