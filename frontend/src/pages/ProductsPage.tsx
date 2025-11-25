import { useState, useEffect, FormEvent } from 'react';
import type { Marca, Categoria, Producto } from '../types';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

const API_URL = 'http://localhost:3000';

const ProductsPage = ({ token, user }) => {
  const initialFormState = {
    nombre: '', descripcion: '', principio_activo: '', concentracion: '', presentacion: '',
    precio_compra: '', precio_venta: '', stock_minimo: '', marca_id: '', categoria_id: '',
  };

  const [productos, setProductos] = useState<Producto[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [formState, setFormState] = useState(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const hasRole = (role: string) => user.roles.includes(role);

  const fetchProducts = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await fetch(`${API_URL}/productos?page=${page}&limit=9`, { headers });
      if (!response.ok) throw new Error('No se pudieron cargar los productos.');
      const data = await response.json();
      setProductos(data.data || []); // Asegura que productos sea siempre un array
      setTotalPages(data.lastPage || 1);
      setCurrentPage(data.page || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado al cargar productos');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (token) {
      fetchProducts(currentPage);
    }
  }, [token, currentPage]);

  const openCreateModal = async () => {
    setError(null);
    setFormState(initialFormState);
    if (marcas.length === 0 || categorias.length === 0) {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [marcasRes, categoriasRes] = await Promise.all([
          fetch(`${API_URL}/marcas`, { headers }),
          fetch(`${API_URL}/categorias`, { headers }),
        ]);
        if (!marcasRes.ok || !categoriasRes.ok) throw new Error('No se pudieron cargar las dependencias (marcas/categorías).');
        setMarcas(await marcasRes.json());
        setCategorias(await categoriasRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
      }
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormState(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...formState,
          precio_compra: parseFloat(formState.precio_compra) || 0,
          precio_venta: parseFloat(formState.precio_venta) || 0,
          stock_minimo: parseInt(formState.stock_minimo, 10) || 0,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message);
      }
      setIsModalOpen(false);
      fetchProducts(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el producto');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Productos</h1>
        {hasRole('Administrador') && (
          <button className="add-button" onClick={openCreateModal}>
            + Añadir Producto
          </button>
        )}
      </div>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Añadir Nuevo Producto">
        <form onSubmit={handleSubmit} className="modal-form">
          <input type="text" name="nombre" placeholder="Nombre" value={formState.nombre} onChange={handleInputChange} required />
          <input type="text" name="descripcion" placeholder="Descripción" value={formState.descripcion} onChange={handleInputChange} />
          <input type="text" name="principio_activo" placeholder="Principio Activo" value={formState.principio_activo} onChange={handleInputChange} />
          <input type="text" name="concentracion" placeholder="Concentración" value={formState.concentracion} onChange={handleInputChange} />
          <input type="text" name="presentacion" placeholder="Presentación" value={formState.presentacion} onChange={handleInputChange} />
          <select name="marca_id" value={formState.marca_id} onChange={handleInputChange}><option value="">-- Seleccionar Marca --</option>{marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}</select>
          <select name="categoria_id" value={formState.categoria_id} onChange={handleInputChange}><option value="">-- Seleccionar Categoría --</option>{categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
          <input type="number" name="precio_compra" placeholder="Precio Compra" value={formState.precio_compra} onChange={handleInputChange} required step="0.01" />
          <input type="number" name="precio_venta" placeholder="Precio Venta" value={formState.precio_venta} onChange={handleInputChange} required step="0.01" />
          <input type="number" name="stock_minimo" placeholder="Stock Mínimo" value={formState.stock_minimo} onChange={handleInputChange} required />
          <button type="submit">Guardar Producto</button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </Modal>

      {isLoading ? (
        <div className="loading-indicator">Cargando inventario...</div>
      ) : (
        <>
          <ul className="producto-grid">
            {productos.length > 0 ? (
              productos.map(p => (
                <li key={p.id} className="producto-card">
                  <div className="card-header"><h3>{p.nombre}</h3><span className={`status ${p.estado ? 'active' : 'inactive'}`}>{p.estado ? 'Activo' : 'Inactivo'}</span></div>
                  <div className="card-body"><p><strong>Marca:</strong> {p.marca?.nombre || 'N/A'}</p><p><strong>Categoría:</strong> {p.categoria?.nombre || 'N/A'}</p><p>{p.descripcion}</p></div>
                  <div className="card-footer"><span><strong>Venta:</strong> S/ {Number(p.precio_venta).toFixed(2)}</span><span className={`stock ${p.stock_total <= p.stock_minimo ? 'low' : ''}`}><strong>Stock:</strong> {p.stock_total} u.</span></div>
                </li>
              ))
            ) : (
              <p>No se encontraron productos.</p>
            )}
          </ul>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  );
};

export default ProductsPage;
