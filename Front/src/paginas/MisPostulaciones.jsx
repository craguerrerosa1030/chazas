import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function MisPostulaciones({ onNavegar }) {
  // Obtener datos del usuario autenticado
  const { user, isEstudiante } = useAuth();
  
  // Estados del componente
  const [propuestas, setPropuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todas'); // todas | pendientes | aceptadas | rechazadas

  // Cargar propuestas al montar el componente
  useEffect(() => {
    if (isEstudiante()) {
      cargarPropuestas();
    }
  }, [user, isEstudiante]);

  // Función para cargar las propuestas del estudiante
  const cargarPropuestas = () => {
    try {
      // Obtener todas las propuestas del localStorage
      const todasLasPropuestas = JSON.parse(localStorage.getItem('propuestas') || '[]');
      
      // Filtrar solo las propuestas del estudiante actual
      const misPropuestas = todasLasPropuestas.filter(p => p.estudianteId === user.id);
      
      // Ordenar por fecha (más recientes primero)
      misPropuestas.sort((a, b) => new Date(b.fechaEnvio) - new Date(a.fechaEnvio));
      
      setPropuestas(misPropuestas);
    } catch (error) {
      console.error('Error cargando propuestas:', error);
      alert('Error cargando tus propuestas');
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar una propuesta pendiente
  const cancelarPropuesta = (propuestaId) => {
    // Usar window.confirm en lugar de confirm directo
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta propuesta?')) {
      return;
    }

    try {
      // Obtener todas las propuestas
      const todasLasPropuestas = JSON.parse(localStorage.getItem('propuestas') || '[]');
      
      // Filtrar eliminando la propuesta a cancelar
      const propuestasActualizadas = todasLasPropuestas.filter(p => p.id !== propuestaId);
      
      // Guardar cambios
      localStorage.setItem('propuestas', JSON.stringify(propuestasActualizadas));
      
      // Recargar propuestas
      cargarPropuestas();
      
      alert('✅ Propuesta cancelada exitosamente');
    } catch (error) {
      console.error('Error cancelando propuesta:', error);
      alert('❌ Error cancelando la propuesta');
    }
  };

  // Función para obtener color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'aceptada': return '#27ae60';
      case 'rechazada': return '#e74c3c';
      case 'pendiente': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  // Función para obtener emoji del estado
  const getEstadoEmoji = (estado) => {
    switch (estado) {
      case 'aceptada': return '✅';
      case 'rechazada': return '❌';
      case 'pendiente': return '⏳';
      default: return '❓';
    }
  };

  // Filtrar propuestas según el filtro seleccionado
  const propuestasFiltradas = propuestas.filter(propuesta => {
    if (filtroEstado === 'todas') return true;
    return propuesta.estado === filtroEstado;
  });

  // Redirigir si no es estudiante
  if (!isEstudiante()) {
    return (
      <div className="access-denied">
        <div className="container">
          <h1>🚫 Acceso Denegado</h1>
          <p>Esta página es solo para estudiantes.</p>
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
            <h2>Cargando tus propuestas...</h2>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mis-postulaciones">
      <div className="container">
        {/* Header de la página */}
        <div className="page-header">
          <h1>📝 Mis Postulaciones</h1>
          <p>Revisa el estado de todas tus propuestas enviadas</p>
        </div>

        {/* Estadísticas rápidas */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-number">{propuestas.length}</div>
            <div className="stat-label">Total Enviadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {propuestas.filter(p => p.estado === 'pendiente').length}
            </div>
            <div className="stat-label">Pendientes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {propuestas.filter(p => p.estado === 'aceptada').length}
            </div>
            <div className="stat-label">Aceptadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {propuestas.filter(p => p.estado === 'rechazada').length}
            </div>
            <div className="stat-label">Rechazadas</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="filtros-section">
          <h3>Filtrar por estado:</h3>
          <div className="filtros-buttons">
            <button 
              className={`filtro-btn ${filtroEstado === 'todas' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('todas')}
            >
              Todas ({propuestas.length})
            </button>
            <button 
              className={`filtro-btn ${filtroEstado === 'pendiente' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('pendiente')}
            >
              ⏳ Pendientes ({propuestas.filter(p => p.estado === 'pendiente').length})
            </button>
            <button 
              className={`filtro-btn ${filtroEstado === 'aceptada' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('aceptada')}
            >
              ✅ Aceptadas ({propuestas.filter(p => p.estado === 'aceptada').length})
            </button>
            <button 
              className={`filtro-btn ${filtroEstado === 'rechazada' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('rechazada')}
            >
              ❌ Rechazadas ({propuestas.filter(p => p.estado === 'rechazada').length})
            </button>
          </div>
        </div>

        {/* Lista de propuestas */}
        <div className="propuestas-section">
          {propuestasFiltradas.length === 0 ? (
            <div className="empty-state">
              {propuestas.length === 0 ? (
                <>
                  <h3>📋 No has enviado ninguna propuesta aún</h3>
                  <p>¡Busca chazas y envía tu primera propuesta!</p>
                  <button 
                    onClick={() => onNavegar('buscar-chazas')}
                    className="btn btn-primary"
                  >
                    Buscar Chazas
                  </button>
                </>
              ) : (
                <>
                  <h3>🔍 No hay propuestas con el filtro: "{filtroEstado}"</h3>
                  <p>Intenta cambiar el filtro para ver más resultados</p>
                </>
              )}
            </div>
          ) : (
            <div className="propuestas-list">
              {propuestasFiltradas.map(propuesta => (
                <div key={propuesta.id} className="propuesta-card">
                  {/* Header de la propuesta */}
                  <div className="propuesta-header">
                    <div className="propuesta-title">
                      <h4>{propuesta.chazaNombre}</h4>
                      <span className="propuesta-location">
                        📍 {propuesta.ubicacionChaza}
                      </span>
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

                  {/* Contenido de la propuesta */}
                  <div className="propuesta-content">
                    <div className="propuesta-info">
                      <p><strong>📅 Enviada:</strong> {new Date(propuesta.fechaEnvio).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                      
                      <p><strong>⏰ Horas solicitadas:</strong> {propuesta.horasSeleccionadas?.length || 0}</p>
                      
                      <p><strong>👤 Dueño:</strong> {propuesta.duenioChaza}</p>

                      {propuesta.mensaje && (
                        <div className="mensaje-enviado">
                          <p><strong>💬 Tu mensaje:</strong></p>
                          <div className="mensaje-content">
                            "{propuesta.mensaje}"
                          </div>
                        </div>
                      )}

                      {/* Mostrar horarios específicos */}
                      {propuesta.horasSeleccionadas && propuesta.horasSeleccionadas.length > 0 && (
                        <div className="horarios-solicitados">
                          <p><strong>🕐 Horarios específicos:</strong></p>
                          <div className="horarios-tags">
                            {propuesta.horasSeleccionadas.map((hora, index) => (
                              <span key={index} className="horario-tag">
                                {hora.replace('-', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones disponibles */}
                  <div className="propuesta-actions">
                    {propuesta.estado === 'pendiente' && (
                      <button 
                        onClick={() => cancelarPropuesta(propuesta.id)}
                        className="btn btn-danger btn-small"
                      >
                        🗑️ Cancelar Propuesta
                      </button>
                    )}

                    {propuesta.estado === 'aceptada' && (
                      <div className="success-message">
                        <p>🎉 ¡Felicitaciones! Tu propuesta fue aceptada.</p>
                        <p>El dueño de la chaza se contactará contigo pronto.</p>
                      </div>
                    )}

                    {propuesta.estado === 'rechazada' && (
                      <div className="rejection-message">
                        <p>😔 Esta propuesta no fue aceptada.</p>
                        <p>No te desanimes, ¡sigue buscando otras oportunidades!</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acciones generales */}
        <div className="actions-section">
          <button 
            onClick={() => onNavegar('buscar-chazas')}
            className="btn btn-primary"
          >
            🔍 Buscar Más Chazas
          </button>
          <button 
            onClick={() => onNavegar('dashboard')}
            className="btn btn-secondary"
          >
            📊 Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default MisPostulaciones;