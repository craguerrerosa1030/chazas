import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUniversidad } from '../context/UniversidadContext';
import Notificaciones from './Notificaciones';

function Header() {
  // Variables de estado
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { user, isAuthenticated, logout, isChazero, isEstudiante } = useAuth();
  const { universidad, cambiarUniversidad } = useUniversidad();

  // Nuevos hooks react router
  const navigate = useNavigate();
  const location = useLocation();

  // Función para alternar el menú
  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  const handleLogout = () => {
    logout();
    setMenuAbierto(false);
    navigate('/home');
  };

  // Helper para agregar clase 'active' al enlace actual
  const getLinkClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo - Ahora usa Link */}
          <Link to="/home" className="logo">
            <h1>Chazas</h1>
          </Link>

          {/* Indicador de universidad */}
          {universidad && (
            <button
              className="universidad-badge"
              onClick={cambiarUniversidad}
              title="Cambiar universidad"
            >
              {universidad.nombre_corto}
            </button>
          )}

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
                <Link
                  to="/home"
                  className={getLinkClass('/home')}
                  onClick={cerrarMenu}
                >
                  Inicio
                </Link>
              </li>

              <li>
                <Link
                  to="/sobre-nosotros"
                  className={getLinkClass('/sobre-nosotros')}
                  onClick={cerrarMenu}
                >
                  Sobre Nosotros
                </Link>
              </li>

              {/* Enlaces solo para usuarios NO autenticados */}
              {!isAuthenticated() && (
                <>
                  <li>
                    <Link 
                      to="/login"
                      className={getLinkClass('/login')}
                      onClick={cerrarMenu}
                    >
                      Iniciar Sesión
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/registro"
                      className={getLinkClass('/registro')}
                      onClick={cerrarMenu}
                    >
                      Registrarse
                    </Link>
                  </li>
                </>
              )}

              {/* Enlaces solo para usuarios autenticados */}
              {isAuthenticated() && (
                <>
                  {/* Dashboard solo para estudiantes */}
                  {isEstudiante() && (
                    <li>
                      <Link
                        to="/dashboard"
                        className={getLinkClass('/dashboard')}
                        onClick={cerrarMenu}
                      >
                        Dashboard
                      </Link>
                    </li>
                  )}

                  {/* Enlaces específicos para chazeros */}
                  {isChazero() && (
                    <>
                      <li>
                        <Link 
                          to="/mis-chazas"
                          className={getLinkClass('/mis-chazas')}
                          onClick={cerrarMenu}
                        >
                          Mi Chaza
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/crear-chaza"
                          className={`${getLinkClass('/crear-chaza')} crear-chaza-btn`}
                          onClick={cerrarMenu}
                        >
                          ➕ Crear Chaza
                        </Link>
                      </li>
                    </>
                  )}


                  {/* Notificaciones */}
                  <li className="notif-menu-item">
                    <Notificaciones />
                  </li>

                  {/* Menú de usuario */}
                  <li className="user-menu">
                    <span className="user-greeting">
                      Hola, {user?.nombre || 'Usuario'}
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
