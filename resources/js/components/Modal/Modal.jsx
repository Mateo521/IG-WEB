/* 
 * Modal — componente de diálogo modal reutilizable.
 *
 * Este componente se encarga de mostrar una ventana emergente con overlay
 * oscuro, manejo de foco (trap focus), cierre con Escape y restauración
 * del elemento que tenía el foco antes de abrirse.
 *
 * Props:
 *   isOpen   → booleano que controla si el modal se ve o no
 *   onClose  → función que se llama al cerrar (click en overlay, Escape, botón X)
 *   title    → texto del encabezado del modal
 *   children → contenido que va dentro del cuerpo
 */
import { useEffect, useCallback, useRef } from 'react';
import styles from './Modal.module.css';

function Modal({ isOpen, onClose, title, children, className = '' }) {
    const modalRef = useRef(null);
    const previousFocusRef = useRef(null);
    const scrollYRef = useRef(0);

    // Atajos de teclado
    const handleKeyDown = useCallback(e => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Tab') {
            const modal = modalRef.current;
            if (!modal) return;
            // Buscamos todos los elementos enfocables dentro del modal
            const focusable = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            // Shift+Tab vuelve al último, Tab normal va al primero
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement;
            scrollYRef.current = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollYRef.current}px`;
            document.body.style.width = '100%';
            document.addEventListener('keydown', handleKeyDown);
            setTimeout(() => {
                const focusable = modalRef.current?.querySelector(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                focusable?.focus();
            }, 50);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            const scrollY = scrollYRef.current;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, scrollY);
            previousFocusRef.current?.focus();
        };
    }, [isOpen, handleKeyDown]);

    // Si no está abierto, no renderizamos nada
    if (!isOpen) return null;

    return (
        // Overlay: al hacer click se cierra (role presentation para no interferir con accesibilidad)
        <div className={styles.overlay} onClick={onClose} role="presentation">
            <div
                className={`${styles.modal} ${className}`}
                // Evitamos que el click dentro del modal se propague al overlay
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                ref={modalRef}
            >
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <button className={styles.close} onClick={onClose} aria-label="Cerrar">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className={styles.body}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;
