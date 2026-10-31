import React from 'react';
import '../App.css';

const BarraProgreso = ({ pasoActual, totalPasos = 4, pasos }) => {
  // Calcular porcentaje de avance
  const porcentaje = Math.round((pasoActual / totalPasos) * 100);

  return (
    <div 
      className="barra-progreso-container"
      role="progressbar"
      aria-valuenow={pasoActual}
      aria-valuemin={1}
      aria-valuemax={totalPasos}
      aria-label={`Paso ${pasoActual} de ${totalPasos}`}
    >
      {/* Barra lineal de fondo */}
      <div className="barra-fondo">
        <div 
          className="barra-relleno" 
          style={{ width: `${porcentaje}%` }}
        ></div>
      </div>

      {/* Círculos de cada paso */}
      <div className="barra-pasos">
        {pasos.map((paso, index) => {
          const numeroPaso = index + 1;
          let estado = 'pendiente';
          
          if (numeroPaso < pasoActual) estado = 'completado';
          else if (numeroPaso === pasoActual) estado = 'activo';

          return (
            <div 
              key={paso.titulo} 
              className={`paso-item ${estado}`}
              aria-current={numeroPaso === pasoActual ? 'step' : undefined}
            >
              {/* Círculo con número o check */}
              <div className="paso-circulo">
                {estado === 'completado' ? (
                  <span className="icono-check">✓</span>
                ) : (
                  <span className="icono-numero">{numeroPaso}</span>
                )}
              </div>
              
              {/* Texto descriptivo */}
              <div className="paso-texto">
                <span className="paso-titulo">{paso.titulo}</span>
                <span className="paso-descripcion">{paso.descripcion}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Porcentaje de avance */}
      <div className="barra-porcentaje">
        <span>{porcentaje}% completado</span>
      </div>
    </div>
  );
};

export default BarraProgreso;