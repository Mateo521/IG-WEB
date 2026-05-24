import { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './Categorias.module.css';

function Categorias() {
    const [categorias, setCategorias] = useState([]);
    const [subrubros, setSubrubros] = useState([]);
    const [form, setForm] = useState({ nombreCategoria: '', subrubro_id: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => { fetchCategorias(); api.get('/subrubros').then(r => setSubrubros(r.data)); }, []);

    const fetchCategorias = async () => { setCategorias((await api.get('/categorias')).data); };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingId) await api.put(`/categorias/${editingId}`, form);
        else await api.post('/categorias', form);
        setForm({ nombreCategoria: '', subrubro_id: '' }); setEditingId(null); fetchCategorias();
    };

    const handleEdit = (c) => { setForm({ nombreCategoria: c.nombreCategoria, subrubro_id: c.subrubro_id }); setEditingId(c.id); };
    const handleDelete = async (id) => { if (!confirm('¿Eliminar esta categoría?')) return; await api.delete(`/categorias/${id}`); fetchCategorias(); };
    const handleCancel = () => { setForm({ nombreCategoria: '', subrubro_id: '' }); setEditingId(null); };

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Categorías</h1>
            <form className={styles.form} onSubmit={handleSubmit}>
                <input type="text" name="nombreCategoria" value={form.nombreCategoria} onChange={handleChange} placeholder="Nombre de la categoría" className={styles.input} required />
                <select name="subrubro_id" value={form.subrubro_id} onChange={handleChange} className={styles.input} required>
                    <option value="">Seleccionar subrubro</option>
                    {subrubros.map(s => <option key={s.id} value={s.id}>{s.nombreSubrubro}</option>)}
                </select>
                <button type="submit" className={styles.btn}>{editingId ? 'Actualizar' : 'Crear'}</button>
                {editingId && <button type="button" onClick={handleCancel} className={styles.btnCancel}>Cancelar</button>}
            </form>
            <table className={styles.table}>
                <thead><tr><th>ID</th><th>Nombre</th><th>Subrubro</th><th>Acciones</th></tr></thead>
                <tbody>
                    {categorias.map(c => (
                        <tr key={c.id}>
                            <td>{c.id}</td>
                            <td>{c.nombreCategoria}</td>
                            <td>{c.subrubro?.nombreSubrubro || '-'}</td>
                            <td className={styles.actions}>
                                <button onClick={() => handleEdit(c)} className={styles.btnEdit}>Editar</button>
                                <button onClick={() => handleDelete(c.id)} className={styles.btnDelete}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                    {categorias.length === 0 && <tr><td colSpan={4} className={styles.empty}>No hay categorías</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

export default Categorias;
