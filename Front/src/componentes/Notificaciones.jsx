import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificacionesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Notificaciones() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [sinLeer, setSinLeer] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  // Cargar notificaciones al montar y periodicamente
  useEffect(() => {
    if (isAuthenticated && token) {
      cargarNotificaciones();
      // Actualizar cada 30 segundos
      const interval = setInterval(cargarConteo, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, token]);

  // Cerrar menu al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const resumen = await notificacionesApi.getResumen(token);
      setNotificaciones(resumen.notificaciones_recientes);
      setSinLeer(resumen.total_sin_leer);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarConteo = async () => {
    try {
      const data = await notificacionesApi.getCountSinLeer(token);
      setSinLeer(data.count);
    } catch (error) {
      console.error('Error cargando conteo:', error);
    }
  };

  const marcarComoLeida = async (notificacion) => {
    if (notificacion.leida) return;

    try {
      await notificacionesApi.marcarLeida(notificacion.id, token);
      setNotificaciones(prev =>
        prev.map(n =>
          n.id === notificacion.id ? { ...n, leida: true } : n
        )
      );
      setSinLeer(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marcando notificacion:', error);
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      await notificacionesApi.marcarTodasLeidas(token);
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
      setSinLeer(0);
    } catch (error) {
      console.error('Error marcando todas:', error);
    }
  };

  const handleNotificacionClick = (notificacion) => {
    marcarComoLeida(notificacion);
    setMenuAbierto(false);

    // Navegar segun el tipo de notificacion
    switch (notificacion.tipo) {
      case 'nueva_postulacion':
      case 'postulacion_cancelada':
        // Para chazeros: ir a gestionar sus chazas y ver solicitudes
        navigate('/mis-chazas');
        break;
      case 'postulacion_aceptada':
      case 'postulacion_rechazada':
        // Para estudiantes: ir al dashboard o mis solicitudes
        navigate('/dashboard');
        break;
      default:
        // Para otros tipos, ir al dashboard
        navigate('/dashboard');
        break;
    }
  };

  const getIconoTipo = (tipo) => {
    switch (tipo) {
      case 'nueva_postulacion': return '📩';
      case 'postulacion_aceptada': return '✅';
      case 'postulacion_rechazada': return '❌';
      case 'postulacion_cancelada': return '🚫';
      case 'mensaje_nuevo': return '💬';
      case 'sistema': return '🔔';
      default: return '📌';
    }
  };

  const formatearTiempo = (fecha) => {
    const ahora = new Date();
    const notifFecha = new Date(fecha);
    const diffMs = ahora - notifFecha;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHoras < 24) return `Hace ${diffHoras}h`;
    if (diffDias < 7) return `Hace ${diffDias}d`;
    return notifFecha.toLocaleDateString();
  };

  if (!isAuthenticated) return null;

  return (
    <div className="notificaciones-container" ref={menuRef}>
      {/* Boton de campana */}
      <button
        className="notificaciones-btn"
        onClick={() => {
          setMenuAbierto(!menuAbierto);
          if (!menuAbierto) cargarNotificaciones();
        }}
        title="Notificaciones"
      >
        <span className="notif-icon">🔔</span>
        {sinLeer > 0 && (
          <span className="notif-badge">
            {sinLeer > 99 ? '99+' : sinLeer}
          </span>
        )}
      </button>

      {/* Menu desplegable */}
      {menuAbierto && (
        <div className="notificaciones-menu">
          <div className="notif-menu-header">
            <h4>Notificaciones</h4>
            {sinLeer > 0 && (
              <button
                className="btn-marcar-todas"
                onClick={marcarTodasLeidas}
              >
                Marcar todas como leidas
              </button>
            )}
          </div>

          <div className="notif-menu-body">
            {loading ? (
              <div className="notif-loading">
                <span>Cargando...</span>
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="notif-empty">
                <span className="empty-icon">📭</span>
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              <div className="notif-lista">
                {notificaciones.map(notif => (
                  <div
                    key={notif.id}
                    className={`notif-item ${!notif.leida ? 'sin-leer' : ''}`}
                    onClick={() => handleNotificacionClick(notif)}
                  >
                    <div className="notif-icono">
                      {getIconoTipo(notif.tipo)}
                    </div>
                    <div className="notif-contenido">
                      <p className="notif-titulo">{notif.titulo}</p>
                      <p className="notif-mensaje">{notif.mensaje}</p>
                      <span className="notif-tiempo">
                        {formatearTiempo(notif.created_at)}
                      </span>
                    </div>
                    {!notif.leida && <span className="notif-punto-nuevo" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="notif-menu-footer">
            <button
              className="btn-ver-todas"
              onClick={() => {
                setMenuAbierto(false);
                navigate('/notificaciones');
              }}
            >
              Ver todas las notificaciones
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notificaciones;