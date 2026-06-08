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
