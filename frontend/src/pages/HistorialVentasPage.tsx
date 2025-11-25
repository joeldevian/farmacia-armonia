import React, { useState, useEffect, useCallback } from 'react';
import type { Venta } from '../types'; // Importar el tipo Venta
import './HistorialVentasPage.css';
import Modal from '../components/Modal';

interface HistorialVentasPageProps {
  token: string;
}

const HistorialVentasPage: React.FC<HistorialVentasPageProps> = ({ token }) => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const limit = 10; // Ventas por página

  const fetchVentas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ventas?page=${currentPage}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setVentas(data.data); // Asumiendo que el backend devuelve { data: [], total: ..., page: ..., last_page: ... }
      setTotalPages(data.last_page);
    } catch (err) {
      setError('Error al cargar el historial de ventas.');
      console.error('Error fetching sales history:', err);
    } finally {
      setLoading(false);
    }
  }, [token, currentPage]);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const openVentaDetails = (venta: Venta) => {
    setSelectedVenta(venta);
    setIsModalOpen(true);
  };

  const closeVentaDetails = () => {
    setIsModalOpen(false);
    setSelectedVenta(null);
  };

  if (loading) {
    return <div className="historial-ventas-page">Cargando historial de ventas...</div>;
  }


  if (error) {
    return <div className="historial-ventas-page error-message">{error}</div>;
  }

  return (
    <div className="historial-ventas-page">
      <h1>Historial de Ventas</h1>
      {ventas.length === 0 ? (
        <p>No hay ventas registradas.</p>
      ) : (
        <>
          <div className="ventas-list">
            <table>
              <thead>
                <tr>
                  <th>ID Venta</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Tipo Comprobante</th>
                  <th>Método Pago</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((venta) => (
                  <tr key={venta.id}>
                    <td>{venta.id.substring(0, 8)}...</td>
                    <td>{new Date(venta.fecha_venta).toLocaleDateString()}</td>
                    <td>{venta.cliente ? `${venta.cliente.nombres} ${venta.cliente.apellidos}` : 'Consumidor Final'}</td>
                    <td>{venta.tipo_comprobante}</td>
                    <td>{venta.metodo_pago}</td>
                    <td>${parseFloat(venta.total as any).toFixed(2)}</td>
                    <td>
                      <button className="btn btn-sm btn-info" onClick={() => openVentaDetails(venta)}>Ver Detalles</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-controls">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              Siguiente
            </button>
          </div>
        </>
      )}

      {isModalOpen && selectedVenta && (
        <Modal title={`Detalles de Venta #${selectedVenta.numero_correlativo}`} onClose={closeVentaDetails}>
          <p><strong>ID Venta:</strong> {selectedVenta.id}</p>
          <p><strong>Fecha:</strong> {new Date(selectedVenta.fecha_venta).toLocaleString()}</p>
          <p><strong>Cliente:</strong> {selectedVenta.cliente ? `${selectedVenta.cliente.nombres} ${selectedVenta.cliente.apellidos}` : 'Consumidor Final'}</p>
          <p><strong>Tipo Comprobante:</strong> {selectedVenta.tipo_comprobante} ({selectedVenta.numero_serie}-{selectedVenta.numero_correlativo})</p>
          <p><strong>Método Pago:</strong> {selectedVenta.metodo_pago}</p>
          <h3>Productos:</h3>
          <table className="detalle-venta-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>P. Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {selectedVenta.detalles.map(detalle => (
                <tr key={detalle.id}>
                  <td>{detalle.producto.nombre}</td>
                  <td>{detalle.cantidad}</td>
                  <td>${parseFloat(detalle.precio_unitario as any).toFixed(2)}</td>
                  <td>${parseFloat(detalle.subtotal as any).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="venta-summary"><strong>Subtotal:</strong> ${parseFloat(selectedVenta.subtotal as any).toFixed(2)}</p>
          <p className="venta-summary"><strong>Impuestos:</strong> ${parseFloat(selectedVenta.impuestos as any).toFixed(2)}</p>
          <p className="venta-summary"><strong>Total:</strong> ${parseFloat(selectedVenta.total as any).toFixed(2)}</p>
        </Modal>
      )}
    </div>
  );
};

export default HistorialVentasPage;
