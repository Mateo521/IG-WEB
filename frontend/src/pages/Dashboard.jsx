import { Link } from 'react-router-dom';
import styles from './Dashboard.module.css';

const cards = [
    { title: 'Rubros', desc: 'Gestionar rubros del catálogo', link: '/admin/rubros' },
    { title: 'Subrubros', desc: 'Gestionar subrubros', link: '/admin/subrubros' },
    { title: 'Categorías', desc: 'Gestionar categorías', link: '/admin/categorias' },
    { title: 'Productos', desc: 'Gestionar productos', link: '/admin/productos' },
];

function Dashboard() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return (
        <div className={styles.page}>
            <h1 className={styles.welcome}>Bienvenido, {user.name}</h1>
            <p className={styles.sub}>Panel de administración del catálogo</p>
            <div className={styles.grid}>
                {cards.map(c => (
                    <Link key={c.title} to={c.link} className={styles.card}>
                        <h2 className={styles.cardTitle}>{c.title}</h2>
                        <p className={styles.cardDesc}>{c.desc}</p>
                    </Link>
                ))}
            </div>
            <div className={styles.proximamente}>
                <h2 className={styles.proxTitle}>PRÓXIMAMENTE CONSULTAS</h2>
                <p className={styles.proxDesc}>Espacio reservado para la gestión de consultas de clientes.</p>
            </div>
        </div>
    );
}

export default Dashboard;
