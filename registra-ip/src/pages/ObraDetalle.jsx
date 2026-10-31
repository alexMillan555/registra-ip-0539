import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { generarCertificado } from '../utils/generarCertificado';
import '../App.css';

const ObraDetalle = () => {
  const { folio } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [obra, setObra] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [generandoPDF, setGenerandoPDF] = useState(false);

  // 🔑 1. DETERMINAR EL ORIGEN
  // Si venimos del Dashboard, 'origen' será 'dashboard'.
  // Si no (ej. venimos de Galería), por defecto asumimos 'galeria'.
  const origen = location.state?.origen || 'galeria';

  // 🔑 2. CONFIGURAR EL BOTÓN DE VOLVER (Contextual)
  const textoVolver = origen === 'dashboard' ? '← Volver al Dashboard' : '← Volver a la Galería';
  const rutaVolver = origen === 'dashboard' ? '/dashboard' : '/galeria';

  useEffect(() => {
    const cargarObra = async () => {
      try {
        setCargando(true);
        const respuesta = await fetch('http://localhost:4000/obras');
        if (!respuesta.ok) throw new Error('Error al conectar con el servidor');
        
        const datos = await respuesta.json();
        const obraEncontrada = (datos.obras || []).find(o => o.folio === folio);
        
        if (obraEncontrada) {
          setObra(obraEncontrada);
        } else {
          setError('No se encontró la obra solicitada.');
        }
      } catch (err) {
        setError('No se pudo cargar la información de la obra.');
      } finally {
        setCargando(false);
      }
    };
    cargarObra();
  }, [folio]);

  const handleDescargar = async () => {
    try {
      setGenerandoPDF(true);
      await generarCertificado(obra);
    } catch (err) {
      alert('No se pudo generar el certificado.');
    } finally {
      setGenerandoPDF(false);
    }
  };

  if (cargando) return <div className="detalle-cargando">⏳ Cargando detalles de la obra...</div>;
  if (error) return <div className="detalle-error">⚠️ {error} <br/><br/> <Link to="/dashboard">Volver al inicio</Link></div>;
  if (!obra) return null;

  return (
    <div className="detalle-container">
      
      {/* BOTÓN VOLVER (Cambia según el origen) */}
      <button onClick={() => navigate(rutaVolver)} className="btn-volver">
        {textoVolver}
      </button>

      <div className="detalle-card">
        <div className="detalle-imagen-container">
          {obra.rutaArchivo ? (
            <img src={`http://localhost:4000${obra.rutaArchivo}`} alt={obra.titulo} className="detalle-imagen" />
          ) : (
            <div className="detalle-sin-imagen">📄 Sin imagen disponible</div>
          )}
        </div>

        <div className="detalle-info">
          <div className="detalle-folio">{obra.folio}</div>
          <h1 className="detalle-titulo">{obra.titulo}</h1>
          
          <div className="detalle-metadatos">
            <div className="metadato-fila">
              <span className="metadato-label">Autor:</span>
              <span className="metadato-valor">{obra.autor || 'Anónimo'}</span>
            </div>
            <div className="metadato-fila">
              <span className="metadato-label">Categoría:</span>
              <span className="metadato-valor"><span className="detalle-badge">{obra.categoria}</span></span>
            </div>
            <div className="metadato-fila">
              <span className="metadato-label">Fecha de registro:</span>
              <span className="metadato-valor">
                {new Date(obra.fechaRegistro).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
            {obra.descripcion && (
              <div className="metadato-fila">
                <span className="metadato-label">Descripción:</span>
                <span className="metadato-valor">{obra.descripcion}</span>
              </div>
            )}
          </div>

          <div className="detalle-acciones">
            <button onClick={handleDescargar} disabled={generandoPDF} className="btn-descargar-grande">
              {generandoPDF ? '⏳ Generando PDF...' : '📄 Descargar Certificado PDF'}
            </button>

            {/* 🔑 3. BOTÓN EXTRA: Solo se renderiza si el origen es 'dashboard' */}
            {origen === 'dashboard' && (
              <Link to="/galeria" className="btn-ver-galeria-desde-detalle">
                🖼️ Explorar toda la Galería
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObraDetalle;