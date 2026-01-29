import React from 'react';

function Navegacion() {
  return (
    <nav className="navigation">
      <ul className="nav-links">
        <li><a href="/">Inicio</a></li>
        <li><a href="/buscar-chazas">Buscar Chazas</a></li>
        <li><a href="/login">Iniciar Sesión</a></li>
        <li><a href="/registro">Registrarse</a></li>
      </ul>
    </nav>
  );
}

export default Navegacion;