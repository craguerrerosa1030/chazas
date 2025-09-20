import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Registro({ onNavegar }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    tipoUsuario: 'estudiante'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones básicas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      setLoading(false);
      return;
    }

    try {
      console.log('Intentando registrar:', formData); // Para debug
      
      const result = await register({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        tipoUsuario: formData.tipoUsuario
      });
      
      console.log('Resultado del registro:', result); // Para debug

      if (result.success) {
        // Registro exitoso - ir al dashboard
        console.log('¡Registro exitoso! Redirigiendo...');
        onNavegar('dashboard');
      } else {
        // Mostrar error
        setError(result.error);
      }
    } catch (err) {
      console.error('Error en el registro:', err);
      setError('Error inesperado. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Crear Cuenta</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="tipoUsuario">¿Qué eres?</label>
            <select
              id="tipoUsuario"
              name="tipoUsuario"
              value={formData.tipoUsuario}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="estudiante">Estudiante (busco trabajo)</option>
              <option value="chazero">Chazero (tengo una chaza)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="nombre">Nombre completo:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Ej: María García"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="tu@email.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Mínimo 4 caracteres"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Repite la contraseña"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>
        
        <p className="auth-link">
          ¿Ya tienes cuenta? 
          <button 
            onClick={() => onNavegar('login')}
            className="link-button"
            disabled={loading}
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
}

export default Registro;