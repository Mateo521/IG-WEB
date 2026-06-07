import styles from './ProductoCardSkeleton.module.css';

/*
 * ProductoCardSkeleton — tarjeta de carga animada.
 *
 * Se muestra mientras los productos están viajando desde el servidor.
 * Simula la forma de una tarjeta real con un efecto de "shimmer" (brillo
 * que se desplaza de izquierda a derecha).
 *
 * Props:
 *   cantidad → cuántas tarjetas placeholder mostrar (por defecto 8)
 */
function ProductoCardSkeleton({ cantidad = 8 }) {
    return (
        <>
            {/* Creamos un array de N elementos vacíos solo para iterar */}
            {Array.from({ length: cantidad }).map((_, i) => (
                <div key={i} className={styles.card}>
                    {/* Área de imagen */}
                    <div className={styles.imagen} />

                    {/* Área de texto: simulamos título, descripción y precio */}
                    <div className={styles.cuerpo}>
                        <div className={styles.linea} style={{ width: '65%' }} />
                        <div className={styles.linea} style={{ width: '100%' }} />
                        <div className={styles.linea} style={{ width: '85%' }} />
                        <div className={`${styles.linea} ${styles.precio}`} style={{ width: '45%' }} />
                    </div>
                </div>
            ))}
        </>
    );
}

export default ProductoCardSkeleton;
