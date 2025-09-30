import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function CrearChaza({ onNavegar, chazaParaEditar = null }) {
  const { user, isChazero } = useAuth();
  const esEdicion = Boolean(chazaParaEditar);

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    descripcion: '',
    telefono: '',
    horarioApertura: '06:00',
    horarioCierre: '20:00',
    productos: [],
    imagen: null
  });

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState('');

  // Lista de productos sugeridos
  const productosSugeridos = [
    'Desayunos', 'Almuerzos', 'Cenas', 'Jugos naturales', 'Café', 
    'Empanadas', 'Arepas', 'Hamburguesas', 'Hot dogs', 'Pizza',
    'Sándwiches', 'Ensaladas', 'Postres', 'Gaseosas', 'Agua',
    'Frituras', 'Comida rápida', 'Comida casera', 'Bebidas calientes',
    'Helados', 'Dulces', 'Mecato', 'Frutas', 'Verduras'
  ];

  // Cargar datos si es edición
  useEffect(() => {
    if (esEdicion && chazaParaEditar) {
      setFormData({
        nombre: chazaParaEditar.nombre || '',
        ubicacion: chazaParaEditar.ubicacion || '',
        descripcion: chazaParaEditar.descripcion || '',
        telefono: chazaParaEditar.telefono || '',
        horarioApertura: chazaParaEditar.horarioApertura || '06:00',
        horarioCierre: chazaParaEditar.horarioCierre || '20:00',
        productos: chazaParaEditar.productos || [],
        imagen: null
      });
      
      setHorariosDisponibles(chazaParaEditar.horariosDisponibles || []);
      
      if (chazaParaEditar.imagenUrl) {
        setImagenPreview(chazaParaEditar.imagenUrl);
      }
    }
  }, [esEdicion, chazaParaEditar]);

  // Generar horarios disponibles automáticamente
  const generarHorariosAutomaticos = () => {
    const horarios = [];
    const apertura = parseInt(formData.horarioApertura.split(':')[0]);
    const cierre = parseInt(formData.horarioCierre.split(':')[0]);
    
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    
    diasSemana.forEach(dia => {
      for (let hora = apertura; hora < cierre; hora++) {
        // Agregar horarios cada 30 minutos
        horarios.push(`${dia}-${hora.toString().padStart(2, '0')}:00`);
        if (hora < cierre - 1) {
          horarios.push(`${dia}-${hora.toString().padStart(2, '0')}:30`);
        }
      }
    });
    
    setHorariosDisponibles(horarios);
  };

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
        alert('❌ Por favor selecciona solo archivos de imagen');
        return;
      }
      
      // Validar tamaño (max 5MB)
      if (archivo.size > 5 * 1024 * 1024) {
        alert('❌ La imagen debe ser menor a 5MB');
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

  // Agregar producto
  const agregarProducto = () => {
    if (!nuevoProducto.trim()) {
      alert('❌ Escribe el nombre del producto');
      return;
    }
    
    if (formData.productos.includes(nuevoProducto.trim())) {
      alert('⚠️ Este producto ya está agregado');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      productos: [...prev.productos, nuevoProducto.trim()]
    }));
    
    setNuevoProducto('');
  };

  // Agregar producto sugerido
  const agregarProductoSugerido = (producto) => {
    if (!formData.productos.includes(producto)) {
      setFormData(prev => ({
        ...prev,
        productos: [...prev.productos, producto]
      }));
    }
  };

  // Remover producto
  const removerProducto = (index) => {
    setFormData(prev => ({
      ...prev,
      productos: prev.productos.filter((_, i) => i !== index)
    }));
  };

  // Editor de horarios manual
  const toggleHorario = (diaHora) => {
    setHorariosDisponibles(prev => {
      if (prev.includes(diaHora)) {
        return prev.filter(h => h !== diaHora);
      } else {
        return [...prev, diaHora];
      }
    });
  };

  // Validar formulario
  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre de la chaza es obligatorio';
    }
    
    if (!formData.ubicacion.trim()) {
      nuevosErrores.ubicacion = 'La ubicación es obligatoria';
    }
    
    if (!formData.descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    }
    
    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es obligatorio';
    } else if (!/^[0-9\-\+\(\)\s]+$/.test(formData.telefono)) {
      nuevosErrores.telefono = 'Teléfono inválido';
    }
    
    if (formData.productos.length === 0) {
      nuevosErrores.productos = 'Agrega al menos un producto';
    }
    
    if (horariosDisponibles.length === 0) {
      nuevosErrores.horarios = 'Selecciona al menos un horario disponible';
    }
    
    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      alert('❌ Por favor completa todos los campos obligatorios');
      return;
    }
    
    setLoading(true);
    
    try {
      // Simular guardado de imagen (en producción sería upload a servidor)
      let imagenUrl = imagenPreview;
      if (formData.imagen && !esEdicion) {
        // En producción aquí haría upload real
        imagenUrl = URL.createObjectURL(formData.imagen);
      }
      
      // Crear objeto chaza
      const nuevaChaza = {
        id: esEdicion ? chazaParaEditar.id : Date.now(),
        duenioId: user.id,
        duenioNombre: user.nombre,
        duenioEmail: user.email,
        nombre: formData.nombre.trim(),
        ubicacion: formData.ubicacion.trim(),
        descripcion: formData.descripcion.trim(),
        telefono: formData.telefono.trim(),
        horarioApertura: formData.horarioApertura,
        horarioCierre: formData.horarioCierre,
        horarios: `${formData.horarioApertura} - ${formData.horarioCierre}`,
        productos: formData.productos,
        horariosDisponibles: horariosDisponibles,
        imagenUrl: imagenUrl,
        activa: true,
        fechaCreacion: esEdicion ? chazaParaEditar.fechaCreacion : new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      };
      
      // Guardar en localStorage
      const chazasExistentes = JSON.parse(localStorage.getItem('chazas_usuario') || '[]');
      
      let chazasActualizadas;
      if (esEdicion) {
        // Actualizar chaza existente
        chazasActualizadas = chazasExistentes.map(c => 
          c.id === chazaParaEditar.id ? nuevaChaza : c
        );
      } else {
        // Verificar que no tenga ya una chaza (UN CHAZERO = UNA CHAZA)
        const tieneChaza = chazasExistentes.some(c => c.duenioId === user.id);
        if (tieneChaza) {
          alert('⚠️ Ya tienes una chaza creada. Solo puedes tener una chaza activa.');
          setLoading(false);
          return;
        }
        
        // Agregar nueva chaza
        chazasActualizadas = [...chazasExistentes, nuevaChaza];
      }
      
      localStorage.setItem('chazas_usuario', JSON.stringify(chazasActualizadas));
      
      // También actualizar en el sistema general de chazas (para que aparezca en búsquedas)
      const chazasGenerales = JSON.parse(localStorage.getItem('chazas_sistema') || '[]');
      const chazasGeneralesActualizadas = chazasGenerales.filter(c => c.duenioId !== user.id);
      chazasGeneralesActualizadas.push(nuevaChaza);
      localStorage.setItem('chazas_sistema', JSON.stringify(chazasGeneralesActualizadas));
      
      // Simular delay para mejor UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mensaje de éxito
      alert(esEdicion ? 
        '✅ ¡Chaza actualizada exitosamente!' : 
        '✅ ¡Chaza creada exitosamente! Los estudiantes ya pueden postularse.'
      );
      
      // Redirigir a la gestión de chazas
      onNavegar('mis-chazas');
      
    } catch (error) {
      console.error('Error guardando chaza:', error);
      alert('❌ Error guardando la chaza. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Verificar acceso
  if (!isChazero()) {
    return (
      <div className="access-denied">
        <div className="container">
          <h1>🚫 Acceso Denegado</h1>
          <p>Esta página es solo para dueños de chazas.</p>
          <button 
            onClick={() => onNavegar('dashboard')}
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
          <h1>{esEdicion ? '✏️ Editar Mi Chaza' : '🏪 Crear Mi Chaza'}</h1>
          <p>{esEdicion ? 'Actualiza la información de tu chaza' : 'Crea tu chaza y comienza a recibir propuestas de estudiantes'}</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="chaza-form">
          
          {/* Información básica */}
          <div className="form-section">
            <h3>📋 Información Básica</h3>
            
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
                <label htmlFor="telefono">Teléfono de contacto *</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="Ej: 300 123 4567"
                  disabled={loading}
                  className={errors.telefono ? 'error' : ''}
                />
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
                placeholder="Describe tu chaza, qué la hace especial, años de experiencia, etc."
                rows={4}
                disabled={loading}
                className={errors.descripcion ? 'error' : ''}
              />
              {errors.descripcion && <span className="error-text">{errors.descripcion}</span>}
            </div>
          </div>

          {/* Horarios de operación */}
          <div className="form-section">
            <h3>⏰ Horarios de Operación</h3>
            
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
            
            <button
              type="button"
              onClick={generarHorariosAutomaticos}
              className="btn btn-secondary"
              disabled={loading}
            >
              🔄 Generar Horarios Automáticamente
            </button>
          </div>

          {/* Productos */}
          <div className="form-section">
            <h3>🛍️ Productos que Vendes</h3>
            
            <div className="agregar-producto">
              <div className="form-row">
                <div className="form-group flex-grow">
                  <input
                    type="text"
                    value={nuevoProducto}
                    onChange={(e) => setNuevoProducto(e.target.value)}
                    placeholder="Escribe un producto..."
                    disabled={loading}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarProducto())}
                  />
                </div>
                <button
                  type="button"
                  onClick={agregarProducto}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  ➕ Agregar
                </button>
              </div>
            </div>
            
            {/* Productos sugeridos */}
            <div className="productos-sugeridos">
              <p><strong>💡 Productos sugeridos (click para agregar):</strong></p>
              <div className="productos-sugeridos-grid">
                {productosSugeridos.filter(p => !formData.productos.includes(p)).map(producto => (
                  <button
                    key={producto}
                    type="button"
                    onClick={() => agregarProductoSugerido(producto)}
                    className="producto-sugerido"
                    disabled={loading}
                  >
                    + {producto}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Productos agregados */}
            {formData.productos.length > 0 && (
              <div className="productos-agregados">
                <p><strong>📦 Productos agregados:</strong></p>
                <div className="productos-list">
                  {formData.productos.map((producto, index) => (
                    <div key={index} className="producto-item">
                      <span>{producto}</span>
                      <button
                        type="button"
                        onClick={() => removerProducto(index)}
                        className="remover-producto"
                        disabled={loading}
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {errors.productos && <span className="error-text">{errors.productos}</span>}
          </div>

          {/* Editor de horarios disponibles */}
          <div className="form-section">
            <h3>📅 Horarios Disponibles para Trabajadores</h3>
            <p>Selecciona los horarios en los que necesitas personal (los estudiantes podrán postularse a estos horarios específicos)</p>
            
            {horariosDisponibles.length > 0 && (
              <div className="horarios-seleccionados-resumen">
                <p><strong>✅ Tienes {horariosDisponibles.length} horarios disponibles seleccionados</strong></p>
              </div>
            )}
            
            <EditorHorarios 
              horariosSeleccionados={horariosDisponibles}
              onToggleHorario={toggleHorario}
              disabled={loading}
            />
            
            {errors.horarios && <span className="error-text">{errors.horarios}</span>}
          </div>

          {/* Imagen */}
          <div className="form-section">
            <h3>📷 Imagen de la Chaza (Opcional)</h3>
            
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
                      <span>📷 Cambiar imagen</span>
                    </div>
                  </div>
                ) : (
                  <div className="imagen-placeholder">
                    <div className="imagen-icon">📷</div>
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
              onClick={() => onNavegar(esEdicion ? 'mis-chazas' : 'dashboard')}
              className="btn btn-secondary"
              disabled={loading}
            >
              ❌ Cancelar
            </button>
            
            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              {loading ? (
                <>⏳ {esEdicion ? 'Actualizando...' : 'Creando Chaza...'}</>
              ) : (
                <>🚀 {esEdicion ? 'Actualizar Chaza' : 'Crear Mi Chaza'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente Editor de Horarios
function EditorHorarios({ horariosSeleccionados, onToggleHorario, disabled }) {
  const [mostrarEditor, setMostrarEditor] = useState(false);
  
  const generarHorarios = () => {
    const horarios = [];
    for (let hour = 6; hour <= 20; hour++) {
      horarios.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 20) {
        horarios.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return horarios;
  };

  const horarios = generarHorarios();
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  const estaSeleccionada = (dia, hora) => {
    return horariosSeleccionados.includes(`${dia}-${hora}`);
  };

  return (
    <div className="editor-horarios">
      <button
        type="button"
        onClick={() => setMostrarEditor(!mostrarEditor)}
        className="btn btn-secondary"
        disabled={disabled}
      >
        {mostrarEditor ? '🔼 Ocultar Editor' : '🔽 Mostrar Editor de Horarios'}
      </button>
      
      {mostrarEditor && (
        <div className="horario-grid-editor">
          <p className="editor-instrucciones">
            🔵 Click en las horas que necesitas personal. Verde = seleccionado, Gris = no seleccionado
          </p>
          
          <div className="horario-grid">
            <div className="horario-header">
              <div className="hora-cell">Hora</div>
              {diasSemana.map(dia => (
                <div key={dia} className="dia-header">{dia}</div>
              ))}
            </div>

            {horarios.map(hora => (
              <div key={hora} className="horario-row">
                <div className="hora-cell">{hora}</div>
                {diasSemana.map(dia => {
                  const seleccionada = estaSeleccionada(dia, hora);
                  
                  return (
                    <div
                      key={`${dia}-${hora}`}
                      className={`hora-slot selectable ${seleccionada ? 'seleccionada' : ''}`}
                      onClick={() => !disabled && onToggleHorario(`${dia}-${hora}`)}
                    >
                      <div className="slot-indicator">
                        {seleccionada ? '✓' : '○'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Resumen de horarios seleccionados */}
      {horariosSeleccionados.length > 0 && (
        <div className="horarios-resumen">
          <p><strong>📋 Horarios seleccionados ({horariosSeleccionados.length}):</strong></p>
          <div className="horarios-tags-small">
            {horariosSeleccionados.slice(0, 10).map(horario => (
              <span key={horario} className="horario-tag-mini">
                {horario.replace('-', ' ')}
              </span>
            ))}
            {horariosSeleccionados.length > 10 && (
              <span className="horarios-mas">+{horariosSeleccionados.length - 10} más</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CrearChaza;