import React from 'react';
import '../App.css';

const Layout = ({ children }) => {
    return (
      <div className="app-container">
        {/* ENCABEZADO */}
        <header className="app-header">
          <div className="header-logo">
            <span className="logo-icon">🔒</span>
            <h1 className="header-title">REGISTRA-IP</h1>
          </div>
          <nav className="header-nav">
            <a href="#inicio">Inicio</a>
            <a href="#registros">Registros</a>
          </nav>
        </header>
  
        {/* CONTENIDO PRINCIPAL (Aquí se inyectan las otras vistas) */}
        <main className="app-main">
          {children}
        </main>
  
        {/* PIE DE PÁGINA (Opcional) */}
        <footer className="app-footer">
          <p>&copy; 2024 REGISTRA-IP. Todos los derechos reservados.</p>
        </footer>
      </div>
    );
  };
  
  export default Layout;