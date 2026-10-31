import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Registro from './pages/Registro';
import RutaProtegida from './RutaProtegida';
import Dashboard from './pages/Dashboard'; // Asume que ya creaste este componente
import RegistrarObra from './pages/RegistrarObra';

function App() {
  return (
    <Layout>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Registro />} />
        
        {/* Ruta protegida */}
        <Route 
          path="/dashboard" 
          element={
            <RutaProtegida>
              <Dashboard />
            </RutaProtegida>
          } 
        />
        <Route 
          path="/registrar-obra" 
          element={
            <RutaProtegida>
              <RegistrarObra />
            </RutaProtegida>
          } 
        />
      </Routes>
    </Layout>
  );
}

export default App;