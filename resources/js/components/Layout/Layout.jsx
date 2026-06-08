import { Outlet, useLocation, Link } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import FloatingIcons from '../FloatingIcons/FloatingIcons';
import styles from './Layout.module.css';

const MAPA_RUTAS = {
    'dashboard': 'Dashboard',
    'rubros': 'Rubros',
    'subrubros': 'Subrubros',
    'categorias': 'Categorías',
    'productos': 'Productos',
    'consultas': 'Consultas',
    'nuevo': 'Nuevo',
    'editar': 'Editar',
};

function Layout() {
    const location = useLocation();
    const segments = location.pathname.split('/').filter(Boolean);

    const breadcrumbs = segments.map((seg, i) => ({
        label: MAPA_RUTAS[seg] || seg,
        path: '/' + segments.slice(0, i + 1).join('/'),
        isLast: i === segments.length - 1,
    }));

    return (
        <div className={styles.layout}>
            <FloatingIcons />
            <Navbar />
            {breadcrumbs.length > 1 && (
                <nav className={styles.breadcrumbs}>
                    {breadcrumbs.map((cr, i) => (
                        <span key={cr.path} className={styles.crumb}>
                            {i > 0 && <span className={styles.sep}>/</span>}
                            {cr.isLast ? (
                                <span className={styles.crumbActive}>{cr.label}</span>
                            ) : (
                                <Link to={cr.path} className={styles.crumbLink}>{cr.label}</Link>
                            )}
                        </span>
                    ))}
                </nav>
            )}
            <main className={styles.main}>
                <div className={styles.container}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default Layout;
