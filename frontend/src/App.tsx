import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import type { DecodedToken } from './types';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import LoginPage from './pages/LoginPage';
import AlertasPage from './pages/AlertasPage';
import ClientesPage from './pages/ClientesPage';
import ProveedoresPage from './pages/ProveedoresPage';
import VentasPage from './pages/VentasPage';
import HistorialVentasPage from './pages/HistorialVentasPage';
import './App.css';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken & { exp: number }>(token);
        if (Date.now() >= decoded.exp * 1000) {
          handleLogout(); // Token expirado
        } else {
          setUser(decoded);
        }
      } catch (error) {
        handleLogout(); // Token inválido
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('jwt_token', newToken);
    setToken(newToken);
    setAuthError(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
  };

  return (
    <>
      {authError && <p className="error-message global-error">{authError}</p>}
      <Routes>
        {!token || !user ? (
          <Route path="*" element={<LoginPage onLoginSuccess={handleLoginSuccess} onError={setAuthError} />} />
        ) : (
          <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
            <Route index element={<DashboardPage />} />
            <Route path="productos" element={<ProductsPage token={token} user={user} />} />
            <Route path="alertas" element={<AlertasPage token={token} />} />
            <Route path="clientes" element={<ClientesPage token={token} user={user} />} />
            <Route path="proveedores" element={<ProveedoresPage token={token} user={user} />} />
            <Route path="ventas" element={<VentasPage token={token} />} />
            <Route path="historial-ventas" element={<HistorialVentasPage token={token} />} />
            {/* Otras futuras rutas del ERP irían aquí */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </>
  );
}

export default App;

