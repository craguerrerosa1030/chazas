import { useState } from 'react';
import { Link } from 'react-router-dom';
import { contactoApi } from '../services/api';

function Contacto() {
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    asunto: '',
    mensaje: ''
  });
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await contactoApi.enviar(formData);
      setEnviado(true);
      setFormData({ email: '', nombre: '', asunto: '', mensaje: '' });
    } catch (err) {
      setError(err.message || 'Error al enviar el mensaje');
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <div className="contacto-pagina">
        <div className="container">
          <div className="contacto-exito">
            <div className="exito-icono">&#10003;</div>
            <h1>Mensaje Enviado</h1>
            <p>Gracias por contactarnos. Te responderemos lo antes posible.</p>
            <Link to="/home" className="btn btn-primary">Volver al Inicio</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contacto-pagina">
      <div className="container">
        <div className="contacto-header">
          <h1>Contacto</h1>
          <p>
            ¿Tienes preguntas, sugerencias o quieres ejercer tus derechos sobre tus datos personales?
            Escríbenos y te responderemos pronto.
          </p>
        </div>

        <div className="contacto-contenido">
          <form onSubmit={handleSubmit} className="contacto-form">
            {error && <div className="form-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Tu correo electrónico *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@correo.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="nombre">Tu nombre (opcional)</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Tu nombre"
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="asunto">Asunto *</label>
              <input
                type="text"
                id="asunto"
                name="asunto"
                value={formData.asunto}
                onChange={handleChange}
                required
                placeholder="¿En qué podemos ayudarte?"
                minLength={3}
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label htmlFor="mensaje">Mensaje *</label>
              <textarea
                id="mensaje"
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                required
                placeholder="Escribe tu mensaje aquí..."
                rows={6}
                minLength={10}
                maxLength={2000}
              />
              <small>{formData.mensaje.length}/2000 caracteres</small>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </form>

          <div className="contacto-info">
            <h3>Información</h3>
            <p>
              Puedes usar este formulario para:
            </p>
            <ul>
              <li>Reportar problemas técnicos</li>
              <li>Hacer sugerencias</li>
              <li>Solicitar acceso a tus datos personales</li>
              <li>Solicitar la eliminación de tu cuenta</li>
              <li>Cualquier otra consulta</li>
            </ul>

            <div className="contacto-legal">
              <p>
                Al enviar este formulario, aceptas que procesemos tu correo
                electrónico para poder responderte.
                Consulta nuestra <Link to="/privacidad">Política de Privacidad</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contacto;
