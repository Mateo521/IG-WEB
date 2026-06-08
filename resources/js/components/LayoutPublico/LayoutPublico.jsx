import { Outlet } from 'react-router-dom';
import styles from './LayoutPublico.module.css';

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
