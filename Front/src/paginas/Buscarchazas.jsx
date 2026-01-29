import { useState, useEffect } from 'react';
import FiltroHorarioModal from '../componentes/FiltroHorarioModal';
import ChazaDetalleModal from '../componentes/ChazaDetalleModal';
import { chazasApi } from '../services/api';
import { useUniversidad } from '../context/UniversidadContext';

function BuscarChazas() {
  const { universidad } = useUniversidad();

  // Estados principales
  const [chazas, setChazas] = useState([]);
  const [chazasFiltradas, setChazasFiltradas] = useState([]);
  const [horariosUsuario, setHorariosUsuario] = useState([]);
  const [filtroAplicado, setFiltroAplicado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de modales
  const [modalFiltroAbierto, setModalFiltroAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [chazaSeleccionada, setChazaSeleccionada] = useState(null);

  // Cargar chazas al montar y cuando cambie la universidad
  useEffect(() => {
    cargarChazas();
  }, [universidad]);

  // Cargar chazas desde la API filtradas por universidad
  const cargarChazas = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar chazas de la API filtradas por universidad
      const data = universidad
        ? await chazasApi.getByUniversidad(universidad.id)
        : await chazasApi.getAll();

      // Transformar los datos para incluir horariosDisponibles
      const chazasConHorarios = data.map(chaza => ({
        ...chaza,
        nombre: chaza.titulo,
        horariosDisponibles: chaza.horarios_trabajo || []
      }));

      setChazas(chazasConHorarios);
      setChazasFiltradas(chazasConHorarios);
    } catch (err) {
      console.error('Error cargando chazas:', err);
      setError('Error al cargar las chazas');
      setChazas([]);
      setChazasFiltradas([]);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtro de horarios
  const aplicarFiltroHorario = (horariosSeleccionados) => {
    setHorariosUsuario(horariosSeleccionados);
    setFiltroAplicado(true);

    if (horariosSeleccionados.length === 0) {
      // Si no hay horarios seleccionados, mostrar todas las chazas
      setChazasFiltradas(chazas);
      setFiltroAplicado(false);
      return;
    }

    // Filtrar chazas que tengan al menos UNA coincidencia con los horarios del usuario
    const chazasConCoincidencias = chazas.map(chaza => {
      // Calcular coincidencias
      const horariosComunes = chaza.horariosDisponibles.filter(hora => 
        horariosSeleccionados.includes(hora)
      );

      return {
        ...chaza,
        horariosComunes,
        cantidadCoincidencias: horariosComunes.length,
        porcentajeCompatibilidad: (horariosComunes.length / horariosSeleccionados.length) * 100
      };
    })
    .filter(chaza => chaza.cantidadCoincidencias > 0) // Solo chazas con al menos 1 coincidencia
    .sort((a, b) => b.cantidadCoincidencias - a.cantidadCoincidencias); // Ordenar por más coincidencias

    setChazasFiltradas(chazasConCoincidencias);
  };

  // Limpiar filtro
  const limpiarFiltro = () => {
    setHorariosUsuario([]);
    setChazasFiltradas(chazas);
    setFiltroAplicado(false);
  };

  // Abrir detalle de chaza
  const abrirDetalle = (chaza) => {
    setChazaSeleccionada(chaza);
    setModalDetalleAbierto(true);
  };

  return (
    <div className="buscar-chazas-page">
      <div className="container">
        
        {/* Header de la página */}
        <div className="page-header">
          <h1>🔍 Buscar Chazas</h1>
          <p>Encuentra chazas compatibles con tu horario disponible</p>
        </div>

        {/* Sección de filtros */}
        <div className="filtros-container">
          <div className="filtro-principal">
            <button 
              className="btn-filtrar-horario"
              onClick={() => setModalFiltroAbierto(true)}
            >
              <span className="btn-icon">🕐</span>
              <span className="btn-text">Filtrar por Horario</span>
              {horariosUsuario.length > 0 && (
                <span className="badge-filtro">{horariosUsuario.length}</span>
              )}
            </button>

            {filtroAplicado && (
              <button 
                className="btn-limpiar-filtro"
                onClick={limpiarFiltro}
              >
                <span>✕ Limpiar Filtro</span>
              </button>
            )}
          </div>

          {/* Información del filtro aplicado */}
          {filtroAplicado && horariosUsuario.length > 0 && (
            <div className="info-filtro-aplicado">
              <div className="filtro-info-header">
                <h4>✅ Filtro Activo</h4>
                <p>Mostrando chazas con coincidencias en tus {horariosUsuario.length} horas seleccionadas</p>
              </div>
              <div className="horarios-filtro-resumen">
                {horariosUsuario.slice(0, 8).map(horario => (
                  <span key={horario} className="horario-chip">
                    {horario.replace('-', ' ')}
                  </span>
                ))}
                {horariosUsuario.length > 8 && (
                  <span className="horario-chip mas">
                    +{horariosUsuario.length - 8} más
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Resultados */}
        <div className="resultados-section">
          <div className="resultados-header">
            <h3>
              {filtroAplicado ?
                `Chazas Compatibles (${chazasFiltradas.length})` :
                `Todas las Chazas (${chazasFiltradas.length})`
              }
            </h3>
            {universidad && (
              <p className="resultados-universidad">
                Universidad: <strong>{universidad.nombre_corto}</strong>
              </p>
            )}
            {filtroAplicado && chazasFiltradas.length > 0 && (
              <p className="resultados-descripcion">
                Ordenadas por mayor coincidencia con tu horario
              </p>
            )}
          </div>

          {/* Estado de carga */}
          {loading && (
            <div className="loading-message">
              <div className="loading-spinner"></div>
              <p>Cargando chazas...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="error-message">
              <p>{error}</p>
              <button className="btn btn-primary" onClick={cargarChazas}>
                Reintentar
              </button>
            </div>
          )}

          {/* Grid de chazas */}
          {!loading && !error && chazasFiltradas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">😔</div>
              <h3>No se encontraron chazas</h3>
              {filtroAplicado ? (
                <>
                  <p>No hay chazas con horarios que coincidan con tu disponibilidad.</p>
                  <p>Intenta ajustar tu filtro de horarios.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setModalFiltroAbierto(true)}
                  >
                    🔄 Ajustar Horarios
                  </button>
                </>
              ) : (
                <>
                  <p>Aún no hay chazas disponibles.</p>
                  <p>Vuelve más tarde.</p>
                </>
              )}
            </div>
          ) : (
            <div className="chazas-grid">
              {chazasFiltradas.map(chaza => (
                <div 
                  key={chaza.id} 
                  className="chaza-card"
                  onClick={() => abrirDetalle(chaza)}
                >
                  {/* Imagen de la chaza */}
                  <div className="chaza-imagen">
                    {chaza.imagenUrl ? (
                      <img src={chaza.imagenUrl} alt={chaza.nombre} />
                    ) : (
                      <div className="imagen-placeholder">
                        <span className="placeholder-icon">🏪</span>
                      </div>
                    )}
                    
                    {/* Badge de compatibilidad si hay filtro */}
                    {filtroAplicado && chaza.cantidadCoincidencias > 0 && (
                      <div className="compatibilidad-badge">
                        <span className="compatibilidad-numero">
                          {chaza.cantidadCoincidencias}
                        </span>
                        <span className="compatibilidad-texto">
                          hora{chaza.cantidadCoincidencias !== 1 ? 's' : ''} en común
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Información de la chaza */}
                  <div className="chaza-info-card">
                    <h3 className="chaza-nombre">{chaza.nombre}</h3>
                    
                    <div className="chaza-detalles-breve">
                      <p className="chaza-ubicacion">
                        📍 {chaza.ubicacion}
                      </p>
                      
                      <p className="chaza-horario">
                        ⏰ {chaza.horarios || 'Horario flexible'}
                      </p>

                      {/* Productos */}
                      {chaza.productos && chaza.productos.length > 0 && (
                        <div className="productos-preview">
                          <span className="productos-label">🛍️</span>
                          <div className="productos-tags-mini">
                            {chaza.productos.slice(0, 3).map((producto, index) => (
                              <span key={index} className="producto-tag-mini">
                                {producto}
                              </span>
                            ))}
                            {chaza.productos.length > 3 && (
                              <span className="producto-tag-mini mas">
                                +{chaza.productos.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Barra de compatibilidad */}
                      {filtroAplicado && chaza.porcentajeCompatibilidad !== undefined && (
                        <div className="compatibilidad-bar-container">
                          <div className="compatibilidad-label">
                            <span>Compatibilidad</span>
                            <span className="porcentaje">
                              {Math.round(chaza.porcentajeCompatibilidad)}%
                            </span>
                          </div>
                          <div className="compatibilidad-bar">
                            <div 
                              className="compatibilidad-fill"
                              style={{ 
                                width: `${chaza.porcentajeCompatibilidad}%`,
                                backgroundColor: getColorCompatibilidad(chaza.porcentajeCompatibilidad)
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botón de ver más */}
                    <button className="btn-ver-detalle">
                      Ver Horarios Disponibles →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Filtro de Horario */}
      <FiltroHorarioModal
        isOpen={modalFiltroAbierto}
        onClose={() => setModalFiltroAbierto(false)}
        onAplicarFiltro={aplicarFiltroHorario}
        horariosPreseleccionados={horariosUsuario}
      />

      {/* Modal de Detalle de Chaza */}
      {chazaSeleccionada && (
        <ChazaDetalleModal
          isOpen={modalDetalleAbierto}
          onClose={() => setModalDetalleAbierto(false)}
          chaza={chazaSeleccionada}
          horariosUsuario={horariosUsuario}
          
        />
      )}
    </div>
  );
}

// Funcion para obtener color segun porcentaje de compatibilidad
function getColorCompatibilidad(porcentaje) {
  if (porcentaje >= 75) return '#27ae60'; // Verde
  if (porcentaje >= 50) return '#f39c12'; // Naranja
  if (porcentaje >= 25) return '#e67e22'; // Naranja oscuro
  return '#e74c3c'; // Rojo
}

export default BuscarChazas;