import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { chazasApi, solicitudesApi, getStaticUrl } from '../services/api';
import EditorHorarios from '../componentes/EditorHorarios';

function MisChazas() {
  const { token, isChazero } = useAuth();
  const navigate = useNavigate();

  const [miChaza, setMiChaza] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guardandoHorarios, setGuardandoHorarios] = useState(false);
  const [mensajeHorarios, setMensajeHorarios] = useState(null);

  // Estados para solicitudes
  const [solicitudes, setSolicitudes] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [filtroSolicitudes, setFiltroSolicitudes] = useState('pendiente');
  const [respondiendoId, setRespondiendoId] = useState(null);

  // Cargar solicitudes de la chaza
  const cargarSolicitudes = async (chazaId, estado = null) => {
    try {
      setLoadingSolicitudes(true);
      const data = await solicitudesApi.getSolicitudesChaza(chazaId, token, estado);
      setSolicitudes(data);
    } catch (err) {
      console.error('Error cargando solicitudes:', err);
    } finally {
      setLoadingSolicitudes(false);
    }
  };

  // Responder a una solicitud
  const responderSolicitud = async (solicitudId, estado, respuesta = null) => {
    try {
      setRespondiendoId(solicitudId);
      await solicitudesApi.responder(solicitudId, estado, respuesta, token);

      // Recargar solicitudes
      if (miChaza) {
        cargarSolicitudes(miChaza.id, filtroSolicitudes === 'todas' ? null : filtroSolicitudes);
      }
    } catch (err) {
      console.error('Error respondiendo solicitud:', err);
      alert(err.message || 'Error al responder la solicitud');
    } finally {
      setRespondiendoId(null);
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Guardar horarios de trabajo
  const guardarHorarios = async (horarios) => {
    if (!miChaza) return;

    setGuardandoHorarios(true);
    setMensajeHorarios(null);

    try {
      await chazasApi.actualizarHorarios(miChaza.id, horarios, token);
      setMensajeHorarios({ tipo: 'exito', texto: 'Horarios guardados correctamente' });

      // Recargar la chaza para tener los horarios actualizados
      const chazas = await chazasApi.getMisChazas(token);
      if (chazas && chazas.length > 0) {
        setMiChaza(chazas[0]);
      }
    } catch (err) {
      console.error('Error guardando horarios:', err);
      setMensajeHorarios({ tipo: 'error', texto: 'Error al guardar los horarios' });
    } finally {
      setGuardandoHorarios(false);
    }
  };

  // Cargar mi chaza desde la API
  useEffect(() => {
    const cargarMiChaza = async () => {
      if (!isChazero() || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const chazas = await chazasApi.getMisChazas(token);
        // Solo puede tener 1 chaza, tomamos la primera
        if (chazas && chazas.length > 0) {
          setMiChaza(chazas[0]);
        } else {
          setMiChaza(null);
        }
        setError(null);
      } catch (err) {
        console.error('Error cargando mi chaza:', err);
        setError('No se pudo cargar la informacion de tu chaza');
      } finally {
        setLoading(false);
      }
    };

    cargarMiChaza();
  }, [token, isChazero]);

  // Cargar solicitudes cuando se carga la chaza
  useEffect(() => {
    if (miChaza) {
      cargarSolicitudes(miChaza.id, filtroSolicitudes === 'todas' ? null : filtroSolicitudes);
    }
  }, [miChaza, filtroSolicitudes]);

  // URL para imagenes
  const getImageUrl = (imagenUrl) => {
    return getStaticUrl(imagenUrl);
  };

  // Redirigir si no es chazero
  if (!isChazero()) {
    return (
      <div className="access-denied">
        <div className="container">
          <h1>Acceso Denegado</h1>
          <p>Esta pagina es solo para duenios de chazas.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-page">
        <div className="container">
          <div className="loading-content">
            <h2>Cargando tu chaza...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-page">
        <div className="container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-secondary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Si no tiene chaza, mostrar opcion de crear
  if (!miChaza) {
    return (
      <div className="mis-chazas">
        <div className="container">
          <div className="page-header">
            <h1>Mi Chaza</h1>
            <p>Administra tu chaza</p>
          </div>

          <div className="empty-state-large">
            <h2>Todavia no tienes una chaza</h2>
            <p>Crea tu chaza para que los estudiantes puedan encontrarte</p>
            <Link to="/crear-chaza" className="btn btn-primary btn-large">
              Crear Mi Chaza
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Si tiene chaza, mostrar su informacion
  return (
    <div className="mis-chazas">
      <div className="container">
        <div className="page-header">
          <h1>Mi Chaza</h1>
          <p>Administra la informacion de tu chaza</p>
        </div>

        {/* Editor de horarios de trabajo - PRIMERO */}
        <div className="seccion-horarios seccion-horarios-principal">
          <h3>Horarios en los que necesitas ayuda</h3>
          <p className="horarios-descripcion">
            Selecciona las horas en las que necesitas estudiantes para trabajar en tu chaza.
            Los estudiantes veran estos horarios y podran postularse para los turnos que les convengan.
          </p>

          {mensajeHorarios && (
            <div className={`mensaje-horarios ${mensajeHorarios.tipo}`}>
              {mensajeHorarios.texto}
            </div>
          )}

          <EditorHorarios
            horariosIniciales={miChaza.horarios || []}
            onGuardar={guardarHorarios}
            guardando={guardandoHorarios}
            horarioApertura={miChaza.duracion_estimada?.split(' - ')[0] || '06:00'}
            horarioCierre={miChaza.duracion_estimada?.split(' - ')[1] || '20:00'}
          />
        </div>

        {/* Card de la chaza */}
        <div className="mi-chaza-card">
          {/* Imagen */}
          {miChaza.imagen_url && (
            <div className="chaza-imagen-grande">
              <img
                src={getImageUrl(miChaza.imagen_url)}
                alt={miChaza.titulo}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Info principal */}
          <div className="chaza-info-completa">
            <div className="chaza-header-info">
              <h2>{miChaza.titulo}</h2>
              <span className={`estado-badge ${miChaza.is_active ? 'activa' : 'inactiva'}`}>
                {miChaza.is_active ? 'Activa' : 'Inactiva'}
              </span>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <strong>Ubicacion:</strong>
                <p>{miChaza.ubicacion}</p>
              </div>

              {miChaza.duracion_estimada && (
                <div className="info-item">
                  <strong>Horario:</strong>
                  <p>{miChaza.duracion_estimada}</p>
                </div>
              )}

              {miChaza.telefono && (
                <div className="info-item">
                  <strong>Telefono:</strong>
                  <p>{miChaza.telefono}</p>
                </div>
              )}

              <div className="info-item">
                <strong>Categoria:</strong>
                <p>{miChaza.categoria}</p>
              </div>
            </div>

            <div className="descripcion-completa">
              <strong>Descripcion:</strong>
              <p>{miChaza.descripcion}</p>
            </div>

            <div className="chaza-meta">
              <p>Creada: {new Date(miChaza.created_at).toLocaleDateString('es-ES')}</p>
            </div>
          </div>

          {/* Acciones */}
          <div className="chaza-acciones">
            <button
              onClick={() => navigate('/crear-chaza', { state: { chazaParaEditar: miChaza } })}
              className="btn btn-secondary"
            >
              Editar Chaza
            </button>
            <Link to={`/chaza/${miChaza.slug}`} className="btn btn-outline">
              Ver como se ve
            </Link>
          </div>
        </div>

        {/* Informacion adicional */}
        <div className="info-adicional">
          <h3>Informacion importante</h3>
          <ul>
            <li>Tu chaza es visible para todos los estudiantes en la pagina de inicio</li>
            <li>Los estudiantes pueden ver tu telefono para contactarte</li>
            <li>Solo puedes tener una chaza activa</li>
          </ul>
        </div>

        {/* Sección de Solicitudes Recibidas */}
        <div className="seccion-solicitudes">
          <div className="solicitudes-header">
            <h3>Solicitudes de Trabajo</h3>
            <div className="filtros-solicitudes">
              <button
                className={`filtro-btn ${filtroSolicitudes === 'pendiente' ? 'activo' : ''}`}
                onClick={() => setFiltroSolicitudes('pendiente')}
              >
                Pendientes
              </button>
              <button
                className={`filtro-btn ${filtroSolicitudes === 'aceptada' ? 'activo' : ''}`}
                onClick={() => setFiltroSolicitudes('aceptada')}
              >
                Aceptadas
              </button>
              <button
                className={`filtro-btn ${filtroSolicitudes === 'rechazada' ? 'activo' : ''}`}
                onClick={() => setFiltroSolicitudes('rechazada')}
              >
                Rechazadas
              </button>
              <button
                className={`filtro-btn ${filtroSolicitudes === 'todas' ? 'activo' : ''}`}
                onClick={() => setFiltroSolicitudes('todas')}
              >
                Todas
              </button>
            </div>
          </div>

          {loadingSolicitudes ? (
            <div className="solicitudes-loading">
              <p>Cargando solicitudes...</p>
            </div>
          ) : solicitudes.length === 0 ? (
            <div className="solicitudes-empty">
              <p>No hay solicitudes {filtroSolicitudes !== 'todas' ? filtroSolicitudes + 's' : ''}</p>
            </div>
          ) : (
            <div className="solicitudes-lista">
              {solicitudes.map(sol => (
                <div key={sol.id} className={`solicitud-card estado-${sol.estado}`}>
                  <div className="solicitud-header">
                    <div className="estudiante-info">
                      <span className="estudiante-nombre">{sol.estudiante_nombre}</span>
                      <span className="estudiante-email">{sol.estudiante_email}</span>
                    </div>
                    <span className={`estado-solicitud ${sol.estado}`}>
                      {sol.estado === 'pendiente' && '⏳ Pendiente'}
                      {sol.estado === 'aceptada' && '✅ Aceptada'}
                      {sol.estado === 'rechazada' && '❌ Rechazada'}
                      {sol.estado === 'cancelada' && '🚫 Cancelada'}
                    </span>
                  </div>

                  <div className="solicitud-horarios">
                    <strong>Horarios disponibles:</strong>
                    <p>{sol.horarios_formateados}</p>
                  </div>

                  {sol.mensaje && (
                    <div className="solicitud-mensaje">
                      <strong>Mensaje:</strong>
                      <p>"{sol.mensaje}"</p>
                    </div>
                  )}

                  <div className="solicitud-fecha">
                    <span>Enviada: {formatearFecha(sol.created_at)}</span>
                  </div>

                  {sol.estado === 'pendiente' && (
                    <div className="solicitud-acciones">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => responderSolicitud(sol.id, 'aceptada')}
                        disabled={respondiendoId === sol.id}
                      >
                        {respondiendoId === sol.id ? 'Procesando...' : '✓ Aceptar'}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => responderSolicitud(sol.id, 'rechazada')}
                        disabled={respondiendoId === sol.id}
                      >
                        {respondiendoId === sol.id ? 'Procesando...' : '✗ Rechazar'}
                      </button>
                    </div>
                  )}

                  {sol.respuesta && (
                    <div className="solicitud-respuesta">
                      <strong>Tu respuesta:</strong>
                      <p>"{sol.respuesta}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Boton volver */}
        <div className="actions-section">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default MisChazas;