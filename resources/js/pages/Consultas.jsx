import { useState, useEffect } from 'react';
import api from '../services/api';
import FloatingIcons from '../components/FloatingIcons/FloatingIcons';
import styles from './Consultas.module.css';

const SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"/></svg>';

function Consultas() {
    const [consultas, setConsultas] = useState([]);

    useEffect(() => { fetchConsultas(); }, []);

    const fetchConsultas = async () => {
        setConsultas((await api.get('/consultas')).data);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta consulta?')) return;
        await api.delete(`/consultas/${id}`);
        fetchConsultas();
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className={styles.page}>
            <FloatingIcons svg={SVG} />
            <div className={styles.header}>
                <h1 className={styles.title}>Consultas</h1>
            </div>

            <table className={styles.table}>
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
                        <tr key={c.id}>
                            <td>{c.id}</td>
                            <td>{c.nombreConsulta}</td>
                            <td>{c.email}</td>
                            <td className={styles.mensaje}>{c.mensaje}</td>
                            <td>{c.producto?.nombreProducto || '-'}</td>
                            <td>{formatearFecha(c.created_at)}</td>
                            <td>
                                <div className={styles.actions}>
                                    <button onClick={() => handleDelete(c.id)} className={styles.btnDelete}>
                                        Eliminar
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
            </table>
        </div>
    );
}

export default Consultas;
