import { useState, FormEvent } from 'react';
import './LoginPage.css'; // Importa su propia hoja de estilos

const API_URL = import.meta.env.VITE_API_URL;

const LoginPage = ({ onLoginSuccess, onError }) => {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    onError(null);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contrasena }),
      });
      if (!response.ok) {
        throw new Error('Credenciales incorrectas. Inténtalo de nuevo.');
      }
      const data = await response.json();
      onLoginSuccess(data.access_token);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <form onSubmit={handleLogin} className="login-form">
          <div className="login-header">
            <div className="logo-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" className="logo-svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.001 2.003c-5.524 0-10 4.476-10 10s4.476 10 10 10 10-4.476 10-10-4.476-10-10-10zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm4-11h-3v-3h-2v3h-3v2h3v3h2v-3h3v-2z" />
              </svg>
            </div>
            <h2>Bienvenido a Farmacia Armonía</h2>
            <p>Ingresa tus credenciales para acceder al sistema.</p>
          </div>
          <div className="input-group">
            <span className="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="icon-svg"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
            </span>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <span className="input-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="icon-svg"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
            </span>
            <input type="password" placeholder="Contraseña" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
          </div>
          <button type="submit" className="login-button">Ingresar</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
