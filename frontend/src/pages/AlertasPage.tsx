import { useState, useEffect } from 'react';
import type { AlertaStock } from '../types';

const API_URL = 'http://localhost:3000';

const AlertasPage = ({ token }) => {
  const [alertas, setAlertas] = useState<AlertaStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    
    const fetchAlertas = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const response = await fetch(`${API_URL}/alertas-stock`, { headers });
        if (!response.ok) {
          throw new Error('No se pudieron cargar las alertas de stock.');
        }
        const data = await response.json();
        setAlertas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlertas();
  }, [token]);

  return (
    <div className="page-container">
      <h1>Alertas de Stock</h1>
      {isLoading ? (
        <div className="loading-indicator">Cargando alertas...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Tipo de Alerta</th>
                <th>Mensaje</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {alertas.length > 0 ? (
                alertas.map(alerta => (
                  <tr key={alerta.id}>
                    <td>{alerta.producto?.nombre || 'N/A'}</td>
                    <td><span className="alerta-tipo">{alerta.tipo_alerta}</span></td>
                    <td>{alerta.mensaje}</td>
                    <td>{new Date(alerta.fecha).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                    No hay alertas de stock actualmente.
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

export default AlertasPage;
