import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Header from './componentes/Header';
import Home from './paginas/Home';
import Login from './paginas/Login';
import Registro from './paginas/Registro';
import Dashboard from './paginas/Dashboard';
import BuscarChazas from './paginas/BuscarChazas';
import MisPostulaciones from './paginas/MisPostulaciones';
import MisChazas from './paginas/MisChazas';
import CrearChaza from './paginas/CrearChaza';

function App() {
  // Estado para controlar la página actual (sin React Router)
  const [paginaActual, setPaginaActual] = useState('home');

  // Función para cambiar de página
  const cambiarPagina = (pagina) => {
    setPaginaActual(pagina);
    // Scroll al inicio de la página cuando cambie
    window.scrollTo(0, 0);
  };

  // Función principal que renderiza la página correspondiente
  const renderizarPagina = () => {
    switch (paginaActual) {
      case 'home':
        return <Home onNavegar={cambiarPagina} />;
      
      case 'login':
        return <Login onNavegar={cambiarPagina} />;
      
      case 'registro':
        return <Registro onNavegar={cambiarPagina} />;
      
      case 'dashboard':
        return <Dashboard onNavegar={cambiarPagina} />;
      
      case 'buscar-chazas':
        return <BuscarChazas onNavegar={cambiarPagina} />;
      
      // Página: Mis Postulaciones (solo para estudiantes)
      case 'mis-postulaciones':
        return <MisPostulaciones onNavegar={cambiarPagina} />;
      
      // Página: Mis Chazas (solo para chazeros)
      case 'mis-chazas':
        return <MisChazas onNavegar={cambiarPagina} />;
      
      // Página: Crear Chaza (solo para chazeros)
      case 'crear-chaza':
        return <CrearChaza onNavegar={cambiarPagina} />;
      
      // Página por defecto (404)
      default:
        return (
          <div className="error-page">
            <div className="container">
              <div className="error-content">
                <h1>🚫 Página no encontrada</h1>
                <p>La página que buscas no existe o ha sido movida.</p>
                <button 
                  onClick={() => cambiarPagina('home')}
                  className="btn btn-primary"
                >
                  Volver al Inicio
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    // AuthProvider envuelve toda la aplicación para manejar autenticación global
    <AuthProvider>
      <div className="App">
        {/* Header siempre visible con navegación */}
        <Header 
          onNavegar={cambiarPagina} 
          paginaActual={paginaActual} 
        />
        
        {/* Contenido principal de la página */}
        <main className="main-content">
          {renderizarPagina()}
        </main>

        {/* Footer opcional (comentado por ahora) */}
        {/*
        <footer className="footer">
          <div className="container">
            <p>&copy; 2024 Chazas. Conectando estudiantes con oportunidades.</p>
          </div>
        </footer>
        */}
      </div>
    </AuthProvider>
  );
}

export default App;