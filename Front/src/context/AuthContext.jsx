import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

// Keys para localStorage
const TOKEN_KEY = 'chazas_token';
const USER_KEY = 'chazas_user';
const PENDING_EMAIL_KEY = 'chazas_pending_email';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingEmail, setPendingEmail] = useState(null);

  // Cargar sesion al iniciar la app
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    const savedPendingEmail = localStorage.getItem(PENDING_EMAIL_KEY);

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }

    if (savedPendingEmail) {
      setPendingEmail(savedPendingEmail);
    }

    setLoading(false);
  }, []);

  // Funcion de registro - Ahora crea registro pendiente y envia codigo
  const register = async (userData) => {
    try {
      // Llamar al backend - ahora devuelve requires_verification
      const response = await api.post('/auth/register', {
        nombre: userData.nombre,
        email: userData.email,
        password: userData.password,
        tipo_usuario: userData.tipoUsuario,
        universidad_id: userData.universidadId
      });

      // Guardar email pendiente para la verificacion
      localStorage.setItem(PENDING_EMAIL_KEY, userData.email);
      setPendingEmail(userData.email);

      return {
        success: true,
        requiresVerification: true,
        email: userData.email,
        message: response.message
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Funcion para verificar registro y crear usuario
  const verifyRegistration = async (email, code) => {
    try {
      const response = await api.post('/auth/verify-registration', {
        email: email,
        code: code
      });

      // Guardar token y usuario
      const { access_token, user: userResponse } = response;

      localStorage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(userResponse));
      localStorage.removeItem(PENDING_EMAIL_KEY);

      setToken(access_token);
      setUser(userResponse);
      setPendingEmail(null);

      return { success: true, user: userResponse };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Funcion para reenviar codigo de registro
  const resendRegistrationCode = async (email) => {
    try {
      const response = await api.post('/auth/resend-registration-code', {
        email: email
      });
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Funcion de login
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email: email,
        password: password
      });

      const { access_token, user: userResponse } = response;

      localStorage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(userResponse));

      setToken(access_token);
      setUser(userResponse);

      return { success: true, user: userResponse };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Funcion de logout
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PENDING_EMAIL_KEY);
    setToken(null);
    setUser(null);
    setPendingEmail(null);
  };

  // Funcion para actualizar datos del usuario
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  };

  // Verificar si esta logueado
  const isAuthenticated = () => {
    return user !== null && token !== null;
  };

  // Verificar si el email esta verificado
  const isVerified = () => {
    return user?.is_verified === true;
  };

  // Verificar tipo de usuario
  const isChazero = () => {
    return user?.tipo_usuario === 'chazero';
  };

  const isEstudiante = () => {
    return user?.tipo_usuario === 'estudiante';
  };

  const value = {
    user,
    token,
    loading,
    pendingEmail,
    login,
    register,
    verifyRegistration,
    resendRegistrationCode,
    logout,
    updateUser,
    isAuthenticated,
    isVerified,
    isChazero,
    isEstudiante
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
