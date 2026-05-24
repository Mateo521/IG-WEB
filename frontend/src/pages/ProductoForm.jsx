import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import styles from './ProductoForm.module.css';

function ProductoForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [categorias, setCategorias] = useState([]);
    const [form, setForm] = useState({ nombreProducto: '', descripcion: '', precio: '', categoria_id: '' });
    const [imagen, setImagen] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/categorias').then(r => setCategorias(r.data));
        if (isEditing) {
            api.get(`/productos/${id}`).then(r => {
                const p = r.data;
                setForm({ nombreProducto: p.nombreProducto, descripcion: p.descripcion, precio: p.precio, categoria_id: p.categoria_id });
                if (p.rutaImg) setPreview(`/storage/${p.rutaImg}`);
            });
        }
    }, [id, isEditing]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleImage = (e) => { const file = e.target.files[0]; setImagen(file); if (file) setPreview(URL.createObjectURL(file)); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        data.append('nombreProducto', form.nombreProducto);
        data.append('descripcion', form.descripcion);
        data.append('precio', form.precio);
        data.append('categoria_id', form.categoria_id);
        if (imagen) data.append('imagen', imagen);
        try {
            if (isEditing) { data.append('_method', 'PUT'); await api.post(`/productos/${id}`, data); }
            else { await api.post('/productos', data); }
            navigate('/admin/productos');
        } catch { alert('Error al guardar el producto'); }
        finally { setLoading(false); }
    };

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h1>
            <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.label}>Nombre
                    <input type="text" name="nombreProducto" value={form.nombreProducto} onChange={handleChange} className={styles.input} required />
                </label>
                <label className={styles.label}>Descripción
                    <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className={styles.textarea} required />
                </label>
                <label className={styles.label}>Precio
                    <input type="number" step="0.01" min="0" name="precio" value={form.precio} onChange={handleChange} className={styles.input} required />
                </label>
                <label className={styles.label}>Categoría
                    <select name="categoria_id" value={form.categoria_id} onChange={handleChange} className={styles.input} required>
                        <option value="">Seleccionar categoría</option>
                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nombreCategoria}</option>)}
                    </select>
                </label>
                <label className={styles.label}>Imagen
                    <input type="file" accept="image/*" onChange={handleImage} className={styles.input} />
                    {preview && <img src={preview} alt="Preview" className={styles.preview} />}
                </label>
                <div className={styles.buttons}>
                    <button type="submit" className={styles.btn} disabled={loading}>{loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}</button>
                    <button type="button" onClick={() => navigate('/admin/productos')} className={styles.btnCancel}>Cancelar</button>
                </div>
            </form>
        </div>
    );
}

export default ProductoForm;
