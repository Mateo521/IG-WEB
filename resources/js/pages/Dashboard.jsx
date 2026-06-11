import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import styles from './Dashboard.module.css';

// Configuracion de las tarjetas del dashboard: cada una tiene una clave stat que
// coincide con el campo que devuelve la API, y un SVG inline para el icono
const TARJETAS = [
    {
        stat:  'rubros',
        title: 'Rubros',
        desc:  'Categorías principales del catálogo',
        link:  '/admin/rubros',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/></svg>',
    },
    {
        stat:  'subrubros',
        title: 'Subrubros',
        desc:  'Divisiones dentro de cada rubro',
        link:  '/admin/subrubros',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"/></svg>',
    },
    {
        stat:  'categorias',
        title: 'Categorías',
        desc:  'Etiquetas detalladas de productos',
        link:  '/admin/categorias',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/><path d="M6 6h.008v.008H6V6z"/></svg>',
    },
    {
        stat:  'productos',
        title: 'Productos',
        desc:  'Artículos disponibles en el catálogo',
        link:  '/admin/productos',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg>',
    },
    {
        stat:  'consultas',
        title: 'Consultas',
        desc:  'Mensajes recibidos de clientes',
        link:  '/admin/consultas',
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"/></svg>',
    },
];

function Dashboard() {
    // stats: objeto con los contadores que devuelve GET /api/stats
    const [stats,          setStats]          = useState(null);
    const [cargando,       setCargando]       = useState(true);
    const [error,          setError]          = useState(false);

    // Al montar el componente, pedimos las estadisticas al backend
    useEffect(() => {
        api.get('/stats')
            .then(r => setStats(r.data))
            .catch(() => setError(true))
            .finally(() => setCargando(false));
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.grid}>
                {TARJETAS.map((t, i) => (
                    <Link
                        key={t.stat}
                        to={t.link}
                        className={`${styles.card} ${styles[`card--${t.stat}`]}`}
                        style={{ '--i': i }}
                    >
                        <div
                            className={styles.iconBg}
                            dangerouslySetInnerHTML={{ __html: t.svg }}
                        />
                        <div className={styles.cardBody}>
                            <div className={styles.contador}>
                                {cargando ? (
                                    <span className={styles.skeletonNumero} />
                                ) : (
                                    <span>{error ? '—' : (stats?.[t.stat] ?? 0)}</span>
                                )}
                            </div>
                            <h2 className={styles.cardTitle}>{t.title}</h2>
                            <p className={styles.cardDesc}>{t.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>


        </div>
    );
}

export default Dashboard;
