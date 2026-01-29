import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { chazasApi, getStaticUrl } from '../services/api';
import { useUniversidad } from '../context/UniversidadContext';

function ChazasGrid() {
  const navigate = useNavigate();
  const { universidad } = useUniversidad();
  const [chazas, setChazas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar chazas desde la API filtradas por universidad
  useEffect(() => {
    const cargarChazas = async () => {
      try {
        setLoading(true);
        // Filtrar por universidad si hay una seleccionada
        const data = universidad
          ? await chazasApi.getByUniversidad(universidad.id)
          : await chazasApi.getAll();
        setChazas(data);
        setError(null);
      } catch (err) {
        console.error('Error cargando chazas:', err);
        setError('No se pudieron cargar las chazas');
      } finally {
        setLoading(false);
      }
    };

    cargarChazas();
  }, [universidad]);

  // URL base para imagenes
  const getImageUrl = (imagenUrl) => {
    if (!imagenUrl) {
      return 'https://via.placeholder.com/300x200?text=Sin+Imagen';
    }
    return getStaticUrl(imagenUrl) || 'https://via.placeholder.com/300x200?text=Sin+Imagen';
  };

  if (loading) {
    return (
      <section className="chazas-grid-section">
        <div className="container">
          <div className="loading-state">
            <p>Cargando chazas...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="chazas-grid-section">
        <div className="container">
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-secondary">
              Reintentar
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="chazas-grid-section">
      <div className="container">
        <div className="chazas-grid-header">
          <h2>Chazas Disponibles</h2>
          <p>Descubre las mejores chazas cerca de la universidad</p>
        </div>

        {chazas.length === 0 ? (
          <div className="empty-state">
            <p>No hay chazas disponibles todavia.</p>
            <p>Se el primero en registrar tu chaza!</p>
          </div>
        ) : (
          <div className="chazas-grid">
            {chazas.map(chaza => (
              <div key={chaza.id} className="chaza-grid-card">
                <div className="chaza-image-container">
                  <img
                    src={getImageUrl(chaza.imagen_url)}
                    alt={chaza.titulo}
                    className="chaza-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Sin+Imagen';
                    }}
                  />
                  <div className={`chaza-status ${chaza.is_active ? 'disponible' : 'ocupado'}`}>
                    {chaza.is_active ? 'Abierta' : 'Cerrada'}
                  </div>
                </div>

                <div className="chaza-info">
                  <h3 className="chaza-nombre">{chaza.titulo}</h3>
                  <div className="chaza-details">
                    <p className="chaza-ubicacion">
                      Ubicacion: {chaza.ubicacion}
                    </p>
                    {chaza.duracion_estimada && (
                      <p className="chaza-horarios">
                        Horario: {chaza.duracion_estimada}
                      </p>
                    )}
                    {chaza.telefono && (
                      <p className="chaza-telefono">
                        Tel: {chaza.telefono}
                      </p>
                    )}
                  </div>

                  <Link
                    to={`/chaza/${chaza.slug}`}
                    className="chaza-ver-btn"
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {chazas.length > 0 && (
          <div className="chazas-grid-footer">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/buscar-chazas')}
            >
              Ver todas las chazas
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default ChazasGrid;