import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal/Modal';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import styles from './Consultas.module.css';

function Consultas() {
    const [consultas, setConsultas] = useState([]);
    const [consultaActual, setConsultaActual] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

    useEffect(() => { fetchConsultas(); }, []);

    const fetchConsultas = async () => {
        setConsultas((await api.get('/consultas')).data);
    };

    const handleDelete = (id) => setConfirmDelete({ isOpen: true, id });

    const handleConfirmDelete = async () => {
        await api.delete(`/consultas/${confirmDelete.id}`);
        setConfirmDelete({ isOpen: false, id: null });
        fetchConsultas();
    };

    const handleCancelDelete = () => setConfirmDelete({ isOpen: false, id: null });

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const abrirMensaje = async (c) => {
        setConsultaActual(c);
        if (!c.visto) {
            try {
                await api.patch(`/consultas/${c.id}/leer`);
                setConsultas(prev => prev.map(cc => cc.id === c.id ? { ...cc, visto: true } : cc));
                window.dispatchEvent(new CustomEvent('consultas-actualizadas'));
            } catch { /* ignore */ }
        }
    };
    const cerrarMensaje = () => setConsultaActual(null);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Consultas</h1>
            </div>

            <Modal isOpen={!!consultaActual} onClose={cerrarMensaje} title="Mensaje">
                {consultaActual && (
                    <div className={styles.modalContent}>
                        <div className={styles.modalMeta}>
                            <div className={styles.modalField}>
                                <span className={styles.modalLabel}>De:</span>
                                <span>{consultaActual.nombreConsulta}</span>
                            </div>
                            <div className={styles.modalField}>
                                <span className={styles.modalLabel}>Email:</span>
                                <span>{consultaActual.email}</span>
                            </div>
                            <div className={styles.modalField}>
                                <span className={styles.modalLabel}>Producto:</span>
                                <span>{consultaActual.producto?.nombreProducto || '-'}</span>
                            </div>
                            <div className={styles.modalField}>
                                <span className={styles.modalLabel}>Fecha:</span>
                                <span>{formatearFecha(consultaActual.created_at)}</span>
                            </div>
                        </div>
                        <div className={styles.mensajeSection}>
                            <span className={styles.mensajeLabel}>Consulta</span>
                            <div className={styles.modalMensaje}>{consultaActual.mensaje}</div>
                        </div>
                        <a
                            href={`mailto:${consultaActual.email}?subject=${encodeURIComponent('Respuesta a su consulta en VITRIO')}&body=${encodeURIComponent(
                                `${consultaActual.nombreConsulta}, me comunico con usted para responderle la consulta hecha en VITRIO sobre "${consultaActual.producto?.nombreProducto || 'el producto'}" que realizó el día ${formatearFecha(consultaActual.created_at)}.\n\n\nSaludos,\nVITRIO TEAM`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.btnResponder}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>
                            Responder
                        </a>
                    </div>
                )}
            </Modal>

            <div className={styles.tableContainer}><table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Mensaje</th>
                        <th>Producto</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {consultas.map(c => (
                        <tr key={c.id} className={!c.visto ? styles.noLeida : ''}>
                            <td>{c.id}</td>
                            <td className={!c.visto ? styles.noLeidaText : ''}>{c.nombreConsulta}</td>
                            <td>{c.email}</td>
                            <td className={`${styles.mensaje}${!c.visto ? ` ${styles.noLeidaText}` : ''}`}>{c.mensaje}</td>
                            <td>{c.producto?.nombreProducto || '-'}</td>
                            <td>{formatearFecha(c.created_at)}</td>
                            <td>
                                <div className={styles.actions}>
                                    <button onClick={() => abrirMensaje(c)} className={styles.btnVer} title="Abrir mensaje">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.039a2.25 2.25 0 0 1 2.134 0l7.5 4.039a2.25 2.25 0 0 1 1.183 1.98V19.5Z" /></svg>
                                    </button>
                                    <button onClick={() => handleDelete(c.id)} className={styles.btnDelete} title="Eliminar">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {consultas.length === 0 && (
                        <tr>
                            <td colSpan={7} className={styles.empty}>No hay consultas</td>
                        </tr>
                    )}
                </tbody>
            </table>            </div>

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                message="¿Eliminar esta consulta?"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </div>
    );
}

export default Consultas;
