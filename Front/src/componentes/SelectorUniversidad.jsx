import { useState, useEffect } from 'react';
import { universidadesApi } from '../services/api';

// Key para localStorage
const UNIVERSIDAD_KEY = 'chazas_universidad';

// Hook para obtener la universidad seleccionada
export const useUniversidadSeleccionada = () => {
  const [universidad, setUniversidad] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(UNIVERSIDAD_KEY);
    if (saved) {
      setUniversidad(JSON.parse(saved));
    }
  }, []);

  const cambiarUniversidad = (uni) => {
    if (uni) {
      localStorage.setItem(UNIVERSIDAD_KEY, JSON.stringify(uni));
      setUniversidad(uni);
    } else {
      localStorage.removeItem(UNIVERSIDAD_KEY);
      setUniversidad(null);
    }
  };

  return { universidad, cambiarUniversidad };
};

// Obtener universidad guardada (sin hook, para uso fuera de componentes)
export const getUniversidadGuardada = () => {
  const saved = localStorage.getItem(UNIVERSIDAD_KEY);
  return saved ? JSON.parse(saved) : null;
};

// Componente Modal de selección
function SelectorUniversidad({ onSeleccionar, mostrar = true }) {
  const [universidades, setUniversidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionada, setSeleccionada] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await universidadesApi.getAll();
        setUniversidades(data);
      } catch (err) {
        console.error('Error cargando universidades:', err);
      } finally {
        setLoading(false);
      }
    };

    if (mostrar) {
      cargar();
    }
  }, [mostrar]);

  const universidadesFiltradas = universidades.filter(uni =>
    uni.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    uni.nombre_corto.toLowerCase().includes(busqueda.toLowerCase()) ||
    uni.ciudad.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleConfirmar = () => {
    if (seleccionada) {
      localStorage.setItem(UNIVERSIDAD_KEY, JSON.stringify(seleccionada));
      onSeleccionar(seleccionada);
    }
  };

  if (!mostrar) return null;

  return (
    <div className="modal-universidad-overlay">
      <div className="modal-universidad">
        <div className="modal-universidad-header">
          <h2>Bienvenido a Chazas</h2>
          <p>Selecciona tu universidad para ver las chazas cerca de ti</p>
        </div>

        <div className="modal-universidad-busqueda">
          <input
            type="text"
            placeholder="Buscar universidad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            autoFocus
          />
        </div>

        <div className="modal-universidad-lista">
          {loading ? (
            <div className="loading-universidades">Cargando universidades...</div>
          ) : universidadesFiltradas.length === 0 ? (
            <div className="no-universidades">No se encontraron universidades</div>
          ) : (
            universidadesFiltradas.map(uni => (
              <div
                key={uni.id}
                className={`universidad-item ${seleccionada?.id === uni.id ? 'seleccionada' : ''}`}
                onClick={() => setSeleccionada(uni)}
                style={{ borderLeftColor: uni.color_primario }}
              >
                <div className="universidad-info">
                  <span className="universidad-nombre">{uni.nombre_corto}</span>
                  <span className="universidad-completo">{uni.nombre}</span>
                  <span className="universidad-ciudad">{uni.ciudad}</span>
                </div>
                {seleccionada?.id === uni.id && (
                  <span className="check-icon">✓</span>
                )}
              </div>
            ))
          )}
        </div>

        <div className="modal-universidad-footer">
          <div className="modal-disclaimer">
            <p>
              <strong>Aviso importante:</strong> Chazas es un proyecto independiente
              creado por estudiantes. NO es una plataforma oficial ni está afiliada
              a ninguna universidad.
            </p>
          </div>
          <button
            className="btn btn-primary btn-large"
            onClick={handleConfirmar}
            disabled={!seleccionada}
          >
            {seleccionada ? `Continuar con ${seleccionada.nombre_corto}` : 'Selecciona una universidad'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectorUniversidad;