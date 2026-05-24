import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './Navbar.module.css';

function Navbar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = async () => {
        try { await api.post('/logout'); } catch { /* ignore */ }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className={styles.nav}>
            <div className={styles.inner}>
                <Link to="/admin/dashboard" className={styles.brand}>POLI-RUBRO</Link>
                <div className={styles.links}>
                    <Link to="/admin/rubros" className={styles.link}>Rubros</Link>
                    <Link to="/admin/subrubros" className={styles.link}>Subrubros</Link>
                    <Link to="/admin/categorias" className={styles.link}>Categorías</Link>
                    <Link to="/admin/productos" className={styles.link}>Productos</Link>
                </div>
                <div className={styles.right}>
                    <span className={styles.user}>{user.name}</span>
                    <button onClick={handleLogout} className={styles.logout}>Salir</button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
