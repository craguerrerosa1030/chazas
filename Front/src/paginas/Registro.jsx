import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { universidadesApi } from '../services/api';

function Registro() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    tipoUsuario: 'estudiante',
    universidadId: '',
    aceptaTerminos: false
  });
  const [universidades, setUniversidades] = useState([]);
  const [loadingUniversidades, setLoadingUniversidades] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dominiosUniversidad, setDominiosUniversidad] = useState([]);

  // Cargar universidades al montar el componente
  useEffect(() => {
    const cargarUniversidades = async () => {
      try {
        const data = await universidadesApi.getAll();
        setUniversidades(data);
        // Seleccionar la primera universidad por defecto si hay alguna
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, universidadId: data[0].id.toString() }));
          // Establecer dominios de la primera universidad
          if (data[0].dominios_correo) {
            setDominiosUniversidad(data[0].dominios_correo.split(',').map(d => d.trim()));
          }
        }
      } catch (err) {
        console.error('Error cargando universidades:', err);
      } finally {
        setLoadingUniversidades(false);
      }
    };

    cargarUniversidades();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Si cambia la universidad, actualizar dominios permitidos
    if (name === 'universidadId' && value) {
      const uni = universidades.find(u => u.id.toString() === value);
      if (uni && uni.dominios_correo) {
        setDominiosUniversidad(uni.dominios_correo.split(',').map(d => d.trim()));
      } else {
        setDominiosUniversidad([]);
      }
    }

    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  // Validar que el email pertenece al dominio de la universidad
  const validarDominioEmail = () => {
    if (!formData.email || dominiosUniversidad.length === 0) return true;
    const dominio = formData.email.split('@')[1]?.toLowerCase();
    return dominiosUniversidad.some(d => d.toLowerCase() === dominio);
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

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (!formData.universidadId) {
      setError('Debes seleccionar una universidad');
      setLoading(false);
      return;
    }

    // Validar dominio del email
    if (!validarDominioEmail()) {
      const dominiosTexto = dominiosUniversidad.map(d => `@${d}`).join(' o ');
      setError(`Debes usar tu correo institucional (${dominiosTexto})`);
      setLoading(false);
      return;
    }

    try {
      console.log('Intentando registrar:', formData); // Para debug

      const result = await register({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        tipoUsuario: formData.tipoUsuario,
        universidadId: parseInt(formData.universidadId)
      });
      
      console.log('Resultado del registro:', result); // Para debug

      if (result.success) {
        // Registro exitoso - ir a verificar email
        console.log('¡Registro exitoso! Redirigiendo a verificación...');
        navigate('/verificar-email');
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
            <label htmlFor="universidadId">Universidad *</label>
            <select
              id="universidadId"
              name="universidadId"
              value={formData.universidadId}
              onChange={handleChange}
              disabled={loading || loadingUniversidades}
              required
            >
              {loadingUniversidades ? (
                <option value="">Cargando universidades...</option>
              ) : universidades.length === 0 ? (
                <option value="">No hay universidades disponibles</option>
              ) : (
                <>
                  <option value="">Selecciona tu universidad</option>
                  {universidades.map(uni => (
                    <option key={uni.id} value={uni.id}>
                      {uni.nombre} ({uni.ciudad})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

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
            <label htmlFor="email">Email institucional:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder={dominiosUniversidad.length > 0 ? `tu.nombre@${dominiosUniversidad[0]}` : 'tu@email.com'}
            />
            {dominiosUniversidad.length > 0 && (
              <p className="form-help">
                Usa tu correo institucional: @{dominiosUniversidad.join(' o @')}
              </p>
            )}
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
              placeholder="Mínimo 6 caracteres"
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

          <div className="form-group form-checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="aceptaTerminos"
                checked={formData.aceptaTerminos}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <span>
                Acepto la{' '}
                <Link to="/privacidad" target="_blank">Política de Privacidad</Link>
                {' '}y los{' '}
                <Link to="/terminos" target="_blank">Términos y Condiciones</Link>
              </span>
            </label>
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
          <Link
            to="/login"
            className="link-button"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Registro;