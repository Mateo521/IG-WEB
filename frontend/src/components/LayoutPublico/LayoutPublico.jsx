import { Outlet } from 'react-router-dom';
import NavbarPublico from '../NavbarPublico/NavbarPublico';
import styles from './LayoutPublico.module.css';

function LayoutPublico() {
    return (
        <div className={styles.layout}>
            <NavbarPublico />
            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    );
}

export default LayoutPublico;
