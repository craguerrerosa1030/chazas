import React, { createContext, useContext, useState, useEffect } from 'react';

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

// Simulación de "backend" - Base de datos falsa en localStorage
const USERS_KEY = 'chazas_users';
const CURRENT_USER_KEY = 'chazas_current_user';

// Obtener usuarios guardados
const getStoredUsers = () => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// Guardar usuarios
const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Obtener usuario actual
const getCurrentUser = () => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

// Guardar usuario actual
const saveCurrentUser = (user) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al iniciar la app
  useEffect(() => {
    const savedUser = getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  // Función de registro
  const register = async (userData) => {
    try {
      const users = getStoredUsers();
      
      // Verificar si el email ya existe
      const existingUser = users.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('Ya existe una cuenta con este email');
      }

      // Crear nuevo usuario
      const newUser = {
        id: Date.now(), // ID simple usando timestamp
        email: userData.email,
        nombre: userData.nombre,
        tipoUsuario: userData.tipoUsuario,
        fechaRegistro: new Date().toISOString(),
        // NO guardamos la contraseña en texto plano (simulación)
        passwordHash: `hash_${userData.password}` // En producción sería un hash real
      };

      // Guardar en "base de datos"
      users.push(newUser);
      saveUsers(users);

      // Auto-login después del registro
      const userForSession = { ...newUser };
      delete userForSession.passwordHash; // No mantener el hash en sesión
      
      setUser(userForSession);
      saveCurrentUser(userForSession);

      return { success: true, user: userForSession };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Función de login
  const login = async (email, password) => {
    try {
      const users = getStoredUsers();
      
      // Buscar usuario por email
      const user = users.find(u => u.email === email);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña (simulación)
      if (user.passwordHash !== `hash_${password}`) {
        throw new Error('Contraseña incorrecta');
      }

      // Login exitoso
      const userForSession = { ...user };
      delete userForSession.passwordHash;
      
      setUser(userForSession);
      saveCurrentUser(userForSession);

      return { success: true, user: userForSession };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Función de logout
  const logout = () => {
    setUser(null);
    saveCurrentUser(null);
  };

  // Verificar si está logueado
  const isAuthenticated = () => {
    return user !== null;
  };

  // Verificar tipo de usuario
  const isChazero = () => {
    return user?.tipoUsuario === 'chazero';
  };

  const isEstudiante = () => {
    return user?.tipoUsuario === 'estudiante';
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isChazero,
    isEstudiante
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
// DATOS FIJOS PARA DESARROLLO - Agregar al final del archivo
const createFixedUsers = () => {
  const existingUsers = getStoredUsers();
  
  // Solo crear si no existen usuarios fijos
  if (!existingUsers.some(u => u.email === 'estudiante@chazas.com')) {
    const fixedUsers = [
      {
        id: 1,
        email: 'estudiante@chazas.com',
        nombre: 'María Estudiante',
        tipoUsuario: 'estudiante',
        fechaRegistro: new Date().toISOString(),
        passwordHash: 'hash_123456'
      },
      {
        id: 2,
        email: 'chazero@chazas.com',
        nombre: 'Carlos Chazero',
        tipoUsuario: 'chazero',
        fechaRegistro: new Date().toISOString(),
        passwordHash: 'hash_123456'
      }
    ];
    
    saveUsers([...existingUsers, ...fixedUsers]);
  }
};

// Llamar la función cuando se carga el contexto
createFixedUsers();