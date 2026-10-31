import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

const Dashboard = () => {
  const [usuario, setUsuario] = useState(null);
  const [obras, setObras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioString = localStorage.getItem('registraUsuarioIp');
    if (usuarioString) setUsuario(JSON.parse(usuarioString));
  }, []);

  useEffect(() => {
    const cargarObras = async () => {
      try {
        setCargando(true);
        const respuesta = await fetch('http://localhost:4000/obras');
        if (!respuesta.ok) throw new Error('Error al cargar');
        const datos = await respuesta.json();
        setObras(datos.obras || []);
      } catch (err) {
        setError('No se pudieron cargar las obras.');
      } finally {
        setCargando(false);
      }
    };
    cargarObras();
  }, []);

  const handleCerrarSesion = () => {
    localStorage.removeItem('registraUsuarioIp');
    navigate('/', { replace: true });
  };

  if (!usuario) return <div style={{ padding: '2rem' }}>Cargando...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Hola, {usuario.nombre} 👋</h1>
          <p className="dashboard-subtitle">Rol: {usuario.tipoCreador} | Correo: {usuario.correo}</p>
        </div>
        <button onClick={handleCerrarSesion} className="btn-logout">Cerrar Sesión</button>
      </div>

      <div style={{ marginBottom: '2rem', textAlign: 'right' }}>
        <Link to="/registrar-obra" className="btn-registrar-obra">+ Registrar Nueva Obra</Link>
      </div>

      <div className="galeria-section">
        <h2 className="galeria-title">📚 Mis Obras Registradas ({obras.length})</h2>

        {cargando && <div className="estado-carga"><p>⏳ Cargando obras...</p></div>}
        {error && !cargando && <div className="estado-error"><p>⚠️ {error}</p></div>}

        {!cargando && !error && obras.length === 0 && (
          <div className="estado-vacio">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
            <p>Aún no has registrado ninguna obra.</p>
            <Link to="/registrar-obra" className="btn-registrar-vacio">Registrar mi primera obra</Link>
          </div>
        )}

        {!cargando && !error && obras.length > 0 && (
          <div className="galeria-grid">
            {obras.map((obra) => (
              <div key={obra.folio} className="obra-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/obra/${obra.folio}`)}>
                <div className="obra-imagen-container">
                  {obra.rutaArchivo ? (
                    <img src={`http://localhost:4000${obra.rutaArchivo}`} alt={obra.titulo} className="obra-imagen" />
                  ) : (
                    <div className="obra-sin-imagen">📄 Sin archivo</div>
                  )}
                </div>
                <div className="obra-info">
                  <div className="obra-folio">{obra.folio}</div>
                  <h3 className="obra-titulo">{obra.titulo}</h3>
                  <span className="obra-categoria">{obra.categoria}</span>
                  <p className="obra-autor">👤 {obra.autor || 'Anónimo'}</p>
                  <p className="obra-fecha">
                    📅 {new Date(obra.fechaRegistro).toLocaleDateString('es-MX')}
                  </p>
                  
                  {/* 🔑 BOTÓN VER DETALLE */}
                  <button 
                    className="btn-ver-detalle"
                    onClick={(e) => {
                      e.stopPropagation(); // Evita que se dispare el clic de la tarjeta 2 veces
                      navigate(`/obra/${obra.folio}`);
                    }}
                  >
                    Ver detalle completo →
                  </button>
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