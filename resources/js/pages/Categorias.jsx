import { useState, useEffect } from 'react';
import api from '../services/api';
import FloatingIcons from '../components/FloatingIcons/FloatingIcons';
import styles from './Categorias.module.css';

const SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/><path d="M6 6h.008v.008H6V6z"/></svg>';

function Categorias() {
    const [categorias, setCategorias] = useState([]);
    const [subrubros, setSubrubros] = useState([]);
    const [form, setForm] = useState({ nombreCategoria: '', subrubros: [] });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => { fetchCategorias(); api.get('/subrubros').then(r => setSubrubros(r.data)); }, []);

    const fetchCategorias = async () => { setCategorias((await api.get('/categorias')).data); };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubrubroToggle = (id) => {
        setForm(prev => ({
            ...prev,
            subrubros: prev.subrubros.includes(id)
                ? prev.subrubros.filter(s => s !== id)
                : [...prev.subrubros, id]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = { nombreCategoria: form.nombreCategoria, subrubros: form.subrubros };
        if (editingId) await api.put(`/categorias/${editingId}`, data);
        else await api.post('/categorias', data);
        setForm({ nombreCategoria: '', subrubros: [] }); setEditingId(null); fetchCategorias();
    };

    const handleEdit = (c) => {
        setForm({
            nombreCategoria: c.nombreCategoria,
            subrubros: c.subrubros?.map(s => s.id) || []
        });
        setEditingId(c.id);
    };
    const handleDelete = async (id) => { if (!confirm('¿Eliminar esta categoría?')) return; await api.delete(`/categorias/${id}`); fetchCategorias(); };
    const handleCancel = () => { setForm({ nombreCategoria: '', subrubros: [] }); setEditingId(null); };

    return (
        <div className={styles.page}>
            <FloatingIcons svg={SVG} />
            <h1 className={styles.title}>Categorías</h1>
            <form className={styles.form} onSubmit={handleSubmit}>
                <input type="text" name="nombreCategoria" value={form.nombreCategoria} onChange={handleChange} placeholder="Nombre de la categoría" className={styles.input} required />
                <div className={styles.subrubroCheckbox}>
                    <span className={styles.subrubroLabel}>Subrubros:</span>
                    {subrubros.map(s => (
                        <label key={s.id} className={styles.chip}>
                            <input type="checkbox" checked={form.subrubros.includes(s.id)} onChange={() => handleSubrubroToggle(s.id)} />
                            {s.nombreSubrubro}
                        </label>
                    ))}
                </div>
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
                            <td>{c.subrubros?.map(s => s.nombreSubrubro).join(', ') || '-'}</td>
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
