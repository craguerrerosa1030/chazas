import React from 'react';
import Navegacion from './Navegacion';

function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <h1>Chazas</h1>
          </div>
          <Navegacion />
        </div>
      </div>
    </header>
  );
}

export default Header;