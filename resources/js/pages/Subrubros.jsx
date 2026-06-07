import { useState, useEffect } from 'react';
import api from '../services/api';
import FloatingIcons from '../components/FloatingIcons/FloatingIcons';
import styles from './Subrubros.module.css';

const SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"/></svg>';

function Subrubros() {
    const [subrubros, setSubrubros] = useState([]);
    const [rubros, setRubros] = useState([]);
    const [form, setForm] = useState({ nombreSubrubro: '', rubro_id: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => { fetchSubrubros(); api.get('/rubros').then(r => setRubros(r.data)); }, []);

    const fetchSubrubros = async () => { setSubrubros((await api.get('/subrubros')).data); };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingId) await api.put(`/subrubros/${editingId}`, form);
        else await api.post('/subrubros', form);
        setForm({ nombreSubrubro: '', rubro_id: '' }); setEditingId(null); fetchSubrubros();
    };

    const handleEdit = (s) => { setForm({ nombreSubrubro: s.nombreSubrubro, rubro_id: s.rubro_id }); setEditingId(s.id); };
    const handleDelete = async (id) => { if (!confirm('¿Eliminar este subrubro?')) return; await api.delete(`/subrubros/${id}`); fetchSubrubros(); };
    const handleCancel = () => { setForm({ nombreSubrubro: '', rubro_id: '' }); setEditingId(null); };

    return (
        <div className={styles.page}>
            <FloatingIcons svg={SVG} />
            <h1 className={styles.title}>Subrubros</h1>
            <form className={styles.form} onSubmit={handleSubmit}>
                <input type="text" name="nombreSubrubro" value={form.nombreSubrubro} onChange={handleChange} placeholder="Nombre del subrubro" className={styles.input} required />
                <select name="rubro_id" value={form.rubro_id} onChange={handleChange} className={styles.input} required>
                    <option value="">Seleccionar rubro</option>
                    {rubros.map(r => <option key={r.id} value={r.id}>{r.nombreRubro}</option>)}
                </select>
                <button type="submit" className={styles.btn}>{editingId ? 'Actualizar' : 'Crear'}</button>
                {editingId && <button type="button" onClick={handleCancel} className={styles.btnCancel}>Cancelar</button>}
            </form>
            <table className={styles.table}>
                <thead><tr><th>ID</th><th>Nombre</th><th>Rubro</th><th>Acciones</th></tr></thead>
                <tbody>
                    {subrubros.map(s => (
                        <tr key={s.id}>
                            <td>{s.id}</td><td>{s.nombreSubrubro}</td><td>{s.rubro?.nombreRubro || '-'}</td>
                            <td className={styles.actions}>
                                <button onClick={() => handleEdit(s)} className={styles.btnEdit}>Editar</button>
                                <button onClick={() => handleDelete(s.id)} className={styles.btnDelete}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                    {subrubros.length === 0 && <tr><td colSpan={4} className={styles.empty}>No hay subrubros</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

export default Subrubros;
