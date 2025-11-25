import { useState, useEffect, FormEvent } from 'react';
import type { Cliente } from '../types';
import Modal from '../components/Modal';

const API_URL = 'http://localhost:3000';

const ClientesPage = ({ token, user }) => {
  const initialFormState = {
    tipo_documento: 'DNI',
    numero_documento: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    direccion: '',
    email: '',
  };

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formState, setFormState] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasRole = (role: string) => user.roles.includes(role);

  const fetchClientes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await fetch(`${API_URL}/clientes`, { headers });
      if (!response.ok) {
        throw new Error('No se pudieron cargar los clientes.');
      }
      const data = await response.json();
      setClientes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchClientes();
    }
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormState(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch(`${API_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formState),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message);
      }
      setIsModalOpen(false);
      fetchClientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el cliente');
    }
  };

  const openCreateModal = () => {
    setError(null);
    setFormState(initialFormState);
    setIsModalOpen(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Clientes</h1>
        {hasRole('Administrador') && (
          <button className="add-button" onClick={openCreateModal}>
            + Añadir Cliente
          </button>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Añadir Nuevo Cliente">
        <form onSubmit={handleSubmit} className="modal-form">
          <input type="text" name="nombres" placeholder="Nombres" value={formState.nombres} onChange={handleInputChange} required />
          <input type="text" name="apellidos" placeholder="Apellidos" value={formState.apellidos} onChange={handleInputChange} required />
          <select name="tipo_documento" value={formState.tipo_documento} onChange={handleInputChange}>
            <option value="DNI">DNI</option>
            <option value="RUC">RUC</option>
            <option value="Pasaporte">Pasaporte</option>
          </select>
          <input type="text" name="numero_documento" placeholder="Número de Documento" value={formState.numero_documento} onChange={handleInputChange} required />
          <input type="email" name="email" placeholder="Email" value={formState.email} onChange={handleInputChange} />
          <input type="text" name="telefono" placeholder="Teléfono" value={formState.telefono} onChange={handleInputChange} />
          <input type="text" name="direccion" placeholder="Dirección" value={formState.direccion} onChange={handleInputChange} />
          <button type="submit">Guardar Cliente</button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </Modal>

      {isLoading ? (
        <div className="loading-indicator">Cargando clientes...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombres y Apellidos</th>
                <th>Documento</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length > 0 ? (
                clientes.map(cliente => (
                  <tr key={cliente.id}>
                    <td>{`${cliente.nombres} ${cliente.apellidos}`}</td>
                    <td>{`${cliente.tipo_documento}: ${cliente.numero_documento}`}</td>
                    <td>{cliente.email || 'N/A'}</td>
                    <td>{cliente.telefono || 'N/A'}</td>
                    <td><span className={`status ${cliente.estado ? 'active' : 'inactive'}`}>{cliente.estado ? 'Activo' : 'Inactivo'}</span></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    No hay clientes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientesPage;
