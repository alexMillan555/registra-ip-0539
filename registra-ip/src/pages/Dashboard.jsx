import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Dashboard = () => {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 🔑 Leemos la nueva clave
    const usuarioString = localStorage.getItem('registraUsuarioIp');
    if (usuarioString) {
      setUsuario(JSON.parse(usuarioString));
    }
  }, []);

  const handleCerrarSesion = () => {
    // Borramos la nueva clave
    localStorage.removeItem('registraUsuarioIp');
    // Redirigimos al registro
    navigate('/', { replace: true });
  };

  if (!usuario) return <div>Cargando...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Hola, {usuario.nombre} 👋</h1>
          <p className="dashboard-subtitle">Rol: {usuario.tipoCreador} | Correo: {usuario.correo}</p>
        </div>
        <button onClick={handleCerrarSesion} className="btn-logout">Cerrar Sesión</button>
      </div>
      <div className="dashboard-content">
        <p>Bienvenido a tu panel de creador.</p>
      </div>
    </div>
  );
};

export default Dashboard;