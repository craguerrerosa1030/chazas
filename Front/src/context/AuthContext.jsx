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

// Keys para localStorage (solo guardamos token y usuario, no base de datos falsa)
const TOKEN_KEY = 'chazas_token';
const USER_KEY = 'chazas_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión al iniciar la app
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Función de registro - AHORA USA LA API REAL
  const register = async (userData) => {
    try {
      // Llamar al backend
      const response = await api.post('/auth/register', {
        nombre: userData.nombre,
        email: userData.email,
        password: userData.password,
        tipo_usuario: userData.tipoUsuario,  // El backend espera tipo_usuario
        universidad_id: userData.universidadId  // ID de la universidad
      });

      // Guardar token y usuario
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

  // Función de login - AHORA USA LA API REAL
  const login = async (email, password) => {
    try {
      // Llamar al backend
      const response = await api.post('/auth/login', {
        email: email,
        password: password
      });

      // Guardar token y usuario
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

  // Función de logout
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  // Función para actualizar datos del usuario (ej: después de verificar email)
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  };

  // Verificar si está logueado
  const isAuthenticated = () => {
    return user !== null && token !== null;
  };

  // Verificar si el email está verificado
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
    login,
    register,
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
