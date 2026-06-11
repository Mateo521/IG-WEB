import { Navigate } from 'react-router-dom';

// Componente que protege las rutas del admin: si no hay token redirige al login
function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" replace />;
    return children;
}

export default ProtectedRoute;
