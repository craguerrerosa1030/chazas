import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { solicitudesApi } from '../services/api';

function Dashboard() {
  const { user, token, isChazero } = useAuth();
  const navigate = useNavigate();

  // Estados para solicitudes
  const [misSolicitudes, setMisSolicitudes] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
  const [cancelandoId, setCancelandoId] = useState(null);

  // Redirigir chazeros a Mi Chaza
  useEffect(() => {
    if (isChazero()) {
      navigate('/mis-chazas');
    }
  }, [isChazero, navigate]);

  // Cargar mis solicitudes
  useEffect(() => {
    const cargarSolicitudes = async () => {
      if (!token || isChazero()) return;

      try {
        setLoadingSolicitudes(true);
        const data = await solicitudesApi.getMisSolicitudes(token);
        setMisSolicitudes(data);
      } catch (error) {
        console.error('Error cargando solicitudes:', error);
      } finally {
        setLoadingSolicitudes(false);
      }
    };

    cargarSolicitudes();
  }, [token, isChazero]);

  // Cancelar solicitud
  const cancelarSolicitud = async (solicitudId) => {
    if (!window.confirm('¿Estás seguro de cancelar esta solicitud?')) return;

    try {
      setCancelandoId(solicitudId);
      await solicitudesApi.cancelar(solicitudId, token);
      // Actualizar lista
      setMisSolicitudes(prev =>
        prev.map(s => s.id === solicitudId ? { ...s, estado: 'cancelada' } : s)
      );
    } catch (error) {
      console.error('Error cancelando solicitud:', error);
      alert(error.message || 'Error al cancelar la solicitud');
    } finally {
      setCancelandoId(null);
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Si es chazero, no mostrar nada mientras redirige
  if (isChazero()) {
    return null;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-content">
          {/* Bienvenida */}
          <div className="dashboard-header">
            <h1>Hola, {user?.nombre || 'Estudiante'}</h1>
            <p>Bienvenido a Chazas App</p>
          </div>

          {/* Sección principal */}
          <div className="dashboard-section">
            <h2>Busca trabajo en chazas</h2>
            <p>Explora las chazas disponibles cerca de tu universidad y contacta directamente por WhatsApp</p>

            <div className="dashboard-actions">
              <button
                className="btn btn-primary btn-large"
                onClick={() => navigate('/home')}
              >
                Ver Chazas Disponibles
              </button>
            </div>
          </div>

          {/* Sección de Mis Solicitudes */}
          <div className="dashboard-section mis-solicitudes-section">
            <h2>Mis Solicitudes de Trabajo</h2>

            {loadingSolicitudes ? (
              <div className="solicitudes-loading">
                <p>Cargando solicitudes...</p>
              </div>
            ) : misSolicitudes.length === 0 ? (
              <div className="solicitudes-empty">
                <p>No has enviado ninguna solicitud todavía.</p>
                <p>Explora las chazas disponibles y postúlate para trabajar.</p>
              </div>
            ) : (
              <div className="mis-solicitudes-lista">
                {misSolicitudes.map(sol => (
                  <div key={sol.id} className={`mi-solicitud-card estado-${sol.estado}`}>
                    <div className="mi-solicitud-header">
                      <h4>{sol.chaza_nombre}</h4>
                      <span className={`estado-badge ${sol.estado}`}>
                        {sol.estado === 'pendiente' && '⏳ Pendiente'}
                        {sol.estado === 'aceptada' && '✅ Aceptada'}
                        {sol.estado === 'rechazada' && '❌ Rechazada'}
                        {sol.estado === 'cancelada' && '🚫 Cancelada'}
                      </span>
                    </div>

                    <div className="mi-solicitud-info">
                      <p><strong>Horarios:</strong> {sol.horarios_formateados}</p>
                      {sol.mensaje && (
                        <p><strong>Tu mensaje:</strong> "{sol.mensaje}"</p>
                      )}
                      <p className="fecha-envio">Enviada el {formatearFecha(sol.created_at)}</p>
                    </div>

                    {sol.estado === 'aceptada' && sol.respuesta && (
                      <div className="respuesta-chazero aceptada">
                        <strong>Respuesta del chazero:</strong>
                        <p>"{sol.respuesta}"</p>
                      </div>
                    )}

                    {sol.estado === 'rechazada' && (
                      <div className="respuesta-chazero rechazada">
                        {sol.respuesta ? (
                          <>
                            <strong>Mensaje del chazero:</strong>
                            <p>"{sol.respuesta}"</p>
                          </>
                        ) : (
                          <p>No te desanimes, sigue buscando oportunidades.</p>
                        )}
                      </div>
                    )}

                    {sol.estado === 'pendiente' && (
                      <div className="mi-solicitud-acciones">
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => cancelarSolicitud(sol.id)}
                          disabled={cancelandoId === sol.id}
                        >
                          {cancelandoId === sol.id ? 'Cancelando...' : 'Cancelar solicitud'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info sobre cómo funciona */}
          <div className="dashboard-section">
            <h2>Cómo funciona</h2>
            <div className="como-funciona-grid">
              <div className="paso-card">
                <div className="paso-numero">1</div>
                <h4>Explora chazas</h4>
                <p>Busca chazas cerca de tu universidad en la página de inicio</p>
              </div>
              <div className="paso-card">
                <div className="paso-numero">2</div>
                <h4>Ve los horarios</h4>
                <p>Revisa los horarios disponibles de cada chaza</p>
              </div>
              <div className="paso-card">
                <div className="paso-numero">3</div>
                <h4>Selecciona tus horas</h4>
                <p>Escoge las horas en las que puedes trabajar</p>
              </div>
              <div className="paso-card">
                <div className="paso-numero">4</div>
                <h4>Envía tu solicitud</h4>
                <p>Postúlate y espera la respuesta del chazero</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
