import { useRef, useEffect } from 'react';
import styles from './FloatingIcons.module.css';

const ROWS = 3;
const COLS = 5;

function FloatingIcons({ svg }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const onScroll = () => {
            const rect = container.getBoundingClientRect();
            const viewportMid = window.innerHeight / 2;
            const containerMid = rect.top + rect.height / 2;
            const offset = (containerMid - viewportMid) * 0.08;
            container.style.setProperty('--parallax-y', `${offset}px`);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const icons = Array.from({ length: ROWS * COLS }, (_, i) => {
        const row = Math.floor(i / COLS);
        const col = i % COLS;
        const cellW = 100 / COLS;
        const cellH = 100 / ROWS;
        const pad = 8;
        return {
            id: i,
            top: row * cellH + pad + Math.random() * (cellH - pad * 2),
            left: col * cellW + pad + Math.random() * (cellW - pad * 2),
            size: 30 + Math.random() * 80,
            delay: Math.random() * 8,
            duration: 8 + Math.random() * 8,
            rotate: Math.random() * 360,
        };
    });

    return (
        <div ref={containerRef} className={styles.container}>
            {icons.map(icon => (
                <div
                    key={icon.id}
                    className={styles.icon}
                    style={{
                        top: `${icon.top}%`,
                        left: `${icon.left}%`,
                        width: `${icon.size}px`,
                        height: `${icon.size}px`,
                        '--dur': `${icon.duration}s`,
                        '--del': `${icon.delay}s`,
                        rotate: `${icon.rotate}deg`,
                    }}
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            ))}
        </div>
    );
}

export default FloatingIcons;
