import React, { useState } from 'react';

function Header({ onNavegar, paginaActual }) {
  // Estado para controlar si el menú móvil está abierto
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Función para alternar el menú
  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  // Función para navegar y cerrar menú en móvil
  const navegarYCerrar = (pagina) => {
    onNavegar(pagina);
    setMenuAbierto(false); // Cierra el menú después de navegar
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <div 
            className="logo" 
            onClick={() => navegarYCerrar('home')} 
            style={{ cursor: 'pointer' }}
          >
            <h1>Chazas</h1>
          </div>

          {/* Botón hamburguesa - Solo se ve en móvil */}
          <button 
            className="menu-toggle"
            onClick={toggleMenu}
          >
            ☰
          </button>

          {/* Navegación */}
          <nav className={`navigation ${menuAbierto ? 'navigation-open' : ''}`}>
            <ul className="nav-links">
              <li>
                <button 
                  onClick={() => navegarYCerrar('home')}
                  className={paginaActual === 'home' ? 'active' : ''}
                >
                  Inicio
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navegarYCerrar('buscar-chazas')}
                  className={paginaActual === 'buscar-chazas' ? 'active' : ''}
                >
                  Buscar Chazas
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navegarYCerrar('login')}
                  className={paginaActual === 'login' ? 'active' : ''}
                >
                  Iniciar Sesión
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navegarYCerrar('registro')}
                  className={paginaActual === 'registro' ? 'active' : ''}
                >
                  Registrarse
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;