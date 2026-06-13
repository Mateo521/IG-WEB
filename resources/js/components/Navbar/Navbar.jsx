import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './Navbar.module.css';

function Navbar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // abierto: controla si el dropdown del usuario esta visible
    const [abierto, setAbierto] = useState(false);
    // consultasNuevas: contador de consultas sin leer, se actualiza cada 30s
    const [consultasNuevas, setConsultasNuevas] = useState(0);
    const refMenu = useRef(null);

    // Cierra el dropdown si se hace click fuera de el
    useEffect(() => {
        const cerrar = (e) => {
            if (refMenu.current && !refMenu.current.contains(e.target)) {
                setAbierto(false);
            }
        };
        document.addEventListener('mousedown', cerrar);
        return () => document.removeEventListener('mousedown', cerrar);
    }, []);

    // Polling cada 30s para actualizar el badge de consultas nuevas
    useEffect(() => {
        const fetchNuevas = () => {
            api.get('/stats')
                .then(r => setConsultasNuevas(r.data.consultas_nuevas ?? 0))
                .catch(() => {});
        };
        fetchNuevas();
        const intervalo = setInterval(fetchNuevas, 30000);
        // Tambien escuchamos el evento personalizado que se dispara desde Consultas.jsx
        window.addEventListener('consultas-actualizadas', fetchNuevas);
        return () => {
            clearInterval(intervalo);
            window.removeEventListener('consultas-actualizadas', fetchNuevas);
        };
    }, []);

    // Cierra sesion: llama al endpoint de logout y limpia localStorage
    const handleLogout = async () => {
        try { await api.post('/logout'); } catch { /* ignore */ }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className={styles.nav}>
            <div className={styles.inner}>
                <Link to="/admin/dashboard" className={styles.brand}>VITRYO</Link>
                <div className={styles.links}>
                    <Link to="/admin/rubros" className={styles.link}>Rubros</Link>
                    <Link to="/admin/subrubros" className={styles.link}>Subrubros</Link>
                    <Link to="/admin/categorias" className={styles.link}>Categorías</Link>
                    <Link to="/admin/consultas" className={styles.link}>
                        Consultas
                        {consultasNuevas > 0 && <span className={styles.notifDot} />}
                    </Link>
                    <Link to="/admin/productos" className={styles.link}>Productos</Link>
                </div>
                <div className={styles.right} ref={refMenu}>
                    <button
                        className={styles.userBtn}
                        onClick={() => setAbierto(!abierto)}
                        aria-label="Menú de usuario"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="22" height="22">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                    </button>

                    {abierto && (
                        <div className={styles.dropdown}>
                            <span className={styles.dropdownName}>{user.name}</span>
                            <button onClick={handleLogout} className={styles.dropdownLogout}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                                </svg>
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
