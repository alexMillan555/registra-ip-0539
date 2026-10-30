import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Ajusta la ruta de tu CSS si es necesario

const Registro = () => {
  const [formData, setFormData] = useState({ nombre: '', correo: '', tipoCreador: '' });
  const [errores, setErrores] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errores[name]) setErrores({ ...errores, [name]: '' });
  };

  const validarFormulario = () => {
    let nuevosErrores = {};
    if (!formData.nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio.";
    
    if (!formData.correo.trim()) {
      nuevosErrores.correo = "El correo es obligatorio.";
    } else {
      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexCorreo.test(formData.correo)) nuevosErrores.correo = "El formato del correo no es válido.";
    }
    if (!formData.tipoCreador) nuevosErrores.tipoCreador = "Debes seleccionar un tipo de creador.";
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos:', formData); // Ver qué datos hay
  
    if (validarFormulario()) {
      console.log('Válido - redirigiendo'); // 
      localStorage.setItem('registraUsuarioIp', JSON.stringify(formData));
      navigate('/dashboard');
    } else {
      console.log('Errores:', errores); // Ver qué falló
    }
  };

  return (
    <div className="registro-container">
      <h2 className="registro-title">Crear Cuenta de Creador</h2>
      
      <form onSubmit={handleSubmit} className="registro-form" noValidate>
        
        {/* --- CAMPO 1: NOMBRE --- */}
        <div className="form-group">
          <label htmlFor="nombre">Nombre completo:</label>
          <input 
            type="text" 
            id="nombre"
            name="nombre" 
            value={formData.nombre} 
            onChange={handleChange} 
            placeholder="Ej. Laura Gómez"
            aria-invalid={errores.nombre ? "true" : "false"}
            aria-describedby={errores.nombre ? "error-nombre" : undefined}
            className={errores.nombre ? "input-error" : ""}
          />
          {errores.nombre && (
            <span id="error-nombre" className="error-msg" aria-live="polite">
              {errores.nombre}
            </span>
          )}
        </div>

        {/* --- CAMPO 2: CORREO ELECTRÓNICO --- */}
        <div className="form-group">
          <label htmlFor="correo">Correo electrónico:</label>
          <input 
            type="email" 
            id="correo"
            name="correo" 
            value={formData.correo} 
            onChange={handleChange} 
            placeholder="ejemplo@correo.com"
            aria-invalid={errores.correo ? "true" : "false"}
            aria-describedby={errores.correo ? "error-correo" : undefined}
            className={errores.correo ? "input-error" : ""}
          />
          {errores.correo && (
            <span id="error-correo" className="error-msg" aria-live="polite">
              {errores.correo}
            </span>
          )}
        </div>

        {/* --- CAMPO 3: SELECT TIPO DE CREADOR --- */}
        <div className="form-group">
          <label htmlFor="tipoCreador">Tipo de creador:</label>
          <select 
            id="tipoCreador"
            name="tipoCreador" 
            value={formData.tipoCreador} 
            onChange={handleChange}
            aria-invalid={errores.tipoCreador ? "true" : "false"}
            aria-describedby={errores.tipoCreador ? "error-tipoCreador" : undefined}
            className={errores.tipoCreador ? "input-error" : ""}
          >
            <option value="">-- Selecciona una opción --</option>
            <option value="Diseñador">Diseñador</option>
            <option value="Fotógrafo">Fotógrafo</option>
            <option value="Escritor">Escritor</option>
            <option value="Cineasta">Cineasta</option>
          </select>
          {errores.tipoCreador && (
            <span id="error-tipoCreador" className="error-msg" aria-live="polite">
              {errores.tipoCreador}
            </span>
          )}
        </div>

        <button type="submit" className="btn-submit">
          Registrarme
        </button>
      </form>
    </div>
  );
};

export default Registro;