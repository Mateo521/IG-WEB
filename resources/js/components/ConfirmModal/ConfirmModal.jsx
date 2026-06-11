import { useState, useEffect, useCallback } from 'react';
import styles from './ConfirmModal.module.css';

function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
    const [loading, setLoading] = useState(false);

    const handleKeyDown = useCallback(e => {
        if (e.key === 'Escape') onCancel();
    }, [onCancel]);

    useEffect(() => {
        if (isOpen) {
            setLoading(false);
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

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
