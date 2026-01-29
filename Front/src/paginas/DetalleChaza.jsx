import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chazasApi } from '../services/api';
import ChazaDetalleModal from '../componentes/ChazaDetalleModal';

function DetalleChaza() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [chaza, setChaza] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar chaza desde la API usando el slug
  useEffect(() => {
    const cargarChaza = async () => {
      try {
        setLoading(true);
        const data = await chazasApi.getBySlug(slug);
        setChaza(data);
        setError(null);
      } catch (err) {
        console.error('Error cargando chaza:', err);
        setError('No se pudo cargar la informacion de esta chaza');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      cargarChaza();
    }
  }, [slug]);

  const cerrar = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !chaza) {
    return (
      <div className="modal-overlay" onClick={cerrar}>
        <div className="modal-content" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Chaza no encontrada</h2>
          <p>{error || 'Esta chaza no existe o fue eliminada'}</p>
          <button onClick={cerrar} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Usar el mismo modal que en el Home
  return (
    <ChazaDetalleModal
      isOpen={true}
      onClose={cerrar}
      chaza={chaza}
      horariosUsuario={[]}
    />
  );
}

export default DetalleChaza;
