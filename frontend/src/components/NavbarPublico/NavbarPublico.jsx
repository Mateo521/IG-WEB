import { Link } from 'react-router-dom';
import styles from './NavbarPublico.module.css';

function NavbarPublico() {
    return (
        <nav className={styles.nav}>
            <div className={styles.inner}>
                <Link to="/" className={styles.brand}>POLI-RUBROS</Link>
                <Link to="/login" className={styles.loginBtn}>Iniciar Sesión</Link>
            </div>
        </nav>
    );
}

export default NavbarPublico;
