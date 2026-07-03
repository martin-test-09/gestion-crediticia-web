import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import {
  actualizarCliente,
  crearCliente,
  eliminarCliente,
  listarClientes
} from "../services/clientes.service.js";

const emptyForm = {
  nombre: "",
  email: "",
  cuit: "",
  telefono: ""
};

function getSearchText(cliente) {
  return [cliente.nombre, cliente.email, cliente.cuit, cliente.telefono].join(" ").toLowerCase();
}

export function ClientesScreen() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState({ loading: true, saving: false, error: "", message: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    listarClientes()
      .then((response) => {
        setClientes(response.data || []);
        setStatus({ loading: false, saving: false, error: "", message: "" });
      })
      .catch((error) => setStatus({ loading: false, saving: false, error: error.message, message: "" }));
  }, []);

  const filteredClientes = useMemo(() => {
    const text = filter.trim().toLowerCase();
    if (!text) return clientes;

    return clientes.filter((cliente) => getSearchText(cliente).includes(text));
  }, [clientes, filter]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    const nextValue = name === "cuit" ? value.replace(/\D/g, "").slice(0, 11) : value;
    setForm((current) => ({ ...current, [name]: nextValue }));
  }

  function startEdit(cliente) {
    setEditingId(cliente._id);
    setForm({
      nombre: cliente.nombre || "",
      email: cliente.email || "",
      cuit: cliente.cuit || "",
      telefono: cliente.telefono || ""
    });
    setStatus({ loading: false, saving: false, error: "", message: "Editando cliente seleccionado." });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ loading: false, saving: true, error: "", message: "" });

    try {
      const response = editingId
        ? await actualizarCliente(editingId, form)
        : await crearCliente(form);
      const cliente = response.data;

      setClientes((current) => {
        const withoutCurrent = current.filter((item) => item._id !== cliente._id);
        return editingId
          ? current.map((item) => (item._id === cliente._id ? cliente : item))
          : [cliente, ...withoutCurrent];
      });
      resetForm();
      setStatus({
        loading: false,
        saving: false,
        error: "",
        message: editingId ? "Cliente actualizado correctamente." : "Cliente creado correctamente."
      });
    } catch (error) {
      setStatus({ loading: false, saving: false, error: error.message, message: "" });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      await eliminarCliente(deleteTarget._id);
      setClientes((current) => current.filter((item) => item._id !== deleteTarget._id));
      if (editingId === deleteTarget._id) {
        resetForm();
      }
      setStatus({ loading: false, saving: false, error: "", message: "Cliente eliminado correctamente." });
      setDeleteTarget(null);
    } catch (error) {
      setStatus({ loading: false, saving: false, error: error.message, message: "" });
      setDeleteTarget(null);
    }
  }

  return (
    <section className="content-card">
      <div className="section-header">
        <div>
          <p className="eyebrow">Clientes</p>
          <h1>Administrar clientes</h1>
          <p className="muted">Listado de clientes activos con alta, edición y baja lógica.</p>
        </div>
      </div>

      {status.error && <p className="error-text">{status.error}</p>}
      {status.message && <p className="success-text">{status.message}</p>}

      <form className="inline-card inline-card-column client-form" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">{editingId ? "Editar cliente" : "Nuevo cliente"}</p>
          <h2>{editingId ? "Actualizar datos" : "Crear cliente"}</h2>
        </div>
        <div className="form-grid">
          <label>
            Nombre
            <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre del cliente" required />
          </label>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="cliente@email.com" required />
          </label>
          <label>
            CUIT / CUIL
            <input name="cuit" value={form.cuit} onChange={handleChange} placeholder="20000000001" inputMode="numeric" required />
          </label>
          <label>
            Teléfono
            <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="1130000000" required />
          </label>
        </div>
        <div className="actions-row wrap">
          <button className="button" type="submit" disabled={status.saving}>
            {status.saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear cliente"}
          </button>
          {editingId && (
            <button className="button button-ghost" type="button" onClick={resetForm}>
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      <div className="filters">
        <label>
          Buscar por nombre, email, CUIT o teléfono
          <input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Ej.: 20000000001"
          />
        </label>
      </div>

      {status.loading && <p className="muted">Cargando clientes...</p>}

      {!status.loading && filteredClientes.length === 0 && (
        <div className="empty-state">No hay clientes activos para los filtros seleccionados.</div>
      )}

      <div className="cards-list">
        {filteredClientes.map((cliente) => (
          <article className="budget-card" key={cliente._id}>
            <div className="card-row">
              <strong>{cliente.nombre}</strong>
              <span className="badge badge-aprobado">Activo</span>
            </div>
            <p>{cliente.email}</p>
            <p className="muted">CUIT/CUIL: {cliente.cuit}</p>
            <p className="muted">Teléfono: {cliente.telefono}</p>
            <div className="card-actions">
              <button className="button button-ghost" type="button" onClick={() => startEdit(cliente)}>Editar</button>
              <button className="button button-danger" type="button" onClick={() => setDeleteTarget(cliente)}>Eliminar</button>
            </div>
          </article>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>CUIT/CUIL</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredClientes.map((cliente) => (
              <tr key={cliente._id}>
                <td>{cliente.nombre}</td>
                <td>{cliente.email}</td>
                <td>{cliente.cuit}</td>
                <td>{cliente.telefono}</td>
                <td className="table-actions">
                  <button type="button" onClick={() => startEdit(cliente)}>Editar</button>
                  <button type="button" onClick={() => setDeleteTarget(cliente)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar cliente"
        message={`¿Querés eliminar el cliente ${deleteTarget?.nombre}? Esta acción hará una baja lógica.`}
        confirmLabel="Eliminar"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
