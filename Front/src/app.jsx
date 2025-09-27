import React, { useState } from 'react';
import {AuthProvider} from './context/AuthContext';
import Header from './componentes/Header';
import Home from './paginas/Home';
import Login from './paginas/Login';
import Registro from './paginas/Registro';
import Dashboard from './paginas/Dashboard';
import BuscarChazas from './paginas/BuscarChazas';

function App() {
  const [paginaActual, setPaginaActual] = useState('home');

  const cambiarPagina = (pagina) => {
    setPaginaActual(pagina);
  };

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
      default:
        return <Home onNavegar={cambiarPagina} />;
    }
  };

  return (
    <AuthProvider>
      <div className="App">
      <Header onNavegar={cambiarPagina} paginaActual={paginaActual} />
      <main>
        {renderizarPagina()}
      </main>
    </div>
    </AuthProvider>
    
  );
}

export default App;