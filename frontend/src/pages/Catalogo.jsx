import { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './Catalogo.module.css';

function Catalogo() {
    const [productos, setProductos] = useState([]);

    useEffect(() => {
        api.get('/productos').then(r => setProductos(r.data));
    }, []);

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Catálogo de Productos</h1>
            <p className={styles.sub}>Todos nuestros productos disponibles</p>

            <div className={styles.grid}>
                {productos.map(p => (
                    <div key={p.id} className={styles.card}>
                        <div className={styles.imgWrap}>
                            {p.rutaImg ? (
                                <img src={`/storage/${p.rutaImg}`} alt={p.nombreProducto} className={styles.img} />
                            ) : (
                                <div className={styles.noImg}>Sin imagen</div>
                            )}
                        </div>
                        <div className={styles.body}>
                            <h2 className={styles.nombre}>{p.nombreProducto}</h2>
                            <p className={styles.desc}>{p.descripcion}</p>
                            <span className={styles.precio}>${Number(p.precio).toFixed(2)}</span>
                            <span className={styles.categoria}>{p.categoria?.nombreCategoria || ''}</span>
                        </div>
                    </div>
                ))}
                {productos.length === 0 && (
                    <p className={styles.empty}>No hay productos disponibles</p>
                )}
            </div>
        </div>
    );
}

export default Catalogo;
