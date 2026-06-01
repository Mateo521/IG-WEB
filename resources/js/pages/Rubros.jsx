import { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './Rubros.module.css';

function Rubros() {
    const [rubros, setRubros] = useState([]);
    const [form, setForm] = useState({ nombreRubro: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => { fetchRubros(); }, []);

    const fetchRubros = async () => { setRubros((await api.get('/rubros')).data); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingId) await api.put(`/rubros/${editingId}`, form);
        else await api.post('/rubros', form);
        setForm({ nombreRubro: '' }); setEditingId(null); fetchRubros();
    };

    const handleEdit = (r) => { setForm({ nombreRubro: r.nombreRubro }); setEditingId(r.id); };
    const handleDelete = async (id) => { if (!confirm('¿Eliminar este rubro?')) return; await api.delete(`/rubros/${id}`); fetchRubros(); };
    const handleCancel = () => { setForm({ nombreRubro: '' }); setEditingId(null); };

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Rubros</h1>
            <form className={styles.form} onSubmit={handleSubmit}>
                <input type="text" name="nombreRubro" value={form.nombreRubro} onChange={e => setForm({ ...form, nombreRubro: e.target.value })} placeholder="Nombre del rubro" className={styles.input} required />
                <button type="submit" className={styles.btn}>{editingId ? 'Actualizar' : 'Crear'}</button>
                {editingId && <button type="button" onClick={handleCancel} className={styles.btnCancel}>Cancelar</button>}
            </form>
            <table className={styles.table}>
                <thead><tr><th>ID</th><th>Nombre</th><th>Acciones</th></tr></thead>
                <tbody>
                    {rubros.map(r => (
                        <tr key={r.id}>
                            <td>{r.id}</td>
                            <td>{r.nombreRubro}</td>
                            <td className={styles.actions}>
                                <button onClick={() => handleEdit(r)} className={styles.btnEdit}>Editar</button>
                                <button onClick={() => handleDelete(r.id)} className={styles.btnDelete}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                    {rubros.length === 0 && <tr><td colSpan={3} className={styles.empty}>No hay rubros</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

export default Rubros;
