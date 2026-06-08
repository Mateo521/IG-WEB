import { useRef, useEffect, useState, useMemo } from 'react';

const ROWS = 5;
const COLS = 8;
const SVG_PATH = 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4';

function createIcons(count) {
    const icons = [];
    for (let i = 0; i < count; i++) {
        const row = Math.floor(i / COLS);
        const col = i % COLS;
        const cellW = 100 / COLS;
        const cellH = 100 / ROWS;
        const pad = 4;
        icons.push({
            id: i,
            xPct: col * cellW + pad + Math.random() * (cellW - pad * 2),
            yPct: row * cellH + pad + Math.random() * (cellH - pad * 2),
            size: 20 + Math.random() * 90,
            phase: Math.random() * Math.PI * 2,
            speed: 0.2 + Math.random() * 0.5,
            amplitudeY: 20 + Math.random() * 30,
            amplitudeX: 8 + Math.random() * 20,
            rotateStart: Math.random() * 360,
        });
    }
    return icons;
}

export function FloatingCubes() {
    const [frame, setFrame] = useState(0);
    const icons = useMemo(() => createIcons(ROWS * COLS), []);

    useEffect(() => {
        let rafId;
        let start = performance.now();
        let lastFrame = -1;

        const loop = (now) => {
            const f = Math.floor(((now - start) / 1000) * 30);
            if (f !== lastFrame) {
                lastFrame = f;
                setFrame(f);
            }
            rafId = requestAnimationFrame(loop);
        };

        rafId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafId);
    }, []);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            {icons.map((icon) => {
                const t = (frame / 30) * icon.speed;
                const floatY = Math.sin(t + icon.phase) * icon.amplitudeY;
                const floatX = Math.cos(t * 0.7 + icon.phase) * icon.amplitudeX;
                const scale = 1 + Math.sin(t * 0.8 + icon.phase) * 0.12;

                return (
                    <div
                        key={icon.id}
                        style={{
                            position: 'absolute',
                            left: `${icon.xPct}%`,
                            top: `${icon.yPct}%`,
                            transform: `translate(${floatX}px, ${floatY}px) scale(${scale}) rotate(${icon.rotateStart + frame * 1.2}deg)`,
                            width: icon.size,
                            height: icon.size,
                            opacity: 0.1,
                            color: '#ea580c',
                            marginLeft: -icon.size / 2,
                            marginTop: -icon.size / 2,
                        }}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#ea580c"
                            strokeWidth={1.5}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <path d={SVG_PATH} />
                        </svg>
                    </div>
                );
            })}
        </div>
    );
}
