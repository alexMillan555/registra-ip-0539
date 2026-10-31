import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

const CATEGORIAS = ['Todas', 'Diseño', 'Fotografía', 'Escritura', 'Cine', 'Pintura', 'Escultura', 'Digital'];

const Galeria = () => {
  const [obras, setObras] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [orden, setOrden] = useState('recientes');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cargarObras = async () => {
      try {
        setCargando(true);
        await new Promise(resolve => setTimeout(resolve, 800)); 
        const respuesta = await fetch('http://localhost:4000/obras');
        if (!respuesta.ok) throw new Error('Error al conectar');
        const datos = await respuesta.json();
        setObras(datos.obras || []);
      } catch (err) {
        setError('No se pudieron cargar las obras. Revisa el backend.');
      } finally {
        setCargando(false);
      }
    };
    cargarObras();
  }, []);

  const obrasProcesadas = obras
    .filter((obra) => {
      const textoBusqueda = busqueda.toLowerCase().trim();
      const titulo = obra.titulo ? obra.titulo.toLowerCase() : '';
      const autor = obra.autor ? obra.autor.toLowerCase() : '';
      const coincideTexto = titulo.includes(textoBusqueda) || autor.includes(textoBusqueda);
      const coincideCategoria = categoriaActiva === 'Todas' || obra.categoria === categoriaActiva;
      return coincideTexto && coincideCategoria;
    })
    .sort((a, b) => {
      const fechaA = new Date(a.fechaRegistro).getTime();
      const fechaB = new Date(b.fechaRegistro).getTime();
      return orden === 'recientes' ? fechaB - fechaA : fechaA - fechaB;
    });

  const obtenerIconoArchivo = (nombreArchivo) => {
    if (!nombreArchivo) return '📄';
    const extension = nombreArchivo.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return '🖼️';
    if (extension === 'pdf') return '📕';
    return '📎';
  };

  if (cargando) {
    return (
      <div className="galeria-container">
        <div className="galeria-header"><div><div className="skeleton-title"></div></div></div>
        <div className="skeleton-buscador"></div>
        <div className="grid-obras">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="tarjeta-obra skeleton-card">
              <div className="tarjeta-imagen-container skeleton-imagen"></div>
              <div className="tarjeta-info">
                <div className="skeleton-text" style={{ width: '30%' }}></div>
                <div className="skeleton-text" style={{ width: '80%', height: '1.5rem', margin: '0.5rem 0' }}></div>
                <div className="skeleton-text" style={{ width: '50%' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) return <div className="galeria-estado error">⚠️ {error}</div>;

  return (
    <div className="galeria-container">
      <button onClick={() => navigate('/dashboard')} className="btn-volver-galeria">
        ← Volver al Dashboard
      </button>

      <div className="galeria-header">
        <div>
          <h1 className="galeria-main-title">Galería de Obras</h1>
          <p className="galeria-subtitle">Explora el catálogo completo</p>
        </div>
        <Link to="/registrar-obra" className="btn-registrar">+ Nueva Obra</Link>
      </div>

      <div className="controles-galeria">
        <div className="buscador-container">
          <span className="buscador-icono">🔍</span>
          <input type="text" placeholder="Buscar por título o autor..." className="buscador-input" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          {busqueda && <button className="buscador-limpiar" onClick={() => setBusqueda('')}>✕</button>}
        </div>

        <div className="orden-container">
          <label htmlFor="ordenSelect" className="orden-label">Ordenar por:</label>
          <select id="ordenSelect" className="select-nativo" value={orden} onChange={(e) => setOrden(e.target.value)}>
            <option value="recientes">Más recientes primero</option>
            <option value="antiguas">Más antiguas primero</option>
          </select>
        </div>
      </div>

      <div className="filtros-categoria">
        {CATEGORIAS.map((cat) => (
          <button key={cat} className={`btn-filtro ${categoriaActiva === cat ? 'activo' : ''}`} onClick={() => setCategoriaActiva(cat)}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid-obras">
        {obrasProcesadas.map((obra) => {
          const extension = obra.archivo ? obra.archivo.split('.').pop().toLowerCase() : '';
          const esImagen = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);

          return (
            <div 
              key={obra.folio} 
              className="tarjeta-obra"
              // 🔑 AQUÍ PASAMOS EL ESTADO DE ORIGEN
              onClick={() => navigate(`/obra/${obra.folio}`, { state: { origen: 'galeria' } })}
            >
              <div className="tarjeta-imagen-container">
                {esImagen && obra.rutaArchivo ? (
                  <img src={`http://localhost:4000${obra.rutaArchivo}`} alt={obra.titulo} className="tarjeta-imagen" />
                ) : (
                  <div className="tarjeta-icono-fallback"><span className="icono-grande">{obtenerIconoArchivo(obra.archivo)}</span></div>
                )}
              </div>

              <div className="tarjeta-info">
                <span className="tarjeta-categoria">{obra.categoria}</span>
                <h3 className="tarjeta-titulo">{obra.titulo}</h3>
                <p className="tarjeta-autor">👤 {obra.autor || 'Anónimo'}</p>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.5rem' }}>
                  📅 {new Date(obra.fechaRegistro).toLocaleDateString('es-MX')}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {obrasProcesadas.length === 0 && (
        <div className="galeria-vacia">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <p>No se encontraron obras con los filtros seleccionados.</p>
          <button onClick={() => { setBusqueda(''); setCategoriaActiva('Todas'); }} className="btn-registrar" style={{ marginTop: '1rem' }}>
            Limpiar todos los filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default Galeria;