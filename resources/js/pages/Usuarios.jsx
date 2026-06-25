import { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './Usuarios.module.css';

function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => { fetchUsuarios(); }, []);

    const fetchUsuarios = async () => {
        setCargando(true);
        try {
            const res = await api.get('/usuarios');
            setUsuarios(res.data);
        } catch { /* ignore */ }
        setCargando(false);
    };

    const handleAprobar = async (id) => {
        try {
            await api.patch(`/usuarios/${id}/aprobar`);
            fetchUsuarios();
        } catch { /* ignore */ }
    };

    const handleRechazar = async (id) => {
        try {
            await api.delete(`/usuarios/${id}/rechazar`);
            fetchUsuarios();
        } catch { /* ignore */ }
    };

    const handleBaja = async (id, nombre) => {
        if (!window.confirm(`¿Estás seguro de dar de baja a "${nombre}"?`)) return;
        try {
            await api.delete(`/usuarios/${id}`);
            fetchUsuarios();
        } catch { /* ignore */ }
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-AR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    if (cargando) return <div className={styles.page}><p className={styles.cargando}>Cargando...</p></div>;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Usuarios</h1>
                <span className={styles.total}>{usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}</span>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Registro</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.length === 0 ? (
                            <tr>
                                <td colSpan={5} className={styles.empty}>No hay usuarios registrados.</td>
                            </tr>
                        ) : (
                            usuarios.map((u) => (
                                <tr key={u.id} className={u.is_admin ? styles.filaAdmin : ''}>
                                    <td className={styles.nombre}>
                                        {u.name}
                                        {u.is_admin && <span className={styles.badgeAdmin}>Admin</span>}
                                    </td>
                                    <td>{u.email}</td>
                                    <td>{formatearFecha(u.created_at)}</td>
                                    <td>
                                        <span className={`${styles.badge} ${u.is_approved ? styles.badgeAprobado : styles.badgePendiente}`}>
                                            {u.is_approved ? 'Aprobado' : 'Pendiente'}
                                        </span>
                                    </td>
                                    <td>
                                        {!u.is_admin && !u.is_approved && (
                                            <div className={styles.acciones}>
                                                <button className={styles.btnAprobar} onClick={() => handleAprobar(u.id)} title="Aprobar">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                    </svg>
                                                </button>
                                                <button className={styles.btnRechazar} onClick={() => handleRechazar(u.id)} title="Rechazar">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                        {u.is_approved && !u.is_admin && (
                                            <div className={styles.acciones}>
                                                <button className={styles.btnBaja} onClick={() => handleBaja(u.id, u.name)} title="Dar de Baja">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                        {u.is_admin && (
                                            <div className={styles.acciones}>
                                                <span className={styles.textoAdmin}>—</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Usuarios;
