import {Routes, Route, Navigate} from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Importar todas las páginas
import Home from '../paginas/Home';
import Login from '../paginas/Login';
import Registro from '../paginas/Registro';
import Dashboard from '../paginas/Dashboard';
import BuscarChazas from '../paginas/Buscarchazas';
import MisChazas from '../paginas/MisChazas';
import CrearChaza from '../paginas/CrearChaza';
import DetalleChaza from '../paginas/DetalleChaza';
import SobreNosotros from '../paginas/SobreNosotros';
import Verificacion from '../paginas/Verificacion';

const AppRoutes = () =>{
    return(
        <Routes>
            {/*Rutas publicas donde cualquiera puede entrar*/}
            <Route path="/" element = {<Navigate to= "/home" replace />}/>
            <Route path="/home" element={<Home />}/>
            <Route path="/sobre-nosotros" element={<SobreNosotros />}/>
            <Route path="/login" element={<Login />}/>
            <Route path="/registro" element={<Registro/>}/>
            <Route path="/verificar-email" element={<Verificacion />}/>
            <Route path="/buscar-chazas" element={<BuscarChazas />}/>
            {/* Modal de chaza - ahora usa slug en la URL */}
            <Route path="/chaza/:slug" element={<DetalleChaza />}/>

            {/*Rutas protegidas para usuarios que hayan hecho login*/}

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
            <Route path="/mis-chazas" element={<ProtectedRoute><MisChazas /></ProtectedRoute>}/>
            <Route path="/crear-chaza" element={<ProtectedRoute><CrearChaza /></ProtectedRoute>}/>

            {/*Pagina 404 - Ruta no encontrada*/}
            <Route path="*" 
                        element={
                        <div className="error-page">
                            <div className="container">
                            <div className="error-content">
                                <h1>🚫 Página no encontrada</h1>
                                <p>La página que buscas no existe o ha sido movida.</p>
                            </div>
                            </div>
                        </div>
                        } 
      />       
        </Routes>
    );
};

export default AppRoutes;