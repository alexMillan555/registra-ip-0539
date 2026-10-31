import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { generarCertificado } from '../utils/generarCertificado';
import '../App.css';

const ObraDetalle = () => {
  const { folio } = useParams(); // Obtenemos el folio de la URL
  const navigate = useNavigate();
  
  const [obra, setObra] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [generandoPDF, setGenerandoPDF] = useState(false);

  useEffect(() => {
    const cargarObra = async () => {
      try {
        setCargando(true);
        // Hacemos fetch a la lista completa y filtramos por folio
        // (En un backend más avanzado, podrías tener un endpoint GET /obras/:folio)
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
        console.error(err);
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
      console.error('Error generando PDF:', err);
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
      {/* Botón para regresar al Dashboard */}
      <button onClick={() => navigate('/dashboard')} className="btn-volver">
        ← Volver al Dashboard
      </button>

      <div className="detalle-card">
        {/* Columna Izquierda: Imagen */}
        <div className="detalle-imagen-container">
          {obra.rutaArchivo ? (
            <img 
              src={`http://localhost:4000${obra.rutaArchivo}`} 
              alt={obra.titulo} 
              className="detalle-imagen"
            />
          ) : (
            <div className="detalle-sin-imagen">📄 Sin imagen disponible</div>
          )}
        </div>

        {/* Columna Derecha: Metadatos y Botón */}
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
              <span className="metadato-valor">
                <span className="detalle-badge">{obra.categoria}</span>
              </span>
            </div>
            <div className="metadato-fila">
              <span className="metadato-label">Fecha de registro:</span>
              <span className="metadato-valor">
                {new Date(obra.fechaRegistro).toLocaleDateString('es-MX', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
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
            <button 
              onClick={handleDescargar} 
              disabled={generandoPDF}
              className="btn-descargar-grande"
            >
              {generandoPDF ? '⏳ Generando PDF...' : '📄 Descargar Certificado PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObraDetalle;