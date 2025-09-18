import React from 'react';

function Dashboard() {
  // Simulamos datos del usuario
  const usuario = {
    nombre: 'Juan Pérez',
    tipo: 'estudiante' // o 'chazero'
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>¡Hola, {usuario.nombre}!</h1>
        <p>Dashboard para {usuario.tipo}</p>
      </div>
      
      <div className="dashboard-content">
        {usuario.tipo === 'estudiante' ? (
          <div className="estudiante-dashboard">
            <div className="dashboard-card">
              <h3>Mis Propuestas</h3>
              <p>Propuestas enviadas: 3</p>
              <p>Aceptadas: 1</p>
              <p>Pendientes: 2</p>
            </div>
            
            <div className="dashboard-card">
              <h3>Próximos Trabajos</h3>
              <p>No tienes trabajos programados</p>
            </div>
          </div>
        ) : (
          <div className="chazero-dashboard">
            <div className="dashboard-card">
              <h3>Mis Chazas</h3>
              <p>Chazas activas: 1</p>
            </div>
            
            <div className="dashboard-card">
              <h3>Propuestas Recibidas</h3>
              <p>Nuevas propuestas: 5</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;