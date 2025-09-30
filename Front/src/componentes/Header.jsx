import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Header({ onNavegar, paginaActual }) {
  // Estado para controlar si el menú móvil está abierto
  const [menuAbierto, setMenuAbierto] = useState(false);
  
  // Obtener datos del usuario autenticado
  const { user, isAuthenticated, logout, isChazero, isEstudiante } = useAuth();

  // Función para alternar el menú
  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  // Función para navegar y cerrar menú en móvil
  const navegarYCerrar = (pagina) => {
    onNavegar(pagina);
    setMenuAbierto(false); // Cierra el menú después de navegar
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    logout();
    setMenuAbierto(false);
    onNavegar('home'); // Redirigir al home después del logout
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo - Clickeable para ir al home */}
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
            aria-label="Toggle menu"
          >
            ☰
          </button>

          {/* Navegación - Cambia según si está autenticado o no */}
          <nav className={`navigation ${menuAbierto ? 'navigation-open' : ''}`}>
            <ul className="nav-links">
              {/* Enlaces siempre visibles */}
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

              {/* Enlaces solo para usuarios NO autenticados */}
              {!isAuthenticated() && (
                <>
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
                </>
              )}

              {/* Enlaces solo para usuarios autenticados */}
              {isAuthenticated() && (
                <>
                  <li>
                    <button 
                      onClick={() => navegarYCerrar('dashboard')}
                      className={paginaActual === 'dashboard' ? 'active' : ''}
                    >
                      Dashboard
                    </button>
                  </li>

                  {/* Enlaces específicos para chazeros */}
                  {isChazero() && (
                    <>
                      <li>
                        <button 
                          onClick={() => navegarYCerrar('mis-chazas')}
                          className={paginaActual === 'mis-chazas' ? 'active' : ''}
                        >
                          Mi Chaza
                        </button>
                      </li>
                      <li>
                        <button 
                          onClick={() => navegarYCerrar('crear-chaza')}
                          className={`${paginaActual === 'crear-chaza' ? 'active' : ''} crear-chaza-btn`}
                        >
                          ➕ Crear Chaza
                        </button>
                      </li>
                    </>
                  )}

                  {/* Enlaces específicos para estudiantes */}
                  {isEstudiante() && (
                    <li>
                      <button 
                        onClick={() => navegarYCerrar('mis-postulaciones')}
                        className={paginaActual === 'mis-postulaciones' ? 'active' : ''}
                      >
                        Mis Postulaciones
                      </button>
                    </li>
                  )}

                  {/* Menú de usuario */}
                  <li className="user-menu">
                    <span className="user-greeting">
                      Hola, {user.nombre}
                    </span>
                    <button 
                      onClick={handleLogout}
                      className="logout-btn"
                    >
                      Cerrar Sesión
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;