import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Rubros from './pages/Rubros';
import Subrubros from './pages/Subrubros';
import Categorias from './pages/Categorias';
import Productos from './pages/Productos';
import Consultas from './pages/Consultas';
import Usuarios from './pages/Usuarios';
import Catalogo from './pages/Catalogo';
import ProductoDetalle from './pages/ProductoDetalle';
import Layout from './components/Layout/Layout';
import LayoutPublico from './components/LayoutPublico/LayoutPublico';
import ProtectedRoute from './components/ProtectedRoute';

// Aca se define toda la estructura de rutas de la aplicacion
// Las rutas publicas van con LayoutPublico, las de admin con ProtectedRoute + Layout
function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rutas publicas: catalogo y detalle de producto */}
                <Route path="/" element={<LayoutPublico />}>
                    <Route index element={<Catalogo />} />
                    <Route path="producto/:id" element={<ProductoDetalle />} />
                </Route>
                {/* Rutas de autenticacion */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* Rutas del admin: requieren token de autenticacion */}
                <Route path="/admin" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="rubros" element={<Rubros />} />
                    <Route path="subrubros" element={<Subrubros />} />
                    <Route path="categorias" element={<Categorias />} />
                    <Route path="productos" element={<Productos />} />
                    <Route path="consultas" element={<Consultas />} />
                    <Route path="usuarios" element={<Usuarios />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
