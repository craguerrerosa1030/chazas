import React from 'react';
import ChazasGrid from '../componentes/ChazasGrid';

function Home({ onNavegar }) {
  return (
    <div className="home">
      <div className="hero">
        <h1>¡Bienvenido a Chazas!</h1>
        <p>Conectamos estudiantes que buscan trabajo con chazas que necesitan personal</p>
        <div className="hero-buttons">
          <button 
            onClick={() => onNavegar('registro')}
            className="btn btn-primary"
          >
            Buscar Trabajo
          </button>
          <button 
            onClick={() => onNavegar('registro')}
            className="btn btn-secondary"
          >
            Publicar Chaza
          </button>
        </div>
      </div>
      
      {/* NUEVA SECCIÓN: Grid de chazas */}
      <ChazasGrid onNavegar={onNavegar} />
    </div>
  );
}

export default Home;