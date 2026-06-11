/* 
 * FloatingIcons — decoración visual de fondo con círculos flotantes.
 *
 * Renderiza cuatro divs con formas circulares posicionadas en las
 * esquinas del contenedor. Es puramente estético, por eso lleva
 * aria-hidden="true" para que los lectores de pantalla lo ignoren.
 */
import styles from './FloatingIcons.module.css';

function FloatingIcons() {
    return (
        <div className={styles.container} aria-hidden="true">
            <div className={styles.circleTopRight} />
            <div className={styles.circleBottomLeft} />
            <div className={styles.circleCenterRight} />
            <div className={styles.circleTopLeft} />
        </div>
    );
}

export default FloatingIcons;
