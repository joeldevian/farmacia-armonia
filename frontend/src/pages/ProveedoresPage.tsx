import { useState, useEffect, FormEvent } from 'react';
import type { Proveedor } from '../types';
import Modal from '../components/Modal';

const API_URL = 'http://localhost:3000';

const ProveedoresPage = ({ token, user }) => {
  const initialFormState = {
    razon_social: '',
    ruc: '',
    direccion: '',
    telefono: '',
    email: '',
    representante: '',
  };

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [formState, setFormState] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasRole = (role: string) => user.roles.includes(role);

  const fetchProveedores = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await fetch(`${API_URL}/proveedores`, { headers });
      if (!response.ok) {
        throw new Error('No se pudieron cargar los proveedores.');
      }
      const data = await response.json();
      setProveedores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProveedores();
    }
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch(`${API_URL}/proveedores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formState),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message);
      }
      setIsModalOpen(false);
      fetchProveedores();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el proveedor');
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
        <h1>Gestión de Proveedores</h1>
        {hasRole('Administrador') && (
          <button className="add-button" onClick={openCreateModal}>
            + Añadir Proveedor
          </button>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Añadir Nuevo Proveedor">
        <form onSubmit={handleSubmit} className="modal-form">
          <input type="text" name="razon_social" placeholder="Razón Social" value={formState.razon_social} onChange={handleInputChange} required />
          <input type="text" name="ruc" placeholder="RUC" value={formState.ruc} onChange={handleInputChange} required />
          <input type="text" name="representante" placeholder="Representante" value={formState.representante} onChange={handleInputChange} />
          <input type="email" name="email" placeholder="Email" value={formState.email} onChange={handleInputChange} />
          <input type="text" name="telefono" placeholder="Teléfono" value={formState.telefono} onChange={handleInputChange} />
          <input type="text" name="direccion" placeholder="Dirección" value={formState.direccion} onChange={handleInputChange} />
          <button type="submit">Guardar Proveedor</button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </Modal>

      {isLoading ? (
        <div className="loading-indicator">Cargando proveedores...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Razón Social</th>
                <th>RUC</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Representante</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.length > 0 ? (
                proveedores.map(proveedor => (
                  <tr key={proveedor.id}>
                    <td>{proveedor.razon_social}</td>
                    <td>{proveedor.ruc}</td>
                    <td>{proveedor.email || 'N/A'}</td>
                    <td>{proveedor.telefono || 'N/A'}</td>
                    <td>{proveedor.representante || 'N/A'}</td>
                    <td><span className={`status ${proveedor.estado ? 'active' : 'inactive'}`}>{proveedor.estado ? 'Activo' : 'Inactivo'}</span></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    No hay proveedores registrados.
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

export default ProveedoresPage;
