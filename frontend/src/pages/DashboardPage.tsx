import React from 'react';

const DashboardPage = () => {
  return (
    <div className="page-container">
      <h1>Inicio</h1>
      <p>Bienvenido al sistema ERP de Farmacia Armonía.</p>
      <div style={{ marginTop: '2rem', fontSize: '1.1rem' }}>
        <p>Próximamente aquí verás:</p>
        <ul>
          <li>Gráficos de ventas.</li>
          <li>Alertas de stock bajo.</li>
          <li>Notificaciones de productos próximos a vencer.</li>
          <li>Y más...</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
