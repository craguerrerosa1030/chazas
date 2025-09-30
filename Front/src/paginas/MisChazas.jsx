import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function MisChazas({ onNavegar }) {
  // Obtener datos del usuario autenticado
  const { user, isChazero } = useAuth();
  
  // Estados del componente
  const [propuestasRecibidas, setPropuestasRecibidas] = useState([]);
  const [miChaza, setMiChaza] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState('propuestas'); // propuestas | chaza | crear

  // Cargar datos al montar el componente
  useEffect(() => {
    if (isChazero()) {
      cargarDatos();
    }
  }, [user, isChazero]);

  // Función para cargar propuestas recibidas y chaza
  const cargarDatos = () => {
    try {
      // Cargar todas las propuestas
      const todasLasPropuestas = JSON.parse(localStorage.getItem('propuestas') || '[]');
      
      // Cargar la chaza del usuario (solo UNA)
      const chazasGuardadas = JSON.parse(localStorage.getItem('chazas_usuario') || '[]');
      const chazaDelUsuario = chazasGuardadas.find(c => c.duenioId === user.id);
      
      // Si no tiene chaza, usar datos por defecto (simulación)
      if (!chazaDelUsuario) {
        // Simular que el usuario ya tiene UNA chaza creada
        const chazaDefault = {
          id: 1,
          nombre: `Chaza de ${user.nombre}`,
          duenioId: user.id,
          ubicacion: "Ubicación por definir",
          activa: true,
          productos: ["Comida", "Bebidas"],
          fechaCreacion: new Date().toISOString(),
          descripcion: "Mi primera chaza",
          horarios: "6:00 AM - 8:00 PM",
          telefono: "",
          horariosDisponibles: [
            "Lunes-06:00", "Lunes-06:30", "Lunes-07:00", "Lunes-11:30", "Lunes-12:00",
            "Martes-06:00", "Martes-06:30", "Martes-12:00", "Martes-12:30",
            "Miércoles-07:00", "Miércoles-07:30", "Miércoles-13:00",
            "Jueves-06:00", "Jueves-11:30", "Jueves-12:00", "Jueves-12:30",
            "Viernes-06:30", "Viernes-07:00", "Viernes-13:00", "Viernes-13:30"
          ]
        };
        setMiChaza(chazaDefault);
      } else {
        setMiChaza(chazaDelUsuario);
      }
      
      // Filtrar propuestas recibidas para la chaza del usuario
      const idChazaDelUsuario = chazaDelUsuario ? chazaDelUsuario.id : 1;
      const propuestasParaMiChaza = todasLasPropuestas.filter(p => 
        p.chazaId === idChazaDelUsuario
      );
      
      // Ordenar propuestas por fecha (más recientes primero)
      propuestasParaMiChaza.sort((a, b) => new Date(b.fechaEnvio) - new Date(a.fechaEnvio));
      
      setPropuestasRecibidas(propuestasParaMiChaza);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error cargando los datos');
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar información de la chaza
  const actualizarChaza = (datosActualizados) => {
    try {
      const chazaActualizada = { ...miChaza, ...datosActualizados };
      
      // Guardar en localStorage
      const chazasGuardadas = JSON.parse(localStorage.getItem('chazas_usuario') || '[]');
      const chazasActualizadas = chazasGuardadas.filter(c => c.duenioId !== user.id);
      chazasActualizadas.push(chazaActualizada);
      localStorage.setItem('chazas_usuario', JSON.stringify(chazasActualizadas));
      
      setMiChaza(chazaActualizada);
      alert('✅ Información actualizada correctamente');
    } catch (error) {
      console.error('Error actualizando chaza:', error);
      alert('❌ Error actualizando la información');
    }
  };

  // Función para aceptar una propuesta
  const aceptarPropuesta = (propuestaId) => {
    // Usar window.confirm en lugar de confirm directo
    if (!window.confirm('¿Estás seguro de que quieres aceptar esta propuesta?')) {
      return;
    }

    try {
      const todasLasPropuestas = JSON.parse(localStorage.getItem('propuestas') || '[]');
      const propuestasActualizadas = todasLasPropuestas.map(p => 
        p.id === propuestaId ? { ...p, estado: 'aceptada', fechaRespuesta: new Date().toISOString() } : p
      );
      
      localStorage.setItem('propuestas', JSON.stringify(propuestasActualizadas));
      cargarDatos();
      alert('✅ ¡Propuesta aceptada! El estudiante será notificado.');
    } catch (error) {
      console.error('Error aceptando propuesta:', error);
      alert('❌ Error aceptando la propuesta');
    }
  };

  // Función para rechazar una propuesta
  const rechazarPropuesta = (propuestaId) => {
    // Usar window.confirm en lugar de confirm directo
    if (!window.confirm('¿Estás seguro de que quieres rechazar esta propuesta?')) {
      return;
    }

    try {
      const todasLasPropuestas = JSON.parse(localStorage.getItem('propuestas') || '[]');
      const propuestasActualizadas = todasLasPropuestas.map(p => 
        p.id === propuestaId ? { ...p, estado: 'rechazada', fechaRespuesta: new Date().toISOString() } : p
      );
      
      localStorage.setItem('propuestas', JSON.stringify(propuestasActualizadas));
      cargarDatos();
      alert('❌ Propuesta rechazada. El estudiante será notificado.');
    } catch (error) {
      console.error('Error rechazando propuesta:', error);
      alert('❌ Error rechazando la propuesta');
    }
  };

  // Función para alternar estado activo/inactivo de la chaza
  const toggleEstadoChaza = () => {
    actualizarChaza({ activa: !miChaza.activa });
  };

  // Funciones de utilidad
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'aceptada': return '#27ae60';
      case 'rechazada': return '#e74c3c';
      case 'pendiente': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getEstadoEmoji = (estado) => {
    switch (estado) {
      case 'aceptada': return '✅';
      case 'rechazada': return '❌';
      case 'pendiente': return '⏳';
      default: return '❓';
    }
  };

  // Redirigir si no es chazero
  if (!isChazero()) {
    return (
      <div className="access-denied">
        <div className="container">
          <h1>🚫 Acceso Denegado</h1>
          <p>Esta página es solo para dueños de chazas.</p>
          <button 
            onClick={() => onNavegar('dashboard')}
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
            <h2>Cargando información de tu chaza...</h2>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mis-chazas">
      <div className="container">
        {/* Header de la página */}
        <div className="page-header">
          <h1>🏪 Mi Chaza</h1>
          <p>Administra tu chaza y revisa las propuestas recibidas</p>
        </div>

        {/* Estadísticas generales */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-number">1</div>
            <div className="stat-label">Mi Chaza</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{propuestasRecibidas.length}</div>
            <div className="stat-label">Propuestas Totales</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {propuestasRecibidas.filter(p => p.estado === 'pendiente').length}
            </div>
            <div className="stat-label">Pendientes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {propuestasRecibidas.filter(p => p.estado === 'aceptada').length}
            </div>
            <div className="stat-label">Empleados</div>
          </div>
        </div>

        {/* Navegación entre vistas */}
        <div className="vista-navigation">
          <button 
            className={`vista-btn ${vistaActual === 'propuestas' ? 'active' : ''}`}
            onClick={() => setVistaActual('propuestas')}
          >
            📬 Propuestas Recibidas ({propuestasRecibidas.length})
          </button>
          <button 
            className={`vista-btn ${vistaActual === 'chaza' ? 'active' : ''}`}
            onClick={() => setVistaActual('chaza')}
          >
            🏪 Mi Chaza
          </button>
        </div>

        {/* Vista de Propuestas Recibidas */}
        {vistaActual === 'propuestas' && (
          <div className="propuestas-section">
            <div className="section-header">
              <h3>📬 Propuestas Recibidas</h3>
              <p>Revisa y gestiona las solicitudes de trabajo de los estudiantes</p>
            </div>

            {propuestasRecibidas.length === 0 ? (
              <div className="empty-state">
                <h4>📭 No hay propuestas aún</h4>
                <p>Cuando los estudiantes se postulen a tu chaza, aparecerán aquí.</p>
                <p className="tip">💡 Asegúrate de que tu chaza sea visible en "Buscar Chazas"</p>
                <button 
                  onClick={() => setVistaActual('chaza')}
                  className="btn btn-primary"
                >
                  ⚙️ Configurar Mi Chaza
                </button>
              </div>
            ) : (
              <div className="propuestas-list">
                {propuestasRecibidas.map(propuesta => (
                  <div key={propuesta.id} className="propuesta-card chazero-card">
                    {/* Header de la propuesta */}
                    <div className="propuesta-header">
                      <div className="estudiante-info">
                        <h4>👤 {propuesta.estudianteNombre}</h4>
                        <p className="estudiante-email">📧 {propuesta.estudianteEmail}</p>
                      </div>
                      <div className="propuesta-status">
                        <span 
                          className="estado-badge"
                          style={{ backgroundColor: getEstadoColor(propuesta.estado) }}
                        >
                          {getEstadoEmoji(propuesta.estado)} {propuesta.estado.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Información de la propuesta */}
                    <div className="propuesta-content">
                      <div className="propuesta-details">
                        <p><strong>📅 Recibida:</strong> {new Date(propuesta.fechaEnvio).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                        
                        <p><strong>⏰ Horas solicitadas:</strong> {propuesta.horasSeleccionadas?.length || 0}</p>

                        {/* Mensaje del estudiante */}
                        {propuesta.mensaje && (
                          <div className="mensaje-estudiante">
                            <p><strong>💬 Mensaje del estudiante:</strong></p>
                            <div className="mensaje-content">
                              "{propuesta.mensaje}"
                            </div>
                          </div>
                        )}

                        {/* Horarios específicos solicitados */}
                        {propuesta.horasSeleccionadas && propuesta.horasSeleccionadas.length > 0 && (
                          <div className="horarios-solicitados">
                            <p><strong>🕐 Horarios específicos solicitados:</strong></p>
                            <div className="horarios-grid-small">
                              {propuesta.horasSeleccionadas.map((hora, index) => (
                                <span key={index} className="horario-tag-small">
                                  {hora.replace('-', ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Fecha de respuesta si ya fue procesada */}
                        {propuesta.fechaRespuesta && (
                          <p className="fecha-respuesta">
                            <strong>📅 Respondida:</strong> {new Date(propuesta.fechaRespuesta).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Acciones disponibles */}
                    <div className="propuesta-actions">
                      {propuesta.estado === 'pendiente' && (
                        <div className="action-buttons">
                          <button 
                            onClick={() => aceptarPropuesta(propuesta.id)}
                            className="btn btn-success"
                          >
                            ✅ Aceptar Propuesta
                          </button>
                          <button 
                            onClick={() => rechazarPropuesta(propuesta.id)}
                            className="btn btn-danger"
                          >
                            ❌ Rechazar
                          </button>
                        </div>
                      )}

                      {propuesta.estado === 'aceptada' && (
                        <div className="status-message accepted">
                          <p>✅ <strong>Propuesta Aceptada</strong></p>
                          <p>El estudiante ha sido notificado. Contacta con {propuesta.estudianteNombre} para coordinar.</p>
                        </div>
                      )}

                      {propuesta.estado === 'rechazada' && (
                        <div className="status-message rejected">
                          <p>❌ <strong>Propuesta Rechazada</strong></p>
                          <p>El estudiante ha sido notificado de tu decisión.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vista de Mi Chaza */}
        {vistaActual === 'chaza' && miChaza && (
          <div className="mi-chaza-section">
            <div className="section-header">
              <h3>🏪 Información de Mi Chaza</h3>
              <p>Configura y administra la información de tu chaza</p>
            </div>

            <div className="chaza-card admin-card">
              {/* Header de la chaza */}
              <div className="chaza-header">
                <div className="chaza-title">
                  <h4>{miChaza.nombre}</h4>
                  <span className={`status-indicator ${miChaza.activa ? 'active' : 'inactive'}`}>
                    {miChaza.activa ? '🟢 Activa' : '🔴 Inactiva'}
                  </span>
                </div>
                <div className="chaza-stats-mini">
                  <span className="stat-mini">📬 {propuestasRecibidas.length}</span>
                  <span className="stat-mini">⏳ {propuestasRecibidas.filter(p => p.estado === 'pendiente').length}</span>
                  <span className="stat-mini">👥 {propuestasRecibidas.filter(p => p.estado === 'aceptada').length}</span>
                </div>
              </div>

              {/* Información básica de la chaza */}
              <div className="chaza-content">
                <div className="info-grid">
                  <div className="info-item">
                    <label><strong>📍 Ubicación:</strong></label>
                    <p>{miChaza.ubicacion}</p>
                  </div>
                  
                  <div className="info-item">
                    <label><strong>📅 Creada:</strong></label>
                    <p>{new Date(miChaza.fechaCreacion).toLocaleDateString('es-ES')}</p>
                  </div>
                  
                  <div className="info-item">
                    <label><strong>⏰ Horarios:</strong></label>
                    <p>{miChaza.horarios || "6:00 AM - 8:00 PM"}</p>
                  </div>
                  
                  <div className="info-item">
                    <label><strong>📱 Teléfono:</strong></label>
                    <p>{miChaza.telefono || "No especificado"}</p>
                  </div>
                </div>

                {/* Productos */}
                <div className="productos-chaza">
                  <label><strong>🛍️ Productos que vendes:</strong></label>
                  <div className="productos-tags">
                    {miChaza.productos.map((producto, index) => (
                      <span key={index} className="producto-tag-small">
                        {producto}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Descripción */}
                {miChaza.descripcion && (
                  <div className="descripcion-chaza">
                    <label><strong>📝 Descripción:</strong></label>
                    <p>{miChaza.descripcion}</p>
                  </div>
                )}

                {/* Estadísticas detalladas */}
                <div className="chaza-statistics">
                  <h5>📊 Estadísticas:</h5>
                  <ul>
                    <li>📬 Propuestas recibidas: {propuestasRecibidas.length}</li>
                    <li>⏳ Propuestas pendientes: {propuestasRecibidas.filter(p => p.estado === 'pendiente').length}</li>
                    <li>✅ Empleados actuales: {propuestasRecibidas.filter(p => p.estado === 'aceptada').length}</li>
                    <li>❌ Propuestas rechazadas: {propuestasRecibidas.filter(p => p.estado === 'rechazada').length}</li>
                  </ul>
                </div>
              </div>

              {/* Acciones de la chaza */}
              <div className="chaza-actions">
                <button 
                  onClick={() => onNavegar('crear-chaza')}
                  className="btn btn-secondary btn-small"
                >
                  ✏️ Editar Información
                </button>
                
                <button 
                  onClick={toggleEstadoChaza}
                  className={`btn btn-small ${miChaza.activa ? 'btn-warning' : 'btn-success'}`}
                >
                  {miChaza.activa ? '⏸️ Pausar Chaza' : '▶️ Activar Chaza'}
                </button>
                
                <button 
                  onClick={() => setVistaActual('propuestas')}
                  className="btn btn-primary btn-small"
                >
                  📬 Ver Propuestas ({propuestasRecibidas.length})
                </button>
              </div>

              {/* Información adicional */}
              <div className="info-adicional-chaza">
                <h5>ℹ️ Información importante:</h5>
                <ul>
                  <li>✅ Tu chaza es visible para todos los estudiantes</li>
                  <li>📱 Los estudiantes pueden contactarte a través de la plataforma</li>
                  <li>⏰ Puedes pausar tu chaza temporalmente si es necesario</li>
                  <li>📊 Las estadísticas se actualizan en tiempo real</li>
                </ul>
              </div>
            </div>

            {/* Horarios disponibles actuales */}
            <div className="horarios-disponibles-section">
              <h4>⏰ Horarios que necesitas cubrir</h4>
              <p>Estos son los horarios en los que los estudiantes pueden postularse:</p>
              
              <div className="horarios-display">
                {miChaza.horariosDisponibles && miChaza.horariosDisponibles.length > 0 ? (
                  <div className="horarios-tags-display">
                    {miChaza.horariosDisponibles.map((hora, index) => (
                      <span key={index} className="horario-tag">
                        {hora.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="no-horarios">No hay horarios específicos configurados</p>
                )}
              </div>
              
              <button 
                onClick={() => onNavegar('crear-chaza')}
                className="btn btn-outline"
              >
                ✏️ Editar Horarios Disponibles
              </button>
            </div>
          </div>
        )}

        {/* Acciones generales */}
        <div className="actions-section">
          <button 
            onClick={() => onNavegar('dashboard')}
            className="btn btn-secondary"
          >
            📊 Volver al Dashboard
          </button>
          <button 
            onClick={() => onNavegar('buscar-chazas')}
            className="btn btn-outline"
          >
            🔍 Ver Cómo se Ve Mi Chaza
          </button>
        </div>
      </div>
    </div>
  );
}

export default MisChazas;