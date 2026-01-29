import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { api, chazasApi, getStaticUrl } from '../services/api';

function CrearChaza() {
  const { token, isChazero } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener datos de chaza si viene de edición
  const chazaParaEditar = location.state?.chazaParaEditar || null;
  const esEdicion = Boolean(chazaParaEditar);

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    descripcion: '',
    telefono: '',
    horarioApertura: '06:00',
    horarioCierre: '20:00',
    imagen: null
  });

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagenPreview, setImagenPreview] = useState(null);

  // Cargar datos si es edición
  useEffect(() => {
    if (esEdicion && chazaParaEditar) {
      // Extraer horarios de duracion_estimada si existe (formato "06:00 - 20:00")
      let horarioApertura = '06:00';
      let horarioCierre = '20:00';

      if (chazaParaEditar.duracion_estimada) {
        const partes = chazaParaEditar.duracion_estimada.split(' - ');
        if (partes.length === 2) {
          horarioApertura = partes[0].trim();
          horarioCierre = partes[1].trim();
        }
      }

      setFormData({
        nombre: chazaParaEditar.titulo || '',
        ubicacion: chazaParaEditar.ubicacion || '',
        descripcion: chazaParaEditar.descripcion || '',
        telefono: chazaParaEditar.telefono || '',
        horarioApertura,
        horarioCierre,
        imagen: null
      });

      if (chazaParaEditar.imagen_url) {
        const imagenUrl = getStaticUrl(chazaParaEditar.imagen_url);
        setImagenPreview(imagenUrl);
      }
    }
  }, [esEdicion, chazaParaEditar]);

  // Manejar cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar errores del campo que se está editando
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Manejar selección de imagen
  const handleImageChange = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      // Validar tipo de archivo
      if (!archivo.type.startsWith('image/')) {
        alert('Por favor selecciona sólo archivos de imagen');
        return;
      }

      // Validar tamaño (max 5MB)
      if (archivo.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        imagen: archivo
      }));

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagenPreview(e.target.result);
      };
      reader.readAsDataURL(archivo);
    }
  };

  // Validar formulario
  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre de la chaza es obligatorio';
    } else if (formData.nombre.trim().length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.ubicacion.trim()) {
      nuevosErrores.ubicacion = 'La ubicación es obligatoria';
    } else if (formData.ubicacion.trim().length < 3) {
      nuevosErrores.ubicacion = 'La ubicación debe tener al menos 3 caracteres';
    }

    if (!formData.descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    } else if (formData.descripcion.trim().length < 10) {
      nuevosErrores.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }

    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = 'El WhatsApp es obligatorio para que te contacten';
    } else if (!/^[0-9\-\+\(\)\s]+$/.test(formData.telefono)) {
      nuevosErrores.telefono = 'Número de WhatsApp inválido';
    } else if (formData.telefono.replace(/\D/g, '').length < 10) {
      nuevosErrores.telefono = 'El número debe tener al menos 10 dígitos';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);

    try {
      // 1. Si hay imagen, subirla primero
      let imagenUrl = null;
      if (formData.imagen) {
        console.log('Subiendo imagen...');
        const uploadResult = await api.uploadImagen(formData.imagen, token);
        imagenUrl = uploadResult.url;
        console.log('Imagen subida:', imagenUrl);
      }

      // 2. Crear objeto con datos de la chaza
      const chazaData = {
        titulo: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        categoria: 'comida',  // Por ahora fijo
        ubicacion: formData.ubicacion.trim(),
        duracion_estimada: `${formData.horarioApertura} - ${formData.horarioCierre}`,
        telefono: formData.telefono.trim() || null,
        // Si hay nueva imagen usar esa, si no mantener la anterior (en edicion)
        imagen_url: imagenUrl || (esEdicion ? chazaParaEditar.imagen_url : null)
      };

      console.log('Creando chaza con datos:', chazaData);

      // 3. Crear o actualizar la chaza
      let resultado;
      if (esEdicion) {
        resultado = await chazasApi.actualizar(chazaParaEditar.id, chazaData, token);
        alert('¡Chaza actualizada exitosamente!');
      } else {
        resultado = await chazasApi.crear(chazaData, token);
        alert('¡Chaza creada exitosamente! Los estudiantes ya pueden verla.');
      }

      console.log('Chaza guardada:', resultado);

      // 4. Redirigir
      navigate('/mis-chazas');

    } catch (error) {
      console.error('Error guardando chaza:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Verificar acceso
  if (!isChazero()) {
    return (
      <div className="access-denied">
        <div className="container">
          <h1>Acceso Denegado</h1>
          <p>Esta página es sólo para dueños de chazas.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="crear-chaza">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1>{esEdicion ? 'Editar Mi Chaza' : 'Crear Mi Chaza'}</h1>
          <p>{esEdicion ? 'Actualiza la información de tu chaza' : 'Crea tu chaza y comienza a recibir clientes'}</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="chaza-form">

          {/* Información básica */}
          <div className="form-section">
            <h3>Información Básica</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre de la chaza *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Chaza Don Carlos"
                  disabled={loading}
                  className={errors.nombre ? 'error' : ''}
                />
                {errors.nombre && <span className="error-text">{errors.nombre}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="telefono">WhatsApp de contacto *</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="Ej: 3001234567"
                  disabled={loading}
                  className={errors.telefono ? 'error' : ''}
                />
                <span className="field-hint">Los estudiantes te contactarán por WhatsApp</span>
                {errors.telefono && <span className="error-text">{errors.telefono}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="ubicacion">Ubicación *</label>
              <input
                type="text"
                id="ubicacion"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleInputChange}
                placeholder="Ej: Frente a la Universidad Nacional, Carrera 45 #26-85"
                disabled={loading}
                className={errors.ubicacion ? 'error' : ''}
              />
              {errors.ubicacion && <span className="error-text">{errors.ubicacion}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción de tu chaza *</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Describe tu chaza, que la hace especial, que productos vendes, etc."
                rows={4}
                disabled={loading}
                className={errors.descripcion ? 'error' : ''}
              />
              {errors.descripcion && <span className="error-text">{errors.descripcion}</span>}
            </div>
          </div>

          {/* Horarios de operación */}
          <div className="form-section">
            <h3>Horarios de Operación</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="horarioApertura">Hora de apertura</label>
                <select
                  id="horarioApertura"
                  name="horarioApertura"
                  value={formData.horarioApertura}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  {Array.from({length: 15}, (_, i) => {
                    const hora = (i + 5).toString().padStart(2, '0') + ':00';
                    return (
                      <option key={hora} value={hora}>
                        {hora}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="horarioCierre">Hora de cierre</label>
                <select
                  id="horarioCierre"
                  name="horarioCierre"
                  value={formData.horarioCierre}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  {Array.from({length: 10}, (_, i) => {
                    const hora = (i + 15).toString().padStart(2, '0') + ':00';
                    return (
                      <option key={hora} value={hora}>
                        {hora}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Imagen */}
          <div className="form-section">
            <h3>Imagen de la Chaza (Opcional)</h3>

            <div className="imagen-upload">
              <input
                type="file"
                id="imagen"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
                className="imagen-input"
              />
              <label htmlFor="imagen" className="imagen-label">
                {imagenPreview ? (
                  <div className="imagen-preview">
                    <img src={imagenPreview} alt="Preview" />
                    <div className="imagen-overlay">
                      <span>Cambiar imagen</span>
                    </div>
                  </div>
                ) : (
                  <div className="imagen-placeholder">
                    <div className="imagen-icon">+</div>
                    <p>Click para subir imagen</p>
                    <p className="imagen-info">JPG, PNG o GIF - Máximo 5MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(esEdicion ? '/mis-chazas' : '/dashboard')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              {loading ? (
                <>{esEdicion ? 'Actualizando...' : 'Creando Chaza...'}</>
              ) : (
                <>{esEdicion ? 'Actualizar Chaza' : 'Crear Mi Chaza'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CrearChaza;