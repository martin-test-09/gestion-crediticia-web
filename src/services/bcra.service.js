import { apiFetch } from "./api.service.js";

export function consultarBcra(cuit) {
  return apiFetch(`/bcra/${cuit}`);
}
