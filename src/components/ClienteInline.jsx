import { useEffect, useMemo, useState } from "react";
import { crearCliente, listarClientes } from "../services/clientes.service.js";

const emptyForm = {
  nombre: "",
  email: "",
  telefono: ""
};

export function ClienteInline({ cuit, selectedClient, onClientSelected }) {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    listarClientes()
      .then((response) => setClientes(response.data || []))
      .catch((error) => setMessage(error.message));
  }, []);

  useEffect(() => {
    onClientSelected(null);
    setMessage("");
  }, [cuit]);

  const matchedClient = useMemo(() => {
    return clientes.find((cliente) => cliente.cuit === cuit);
  }, [clientes, cuit]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleCreate() {
    setLoading(true);
    setMessage("");
    try {
      const response = await crearCliente({ ...form, cuit });
      const cliente = response.data;
      setClientes((current) => [cliente, ...current.filter((item) => item._id !== cliente._id)]);
      onClientSelected(cliente);
      setForm(emptyForm);
      setMessage("Cliente guardado correctamente.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!/^\d{11}$/.test(cuit)) {
    return <p className="muted">Ingresá un CUIT válido para buscar o crear el cliente.</p>;
  }

  if (matchedClient) {
    return (
      <div className="inline-card">
        <div>
          <strong>{matchedClient.nombre}</strong>
          <p>{matchedClient.email} · {matchedClient.telefono}</p>
        </div>
        <button className="button" type="button" onClick={() => onClientSelected(matchedClient)}>
          {selectedClient?._id === matchedClient._id ? "Cliente seleccionado" : "Usar cliente"}
        </button>
      </div>
    );
  }

  return (
    <div className="inline-card inline-card-column">
      <p className="muted">No encontramos un cliente activo con ese CUIT. Podés crearlo ahora.</p>
      <div className="form-grid">
        <label>
          Nombre
          <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre del cliente" />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="cliente@email.com" />
        </label>
        <label>
          Teléfono
          <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="1130000000" />
        </label>
      </div>
      {message && <p className="form-message">{message}</p>}
      <button className="button" type="button" disabled={loading} onClick={handleCreate}>
        {loading ? "Guardando..." : "Crear cliente"}
      </button>
    </div>
  );
}
