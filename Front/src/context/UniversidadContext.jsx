import { createContext, useContext, useState, useEffect } from 'react';

// Key para localStorage
const UNIVERSIDAD_KEY = 'chazas_universidad';

// Crear el contexto
const UniversidadContext = createContext();

// Hook personalizado para usar el contexto
export const useUniversidad = () => {
  const context = useContext(UniversidadContext);
  if (!context) {
    throw new Error('useUniversidad debe usarse dentro de UniversidadProvider');
  }
  return context;
};

// Obtener universidad guardada (sin hook, para uso fuera de componentes)
export const getUniversidadGuardada = () => {
  const saved = localStorage.getItem(UNIVERSIDAD_KEY);
  return saved ? JSON.parse(saved) : null;
};

export const UniversidadProvider = ({ children }) => {
  const [universidad, setUniversidad] = useState(null);
  const [mostrarSelector, setMostrarSelector] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar universidad guardada al iniciar
  useEffect(() => {
    const saved = localStorage.getItem(UNIVERSIDAD_KEY);
    if (saved) {
      setUniversidad(JSON.parse(saved));
      setMostrarSelector(false);
    } else {
      setMostrarSelector(true);
    }
    setLoading(false);
  }, []);

  // Seleccionar universidad
  const seleccionarUniversidad = (uni) => {
    if (uni) {
      localStorage.setItem(UNIVERSIDAD_KEY, JSON.stringify(uni));
      setUniversidad(uni);
      setMostrarSelector(false);
    }
  };

  // Cambiar universidad (abre el selector de nuevo)
  const cambiarUniversidad = () => {
    setMostrarSelector(true);
  };

  // Limpiar universidad
  const limpiarUniversidad = () => {
    localStorage.removeItem(UNIVERSIDAD_KEY);
    setUniversidad(null);
    setMostrarSelector(true);
  };

  const value = {
    universidad,
    mostrarSelector,
    loading,
    seleccionarUniversidad,
    cambiarUniversidad,
    limpiarUniversidad
  };

  return (
    <UniversidadContext.Provider value={value}>
      {children}
    </UniversidadContext.Provider>
  );
};