import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

const Dashboard = () => {
  const [usuario, setUsuario] = useState(null);
  const [obras, setObras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // ==========================================================
  // 1. Leer usuario de localStorage
  // ==========================================================
  useEffect(() => {
    const usuarioString = localStorage.getItem('registraUsuarioIp');
    if (usuarioString) {
      setUsuario(JSON.parse(usuarioString));
    }
  }, []);

  // ==========================================================
  // 2. Cargar obras del backend
  // ==========================================================
  useEffect(() => {
    const cargarObras = async () => {
      try {
        setCargando(true);
        const respuesta = await fetch('http://localhost:4000/obras');
        
        if (!respuesta.ok) {
          throw new Error('Error al cargar las obras');
        }
        
        const datos = await respuesta.json();
        // El backend devuelve { total: N, obras: [...] }
        setObras(datos.obras || []);
      } catch (err) {
        console.error('Error cargando obras:', err);
        setError('No se pudieron cargar las obras. Verifica que el backend esté corriendo.');
      } finally {
        setCargando(false);
      }
    };

    cargarObras();
  }, []); // Solo se ejecuta una vez al montar

  // ==========================================================
  // 3. Cerrar sesión
  // ==========================================================
  const handleCerrarSesion = () => {
    localStorage.removeItem('registraUsuarioIp');
    navigate('/', { replace: true });
  };

  if (!usuario) return <div style={{ padding: '2rem' }}>Cargando...</div>;

  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Hola, {usuario.nombre} 👋</h1>
          <p className="dashboard-subtitle">
            Rol: {usuario.tipoCreador} | Correo: {usuario.correo}
          </p>
        </div>
        <button onClick={handleCerrarSesion} className="btn-logout">
          Cerrar Sesión
        </button>
      </div>

      {/* BOTÓN PARA REGISTRAR NUEVA OBRA */}
      <div style={{ marginBottom: '2rem', textAlign: 'right' }}>
        <Link to="/registrar-obra" className="btn-registrar-obra">
          + Registrar Nueva Obra
        </Link>
      </div>

      {/* ==========================================================
          GALERÍA DE OBRAS
      ========================================================== */}
      <div className="galeria-section">
        <h2 className="galeria-title">
          📚 Mis Obras Registradas ({obras.length})
        </h2>

        {/* Estado: cargando */}
        {cargando && (
          <div className="estado-carga">
            <p>⏳ Cargando obras...</p>
          </div>
        )}

        {/* Estado: error */}
        {error && !cargando && (
          <div className="estado-error">
            <p>⚠️ {error}</p>
            <button onClick={() => window.location.reload()}>Reintentar</button>
          </div>
        )}

        {/* Estado: sin obras */}
        {!cargando && !error && obras.length === 0 && (
          <div className="estado-vacio">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
            <p>Aún no has registrado ninguna obra.</p>
            <Link to="/registrar-obra" className="btn-registrar-vacio">
              Registrar mi primera obra
            </Link>
          </div>
        )}

        {/* Estado: con obras */}
        {!cargando && !error && obras.length > 0 && (
          <div className="galeria-grid">
            {obras.map((obra) => (
              <div key={obra.folio} className="obra-card">
                {/* Imagen de la obra */}
                <div className="obra-imagen-container">
                  {obra.rutaArchivo ? (
                    <img 
                      src={`http://localhost:4000${obra.rutaArchivo}`}
                      alt={obra.titulo}
                      className="obra-imagen"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Sin+imagen';
                      }}
                    />
                  ) : (
                    <div className="obra-sin-imagen">📄 Sin archivo</div>
                  )}
                </div>

                {/* Info de la obra */}
                <div className="obra-info">
                  <div className="obra-folio">{obra.folio}</div>
                  <h3 className="obra-titulo">{obra.titulo}</h3>
                  <span className="obra-categoria">{obra.categoria}</span>
                  <p className="obra-autor">👤 {obra.autor || 'Anónimo'}</p>
                  {obra.descripcion && (
                    <p className="obra-descripcion">{obra.descripcion}</p>
                  )}
                  <p className="obra-fecha">
                    📅 {new Date(obra.fechaRegistro).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;