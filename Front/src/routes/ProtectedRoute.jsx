import React from "react";
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute =({ children}) =>{
    const {isAuthenticated} = useAuth();


// si NO esta autenticado, lo redirige al login

if (!isAuthenticated()) {
    return <Navigate to= "/login" replace/>;
}

//si esta autenticado muestra la pagina solicitada
return children;
};

export default ProtectedRoute;
