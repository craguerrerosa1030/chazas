import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { chazasApi, getStaticUrl } from '../services/api';
import { useUniversidad } from '../context/UniversidadContext';
import FiltroHorarioModal from '../componentes/FiltroHorarioModal';
import ChazaDetalleModal from '../componentes/ChazaDetalleModal';

function Home() {
  const { universidad } = useUniversidad();
  const navigate = useNavigate();

  // Estados para chazas
  const [chazas, setChazas] = useState([]);
  const [chazasFiltradas, setChazasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para filtros
  const [busqueda, setBusqueda] = useState('');
  const [horariosUsuario, setHorariosUsuario] = useState([]);
  const [filtroHorarioAplicado, setFiltroHorarioAplicado] = useState(false);

  // Estados para modales
  const [modalFiltroAbierto, setModalFiltroAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [chazaSeleccionada, setChazaSeleccionada] = useState(null);

  // Cargar chazas al montar
  useEffect(() => {
    cargarChazas();
  }, [universidad]);

  // Filtrar por búsqueda de texto
  useEffect(() => {
    if (busqueda.trim() === '') {
      if (filtroHorarioAplicado) {
        aplicarFiltroHorario(horariosUsuario);
      } else {
        setChazasFiltradas(chazas);
      }
    } else {
      const filtradas = chazas.filter(chaza =>
        chaza.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        chaza.ubicacion?.toLowerCase().includes(busqueda.toLowerCase()) ||
        chaza.categoria?.toLowerCase().includes(busqueda.toLowerCase())
      );
      setChazasFiltradas(filtradas);
    }
  }, [busqueda, chazas]);

  const cargarChazas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = universidad
        ? await chazasApi.getByUniversidad(universidad.id)
        : await chazasApi.getAll();

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
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtro de horarios
  const aplicarFiltroHorario = (horariosSeleccionados) => {
    setHorariosUsuario(horariosSeleccionados);
    setFiltroHorarioAplicado(true);

    if (horariosSeleccionados.length === 0) {
      setChazasFiltradas(chazas);
      setFiltroHorarioAplicado(false);
      return;
    }

    const chazasConCoincidencias = chazas.map(chaza => {
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
      .filter(chaza => chaza.cantidadCoincidencias > 0)
      .sort((a, b) => b.cantidadCoincidencias - a.cantidadCoincidencias);

    setChazasFiltradas(chazasConCoincidencias);
  };

  const limpiarFiltroHorario = () => {
    setHorariosUsuario([]);
    setChazasFiltradas(chazas);
    setFiltroHorarioAplicado(false);
  };

  // URL para imágenes
  const getImageUrl = (imagenUrl) => {
    return getStaticUrl(imagenUrl);
  };

  const abrirDetalle = (chaza) => {
    setChazaSeleccionada(chaza);
    setModalDetalleAbierto(true);
    // Actualizar la URL sin recargar la página
    window.history.pushState({}, '', `/chaza/${chaza.slug}`);
  };

  // Cerrar modal y restaurar URL
  const cerrarDetalle = () => {
    setModalDetalleAbierto(false);
    setChazaSeleccionada(null);
    // Restaurar la URL al home
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <div className="hero">
        <h1>¡Bienvenido a Chazas!</h1>
        <p>Conectamos estudiantes que buscan trabajo con chazas que necesitan personal</p>
        <div className="hero-buttons">
          <Link to="/registro" className="btn btn-primary">
            Buscar trabajo
          </Link>
          <Link to="/registro" className="btn btn-secondary">
            Publicar Chaza
          </Link>
        </div>
      </div>

      {/* Sección de Búsqueda */}
      <section className="chazas-grid-section">
        <div className="container">
          <div className="chazas-grid-header">
            <h2>Chazas Disponibles</h2>
            <p>Descubre las mejores chazas cerca de la universidad</p>
          </div>

          {/* Buscador y Filtros */}
          <div className="filtros-container">
            <div className="filtro-busqueda">
              <input
                type="text"
                placeholder="Buscar chazas por nombre, ubicación o categoría..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input-busqueda"
              />
            </div>

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

              {filtroHorarioAplicado && (
                <button
                  className="btn-limpiar-filtro"
                  onClick={limpiarFiltroHorario}
                >
                  <span>✕ Limpiar Filtro</span>
                </button>
              )}
            </div>
          </div>

          {/* Estado de carga */}
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Cargando chazas...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="error-state">
              <p>{error}</p>
              <button className="btn btn-secondary" onClick={cargarChazas}>
                Reintentar
              </button>
            </div>
          )}

          {/* Grid de chazas */}
          {!loading && !error && (
            <>
              {chazasFiltradas.length === 0 ? (
                <div className="empty-state">
                  <p>No se encontraron chazas</p>
                  {busqueda && <p>Intenta con otra búsqueda</p>}
                </div>
              ) : (
                <div className="chazas-grid">
                  {chazasFiltradas.map(chaza => (
                    <div
                      key={chaza.id}
                      className="chaza-grid-card"
                      onClick={() => abrirDetalle(chaza)}
                    >
                      <div className="chaza-image-container">
                        {chaza.imagen_url ? (
                          <img
                            src={getImageUrl(chaza.imagen_url)}
                            alt={chaza.titulo}
                            className="chaza-image"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x200?text=Sin+Imagen';
                            }}
                          />
                        ) : (
                          <div className="imagen-placeholder">
                            <span className="placeholder-icon">🏪</span>
                          </div>
                        )}
                        <div className={`chaza-status ${chaza.is_active ? 'disponible' : 'ocupado'}`}>
                          {chaza.is_active ? 'Abierta' : 'Cerrada'}
                        </div>

                        {/* Badge de compatibilidad si hay filtro */}
                        {filtroHorarioAplicado && chaza.cantidadCoincidencias > 0 && (
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

                      <div className="chaza-info">
                        <h3 className="chaza-nombre">{chaza.titulo}</h3>
                        <div className="chaza-details">
                          <p className="chaza-ubicacion">
                            📍 {chaza.ubicacion}
                          </p>
                          {chaza.duracion_estimada && (
                            <p className="chaza-horarios">
                              ⏰ {chaza.duracion_estimada}
                            </p>
                          )}
                        </div>

                        <button
                          className="chaza-ver-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirDetalle(chaza);
                          }}
                        >
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

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
          onClose={cerrarDetalle}
          chaza={chazaSeleccionada}
          horariosUsuario={horariosUsuario}
        />
      )}
    </div>
  );
}

export default Home;
