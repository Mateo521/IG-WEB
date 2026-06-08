import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

function buildKeyframes(from, to) {
    const keys = new Set([...Object.keys(from), ...to.flatMap(Object.keys)]);
    const result = {};
    for (const key of keys) {
        const values = [from[key]];
        for (const state of to) {
            values.push(key in state ? state[key] : values[values.length - 1]);
        }
        result[key] = values;
    }
    return result;
}

function BlurText({
    text = '',
    delay = 200,
    className = '',
    animateBy = 'words',
    direction = 'top',
    threshold = 0.1,
    rootMargin = '0px',
    animationFrom,
    animationTo,
    easing,
    onAnimationComplete,
    stepDuration = 0.35,
}) {
    const elements = animateBy === 'words' ? text.split(' ') : text.split('');
    const [inView, setInView] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.unobserve(el);
                }
            },
            { threshold, rootMargin }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold, rootMargin]);

    const defaultFrom = direction === 'top'
        ? { filter: 'blur(10px)', opacity: 0, y: -50 }
        : { filter: 'blur(10px)', opacity: 0, y: 50 };

    const defaultTo = [
        { filter: 'blur(5px)', opacity: 0.5, y: direction === 'top' ? 5 : -5 },
        { filter: 'blur(0px)', opacity: 1, y: 0 },
    ];

    const fromSnapshot = animationFrom || defaultFrom;
    const toSnapshots = animationTo || defaultTo;

    const stepCount = toSnapshots.length + 1;
    const totalDuration = stepDuration * (stepCount - 1);
    const times = Array.from({ length: stepCount }, (_, i) =>
        stepCount === 1 ? 0 : i / (stepCount - 1)
    );

    const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);

    return (
        <p ref={ref} className={className}>
            {elements.map((segment, index) => (
                <motion.span
                    key={index}
                    initial={fromSnapshot}
                    animate={inView ? animateKeyframes : fromSnapshot}
                    transition={{
                        duration: totalDuration,
                        times,
                        delay: (index * delay) / 1000,
                        ease: easing,
                    }}
                    onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
                    style={{ display: 'inline-block' }}
                >
                    {segment === ' ' ? '\u00A0' : segment}
                    {animateBy === 'words' && index < elements.length - 1 ? '\u00A0' : ''}
                </motion.span>
            ))}
        </p>
    );
}

export default BlurText;
