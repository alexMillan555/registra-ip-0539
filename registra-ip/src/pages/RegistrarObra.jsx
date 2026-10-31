import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BarraProgreso from '../components/BarraProgreso';
import '../App.css';

// ==========================================================
// 🔑 CONFIGURACIÓN DEL FOLIO
// ==========================================================
const BOLETA = '0539';
const PREFIJO_FOLIO = `OBRA-${BOLETA}-`;
const CLAVE_CONSECUTIVO = 'registra-ip-consecutivo';

const obtenerSiguienteConsecutivo = () => {
  try {
    const actual = parseInt(localStorage.getItem(CLAVE_CONSECUTIVO) || '0', 10);
    const siguiente = actual + 1;
    localStorage.setItem(CLAVE_CONSECUTIVO, siguiente.toString());
    return siguiente;
  } catch (e) {
    return 1;
  }
};

const formatearConsecutivo = (num) => String(num).padStart(3, '0');

const RegistrarObra = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Estados
  const [datosWizard, setDatosWizard] = useState({
    archivo: null, preview: null, folio: '', titulo: '',
    categoria: '', autor: '', descripcion: ''
  });
  const [pasoActual, setPasoActual] = useState(1);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [folioGenerado, setFolioGenerado] = useState('');

  const pasos = [
    { titulo: 'Archivo', descripcion: 'Sube tu obra' },
    { titulo: 'Metadatos', descripcion: 'Describe tu obra' },
    { titulo: 'Vista Previa', descripcion: 'Revisa los datos' },
    { titulo: 'Confirmación', descripcion: 'Registra la obra' }
  ];

  // Actualizador genérico
  const actualizarDatos = (nuevosDatos) => {
    setDatosWizard(prev => ({ ...prev, ...nuevosDatos }));
  };

  useEffect(() => {
    return () => {
      if (datosWizard.preview) URL.revokeObjectURL(datosWizard.preview);
    };
  }, [datosWizard.preview]);

  // Validación
  const esPasoValido = () => {
    if (pasoActual === 1) return datosWizard.archivo !== null;
    if (pasoActual === 2) {
      return datosWizard.titulo.trim().length >= 5 && datosWizard.categoria !== '';
    }
    return true;
  };
  const pasoEsValido = esPasoValido();

  // Handlers
  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo excede el límite de 10MB.');
      return;
    }
    if (datosWizard.preview) URL.revokeObjectURL(datosWizard.preview);
    actualizarDatos({ archivo: file, preview: URL.createObjectURL(file) });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    actualizarDatos({ [name]: value });
    if (error) setError('');
  };

  // Navegación
  const siguientePaso = () => {
    if (!pasoEsValido) {
      if (pasoActual === 1) return setError('Debes subir un archivo antes de continuar.');
      if (pasoActual === 2) return setError('El título debe tener al menos 5 caracteres y debes elegir una categoría.');
      return;
    }
    setError('');
    
    if (pasoActual === 3) {
      const consecutivo = obtenerSiguienteConsecutivo();
      const folio = PREFIJO_FOLIO + formatearConsecutivo(consecutivo);
      setFolioGenerado(folio);
    }
    
    setPasoActual(pasoActual + 1);
  };

  const pasoAnterior = () => {
    if (pasoActual === 1) return;
    setError('');
    setPasoActual(pasoActual - 1);
  };

  const irAPaso = (numeroPaso) => {
    setError('');
    setPasoActual(numeroPaso);
  };

  // ==========================================================
  // 🔑 CANCELAR CON CONFIRMACIÓN
  // ==========================================================
  const handleCancelar = () => {
    // Verificamos si hay datos capturados (para advertir del riesgo de perderlos)
    const hayDatos = datosWizard.archivo || datosWizard.titulo || datosWizard.categoria;

    // Si no hay datos, salimos directo sin molestar al usuario
    if (!hayDatos) {
      navigate('/dashboard');
      return;
    }

    // Si hay datos, pedimos confirmación
    const confirmar = window.confirm(
      '¿Estás seguro de cancelar el registro?\n\n' +
      'Se perderán todos los datos que has capturado hasta el momento.'
    );

    if (confirmar) {
      // Limpiar el estado antes de salir
      resetearWizard();
      navigate('/dashboard');
    }
  };

  // Envío final
  const confirmarRegistro = async () => {
    if (enviando) return;
    setEnviando(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('archivo', datosWizard.archivo);
      formData.append('folio', folioGenerado);
      formData.append('titulo', datosWizard.titulo);
      formData.append('categoria', datosWizard.categoria);
      formData.append('descripcion', datosWizard.descripcion);
      formData.append('autor', datosWizard.autor);

      const respuesta = await fetch('http://localhost:4000/obras', {
        method: 'POST',
        body: formData
      });

      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || 'Error al registrar la obra');

      alert(`¡Obra registrada exitosamente!\n\nFolio: ${folioGenerado}\nTítulo: ${datosWizard.titulo}`);
      resetearWizard();
      navigate('/dashboard');

    } catch (err) {
      setError(err.message || 'No se pudo conectar con el servidor.');
    } finally {
      setEnviando(false);
    }
  };

  const resetearWizard = () => {
    if (datosWizard.preview) URL.revokeObjectURL(datosWizard.preview);
    setDatosWizard({ archivo: null, preview: null, folio: '', titulo: '', categoria: '', autor: '', descripcion: '' });
    setFolioGenerado('');
    setPasoActual(1);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <div className="wizard-container">
      
      {/* ==========================================
          🔑 BOTÓN DE CANCELAR (Flecha + X con casita)
      ========================================== */}
      <button 
        onClick={handleCancelar} 
        className="btn-cancelar-wizard"
        title="Cancelar y volver al Dashboard"
        aria-label="Cancelar registro y volver al inicio"
      >
        <span className="btn-cancelar-icono">🏠</span>
        <span className="btn-cancelar-texto">Cancelar</span>
        <span className="btn-cancelar-x">✕</span>
      </button>

      <h2 className="wizard-title">Registrar Nueva Obra</h2>

      <BarraProgreso pasoActual={pasoActual} totalPasos={4} pasos={pasos} />

      {error && <div className="wizard-error" aria-live="polite">⚠️ {error}</div>}

      <div className="wizard-body">
        {/* PASO 1 */}
        {pasoActual === 1 && (
          <div className="wizard-paso">
            <h3>Paso 1: Sube el archivo de tu obra</h3>
            <p>Formatos permitidos: JPG, PNG, PDF (máx. 10MB)</p>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleArchivoChange} className="input-file" />
            {datosWizard.preview && (
              <div className="preview-box">
                <img src={datosWizard.preview} alt="Vista previa" />
                <p><strong>Archivo:</strong> {datosWizard.archivo.name}</p>
                <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                  Tamaño: {(datosWizard.archivo.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
          </div>
        )}

        {/* PASO 2 */}
        {pasoActual === 2 && (
          <div className="wizard-paso">
            <h3>Paso 2: Información de la obra</h3>
            <div className="info-folio-auto">
              <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1rem' }}>
                📌 El folio se generará automáticamente con el formato <strong>OBRA-{BOLETA}-XXX</strong>.
              </p>
            </div>
            <div className="form-group">
              <label>Título * (mínimo 5 caracteres)</label>
              <input type="text" name="titulo" value={datosWizard.titulo} onChange={handleChange} placeholder="Ej. La noche estrellada" />
              {datosWizard.titulo.length > 0 && datosWizard.titulo.trim().length < 5 && (
                <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Faltan {5 - datosWizard.titulo.trim().length} caracteres
                </span>
              )}
            </div>
            <div className="form-group">
              <label>Categoría *</label>
              <select name="categoria" value={datosWizard.categoria} onChange={handleChange}>
                <option value="">-- Selecciona --</option>
                <option value="Pintura">Pintura</option>
                <option value="Escultura">Escultura</option>
                <option value="Fotografía">Fotografía</option>
                <option value="Digital">Arte Digital</option>
              </select>
            </div>
            <div className="form-group">
              <label>Autor</label>
              <input type="text" name="autor" value={datosWizard.autor} onChange={handleChange} placeholder="Ej. Vincent van Gogh" />
            </div>
            <div className="form-group">
              <label>Descripción (opcional)</label>
              <textarea name="descripcion" value={datosWizard.descripcion} onChange={handleChange} rows="3" placeholder="Breve descripción..."></textarea>
            </div>
          </div>
        )}

        {/* PASO 3 */}
        {pasoActual === 3 && (
          <div className="wizard-paso">
            <h3>Paso 3: Revisa toda la información</h3>
            <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
              Verifica que todos los datos sean correctos antes de registrar la obra.
            </p>
            <div className="vista-previa-grid">
              <div className="vista-previa-imagen">
                {datosWizard.preview ? <img src={datosWizard.preview} alt="Obra seleccionada" className="preview-img-grande" /> : <div className="sin-preview">Sin imagen</div>}
                <div className="info-archivo">
                  <p><strong>{datosWizard.archivo?.name}</strong></p>
                  <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{(datosWizard.archivo?.size / 1024).toFixed(2)} KB</p>
                  <button className="btn-editar-seccion" onClick={() => irAPaso(1)}>✏️ Cambiar archivo</button>
                </div>
              </div>
              <div className="vista-previa-metadatos">
                <h4>Información de la obra</h4>
                <div className="dato-fila"><span className="dato-label">Folio:</span><span className="dato-valor"><em style={{ color: '#6B7280', fontSize: '0.85rem' }}>Se generará al confirmar</em></span></div>
                <div className="dato-fila"><span className="dato-label">Título:</span><span className="dato-valor">{datosWizard.titulo}</span></div>
                <div className="dato-fila"><span className="dato-label">Categoría:</span><span className="dato-valor"><span className="badge-categoria">{datosWizard.categoria}</span></span></div>
                <div className="dato-fila"><span className="dato-label">Autor:</span><span className="dato-valor">{datosWizard.autor || '(Sin autor)'}</span></div>
                <div className="dato-fila dato-descripcion"><span className="dato-label">Descripción:</span><span className="dato-valor">{datosWizard.descripcion || <em style={{ color: '#9CA3AF' }}>(Sin descripción)</em>}</span></div>
                <button className="btn-editar-seccion" onClick={() => irAPaso(2)}>✏️ Editar metadatos</button>
              </div>
            </div>
            <div className="aviso-confirmacion">
              <strong>⚠️ Importante:</strong> Una vez confirmada, la obra se registrará en el sistema y el archivo se subirá al servidor. No podrás modificarla después.
            </div>
          </div>
        )}

        {/* PASO 4 */}
        {pasoActual === 4 && (
          <div className="wizard-paso">
            <h3>Paso 4: Confirma el registro</h3>
            <p>Al confirmar, la obra será registrada en el sistema y el archivo se subirá al servidor.</p>
            <div className="confirmacion-folio">
              <p className="confirmacion-label">Folio asignado:</p>
              <p className="confirmacion-folio-valor">{folioGenerado}</p>
              <p className="confirmacion-titulo"><strong>{datosWizard.titulo}</strong></p>
            </div>
            <div className="confirm-box">
              <p style={{ margin: 0 }}>✅ Todo listo. Al hacer clic en <strong>"Confirmar Registro"</strong>, se subirá el archivo y se guardarán los metadatos.</p>
            </div>
            {enviando && <div className="enviando-indicador"><p>⏳ Enviando archivo al servidor... por favor espera.</p></div>}
          </div>
        )}
      </div>

      {/* BOTONES DE NAVEGACIÓN */}
      <div className="wizard-footer">
        <button onClick={pasoAnterior} disabled={pasoActual === 1 || enviando} className="btn-secondary">
          ← Atrás
        </button>
        {pasoActual < 4 ? (
          <button onClick={siguientePaso} disabled={!pasoEsValido} className="btn-primary" title={!pasoEsValido ? 'Completa los campos requeridos para continuar' : ''}>
            Siguiente →
          </button>
        ) : (
          <button onClick={confirmarRegistro} disabled={enviando} className="btn-primary">
            {enviando ? '⏳ Registrando...' : '✓ Confirmar Registro'}
          </button>
        )}
      </div>
    </div>
  );
};

export default RegistrarObra;