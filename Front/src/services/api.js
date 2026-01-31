// URL base del backend
// Usa variable de entorno si existe, sino usa URL de produccion
const API_BASE = process.env.REACT_APP_API_URL || 'https://chazas-production.up.railway.app';
const API_URL = `${API_BASE}/api/v1`;

// URL para archivos estáticos (imágenes)
export const getStaticUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE}${path}`;
};

// Manejar sesión expirada - logout automático
const handleSessionExpired = () => {
    // Usar las mismas keys que AuthContext
    localStorage.removeItem('chazas_token');
    localStorage.removeItem('chazas_user');
    // Solo redirigir si no estamos ya en login/registro
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/registro')) {
        // Redirigir y recargar para que AuthContext se reinicie
        window.location.replace('/login?expired=true');
    }
};

// Funcion auxiliar para traducir errores
const traducirError = (err) => {
    if (err.msg.includes('at least 6 characters')) {
        return 'La contrasena debe tener minimo 6 caracteres';
    }
    if (err.msg.includes('valid email')) {
        return 'El email no es valido';
    }
    if (err.msg.includes('at least 2 characters')) {
        return 'El nombre debe tener minimo 2 caracteres';
    }
    if (err.msg.includes('at least 3 characters')) {
        return 'Este campo debe tener minimo 3 caracteres';
    }
    if (err.msg.includes('at least 10 characters')) {
        return 'La descripcion debe tener minimo 10 caracteres';
    }
    return err.msg;
};

// Funcion para procesar errores de respuesta
const procesarError = (result) => {
    let errorMessage = 'Error en la peticion';

    if (typeof result.detail === 'string') {
        errorMessage = result.detail;
    } else if (Array.isArray(result.detail)) {
        errorMessage = result.detail.map(traducirError).join(', ');
    }

    return errorMessage;
};

// Funcion para hacer peticiones al backend
export const api = {
    // POST request para login y registro
    post: async (endpoint, data) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(procesarError(result));
        }

        return result;
    },

    // POST request CON autenticacion (para crear chazas, etc)
    postAuth: async (endpoint, data, token) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        // Si el token expiró, hacer logout automático
        if (response.status === 401) {
            handleSessionExpired();
            throw new Error('Sesión expirada');
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(procesarError(result));
        }

        return result;
    },

    // GET request con autenticacion opcional
    get: async (endpoint, token = null) => {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers,
        });

        // Si el token expiró, hacer logout automático
        if (response.status === 401 && token) {
            handleSessionExpired();
            throw new Error('Sesión expirada');
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || 'Error en la peticion');
        }

        return result;
    },

    // PUT request con autenticacion (para actualizar)
    put: async (endpoint, data, token) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        // Si el token expiró, hacer logout automático
        if (response.status === 401) {
            handleSessionExpired();
            throw new Error('Sesión expirada');
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(procesarError(result));
        }

        return result;
    },

    // DELETE request con autenticacion
    delete: async (endpoint, token) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        // Si el token expiró, hacer logout automático
        if (response.status === 401) {
            handleSessionExpired();
            throw new Error('Sesión expirada');
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || 'Error al eliminar');
        }

        return result;
    },

    // UPLOAD de imagen (usa FormData, no JSON)
    uploadImagen: async (archivo, token) => {
        const formData = new FormData();
        formData.append('file', archivo);

        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/uploads/imagen`, {
            method: 'POST',
            headers,
            body: formData,
            // NO ponemos Content-Type, el browser lo pone automatico con boundary
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || 'Error al subir imagen');
        }

        return result;
    },
};

// Funciones especificas para chazas (mas facil de usar)
export const chazasApi = {
    // Obtener todas las chazas
    getAll: async () => {
        return api.get('/chazas');
    },

    // Obtener una chaza por ID
    getById: async (id) => {
        return api.get(`/chazas/${id}`);
    },

    // Obtener una chaza por slug (URL amigable)
    getBySlug: async (slug) => {
        return api.get(`/chazas/slug/${slug}`);
    },

    // Obtener mis chazas (requiere token)
    getMisChazas: async (token) => {
        return api.get('/chazas/mis-chazas', token);
    },

    // Crear una chaza (requiere token de chazero)
    crear: async (chazaData, token) => {
        return api.postAuth('/chazas/', chazaData, token);
    },

    // Actualizar una chaza
    actualizar: async (id, chazaData, token) => {
        return api.put(`/chazas/${id}`, chazaData, token);
    },

    // Eliminar una chaza
    eliminar: async (id, token) => {
        return api.delete(`/chazas/${id}`, token);
    },

    // === HORARIOS DE TRABAJO ===

    // Obtener horarios de una chaza
    getHorarios: async (chazaId) => {
        return api.get(`/chazas/${chazaId}/horarios`);
    },

    // Actualizar todos los horarios de una chaza
    actualizarHorarios: async (chazaId, horarios, token) => {
        return api.put(`/chazas/${chazaId}/horarios`, horarios, token);
    },

    // Obtener chazas filtradas por universidad
    getByUniversidad: async (universidadId) => {
        return api.get(`/chazas?universidad_id=${universidadId}`);
    },
};

// Funciones para universidades
export const universidadesApi = {
    // Obtener todas las universidades activas
    getAll: async () => {
        return api.get('/universidades');
    },

    // Obtener una universidad por ID
    getById: async (id) => {
        return api.get(`/universidades/${id}`);
    },

    // Obtener una universidad por slug
    getBySlug: async (slug) => {
        return api.get(`/universidades/slug/${slug}`);
    },
};

// Funciones para notificaciones
export const notificacionesApi = {
    // Obtener todas las notificaciones del usuario
    getAll: async (token, soloSinLeer = false, limite = 50) => {
        return api.get(`/notificaciones?solo_sin_leer=${soloSinLeer}&limite=${limite}`, token);
    },

    // Obtener resumen de notificaciones (para el header)
    getResumen: async (token) => {
        return api.get('/notificaciones/resumen', token);
    },

    // Obtener conteo de sin leer
    getCountSinLeer: async (token) => {
        return api.get('/notificaciones/sin-leer/count', token);
    },

    // Marcar una notificacion como leida
    marcarLeida: async (notificacionId, token) => {
        return api.put(`/notificaciones/${notificacionId}/leer`, {}, token);
    },

    // Marcar todas como leidas
    marcarTodasLeidas: async (token) => {
        return api.put('/notificaciones/leer-todas', {}, token);
    },

    // Marcar varias como leidas
    marcarVariasLeidas: async (ids, token) => {
        return api.put('/notificaciones/leer-varias', { notificacion_ids: ids }, token);
    },

    // Eliminar una notificacion
    eliminar: async (notificacionId, token) => {
        return api.delete(`/notificaciones/${notificacionId}`, token);
    },
};

// Funciones para solicitudes de trabajo
export const solicitudesApi = {
    // Crear una nueva solicitud (estudiante se postula a una chaza)
    crear: async (solicitudData, token) => {
        return api.postAuth('/solicitudes/', solicitudData, token);
    },

    // Obtener mis solicitudes enviadas (como estudiante)
    getMisSolicitudes: async (token) => {
        return api.get('/solicitudes/mis-solicitudes', token);
    },

    // Obtener solicitudes recibidas para una chaza (como chazero)
    getSolicitudesChaza: async (chazaId, token, estado = null) => {
        const params = estado ? `?estado=${estado}` : '';
        return api.get(`/solicitudes/chaza/${chazaId}${params}`, token);
    },

    // Obtener una solicitud por ID
    getById: async (solicitudId, token) => {
        return api.get(`/solicitudes/${solicitudId}`, token);
    },

    // Responder a una solicitud (aceptar/rechazar) - solo chazero
    responder: async (solicitudId, estado, respuesta, token) => {
        return api.put(`/solicitudes/${solicitudId}/responder`, {
            estado,
            respuesta
        }, token);
    },

    // Cancelar mi solicitud (como estudiante)
    cancelar: async (solicitudId, token) => {
        return api.put(`/solicitudes/${solicitudId}/cancelar`, {}, token);
    },
};

// Funciones para verificación de email
export const verificationApi = {
    // Enviar código de verificación
    sendCode: async (token) => {
        return api.postAuth('/auth/send-verification', {}, token);
    },

    // Verificar código de 6 dígitos
    verifyCode: async (code, token) => {
        return api.postAuth('/auth/verify-email', { code }, token);
    },

    // Reenviar código
    resendCode: async (token) => {
        return api.postAuth('/auth/resend-verification', {}, token);
    },
};

// Funciones para contacto
export const contactoApi = {
    // Enviar mensaje de contacto (no requiere autenticacion)
    enviar: async (datos) => {
        return api.post('/contacto/', datos);
    },
};