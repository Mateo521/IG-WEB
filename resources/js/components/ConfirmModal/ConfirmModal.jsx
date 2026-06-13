/* 
 * ConfirmModal — modal de confirmación para acciones destructivas.
 *
 * Se usa principalmente para confirmar eliminaciones. Muestra un mensaje
 * y dos botones (Cancelar / Confirmar), con un estado de carga mientras
 * se ejecuta la acción para evitar dobles envíos.
 *
 * Props:
 *   isOpen    → controla visibilidad
 *   message   → texto descriptivo de lo que se va a confirmar
 *   onConfirm → función asíncrona que se ejecuta al confirmar
 *   onCancel  → función que se llama al cancelar o presionar Escape
 */
import { useState, useEffect, useCallback } from 'react';
import styles from './ConfirmModal.module.css';

function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
    // Estado de carga mientras se ejecuta onConfirm
    const [loading, setLoading] = useState(false);

    // Cerramos con Escape igual que en el Modal normal
    const handleKeyDown = useCallback(e => {
        if (e.key === 'Escape') onCancel();
    }, [onCancel]);

    useEffect(() => {
        if (isOpen) {
            // Cada vez que se abre reseteamos el estado de carga
            setLoading(false);
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    // Marcamos como cargando antes de ejecutar la acción
    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onCancel} role="presentation">
            <div className={styles.modal} onClick={e => e.stopPropagation()} role="alertdialog" aria-modal="true" aria-label="Confirmar acción">
                <p className={styles.message}>{message}</p>
                <div className={styles.actions}>
                    <button className={styles.btnCancel} onClick={onCancel} disabled={loading}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        Cancelar
                    </button>
                    <button className={styles.btnConfirm} onClick={handleConfirm} disabled={loading}>
                        {loading ? (
                            <>
                                <span className={styles.spinner} aria-hidden="true" />
                                Eliminando...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                                Confirmar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
