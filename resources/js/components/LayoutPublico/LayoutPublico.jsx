import { Outlet } from 'react-router-dom';
import styles from './LayoutPublico.module.css';

// Layout simple para las paginas publicas (catalogo y detalle), sin Navbar ni breadcrumbs
function LayoutPublico() {
    return (
        <div className={styles.layout}>
            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    );
}

export default LayoutPublico;
