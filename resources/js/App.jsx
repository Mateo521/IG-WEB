import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Rubros from './pages/Rubros';
import Subrubros from './pages/Subrubros';
import Categorias from './pages/Categorias';
import Productos from './pages/Productos';
import ProductoForm from './pages/ProductoForm';
import Consultas from './pages/Consultas';
import Catalogo from './pages/Catalogo';
import ProductoDetalle from './pages/ProductoDetalle';
import Layout from './components/Layout/Layout';
import LayoutPublico from './components/LayoutPublico/LayoutPublico';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LayoutPublico />}>
                    <Route index element={<Catalogo />} />
                    <Route path="producto/:id" element={<ProductoDetalle />} />
                </Route>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="rubros" element={<Rubros />} />
                    <Route path="subrubros" element={<Subrubros />} />
                    <Route path="categorias" element={<Categorias />} />
                    <Route path="productos" element={<Productos />} />
                    <Route path="productos/nuevo" element={<ProductoForm />} />
                    <Route path="productos/:id/editar" element={<ProductoForm />} />
                    <Route path="consultas" element={<Consultas />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
