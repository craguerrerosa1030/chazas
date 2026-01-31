import { AuthProvider } from './context/AuthContext';
import { UniversidadProvider, useUniversidad } from './context/UniversidadContext';
import Header from './componentes/Header';
import Footer from './componentes/Footer';
import AppRoutes from './routes/AppRoutes';
import SelectorUniversidad from './componentes/SelectorUniversidad';

// Componente interno que usa el contexto de universidad
function AppContent() {
  const { mostrarSelector, loading, seleccionarUniversidad } = useUniversidad();

  if (loading) {
    return (
      <div className="loading-app">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <>
      {/* Modal de selección de universidad */}
      <SelectorUniversidad
        mostrar={mostrarSelector}
        onSeleccionar={seleccionarUniversidad}
      />

      <div className="App">
        {/* Header siempre visible con navegación */}
        <Header />

        {/* Contenido principal de la página */}
        <main className="main-content">
          <AppRoutes />
        </main>

        {/* Footer con enlaces legales */}
        <Footer />
      </div>
    </>
  );
}

function App() {
  return (
    <UniversidadProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </UniversidadProvider>
  );
}

export default App;