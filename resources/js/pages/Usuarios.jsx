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
                                                <button className={styles.btnAprobar} onClick={() => handleAprobar(u.id)}>
                                                    Aprobar
                                                </button>
                                                <button className={styles.btnRechazar} onClick={() => handleRechazar(u.id)}>
                                                    Rechazar
                                                </button>
                                            </div>
                                        )}
                                        {u.is_approved && !u.is_admin && (
                                            <span className={styles.textoAprobado}>Usuario activo</span>
                                        )}
                                        {u.is_admin && (
                                            <span className={styles.textoAdmin}>—</span>
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
