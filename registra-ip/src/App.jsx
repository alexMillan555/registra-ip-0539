import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Registro from './pages/Registro';
import RutaProtegida from './RutaProtegida';
import Dashboard from './pages/Dashboard'; // Asume que ya creaste este componente

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
      </Routes>
    </Layout>
  );
}

export default App;