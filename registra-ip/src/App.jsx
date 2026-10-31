import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RutaProtegida from './RutaProtegida';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import RegistrarObra from './pages/RegistrarObra';
import ObraDetalle from './pages/ObraDetalle'; // 🔑 NUEVO IMPORT

function App() {
  return (
    <Layout>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Registro />} />
        
        {/* Rutas protegidas */}
        <Route path="/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
        <Route path="/registrar-obra" element={<RutaProtegida><RegistrarObra /></RutaProtegida>} />
        
        {/* 🔑 NUEVA RUTA DINÁMICA: El ":folio" es un parámetro de la URL */}
        <Route path="/obra/:folio" element={<RutaProtegida><ObraDetalle /></RutaProtegida>} />
      </Routes>
    </Layout>
  );
}

export default App;