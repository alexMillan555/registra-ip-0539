import React from 'react';
import { Navigate } from 'react-router-dom';

const RutaProtegida = ({ children }) => {
  // Verificamos la nueva clave
  const usuarioString = localStorage.getItem('registraUsuarioIp');

  if (!usuarioString) {
    return <Navigate to="/" replace />; // Si no hay sesión, patada al inicio
  }

  return children; // Si hay sesión, deja pasar
};

export default RutaProtegida;