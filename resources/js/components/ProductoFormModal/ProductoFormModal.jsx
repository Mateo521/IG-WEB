import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../Modal/Modal';
import styles from './ProductoFormModal.module.css';

function ProductoFormModal({ isOpen, productId, onClose, onSuccess }) {
    const isEditing = Boolean(productId);

    const [rubros, setRubros] = useState([]);
    const [subrubros, setSubrubros] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const [form, setForm] = useState({
        nombreProducto: '', descripcion: '', precio: '',
        rubro_id: '', subrubro_id: '', categorias: []
    });
    const [imagen, setImagen] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        api.get('/rubros').then(r => setRubros(r.data));
        api.get('/subrubros').then(r => setSubrubros(r.data));
        api.get('/categorias').then(r => setCategorias(r.data));

        if (isEditing) {
            api.get(`/productos/${productId}`).then(r => {
                const p = r.data;
                setForm({
                    nombreProducto: p.nombreProducto,
                    descripcion: p.descripcion,
                    precio: p.precio,
                    rubro_id: p.rubro_id || '',
                    subrubro_id: p.subrubro_id || '',
                    categorias: p.categorias?.map(c => c.id) || [],
                });
                if (p.rutaImg) setPreview(`/storage/${p.rutaImg}`);
            });
        } else {
            setForm({ nombreProducto: '', descripcion: '', precio: '', rubro_id: '', subrubro_id: '', categorias: [] });
            setImagen(null);
            setPreview(null);
        }
    }, [isOpen, productId, isEditing]);

    const subrubrosFiltrados = subrubros.filter(s => String(s.rubro_id) === String(form.rubro_id));
    const categoriasFiltradas = form.subrubro_id
        ? categorias.filter(c => c.subrubros?.some(s => String(s.id) === String(form.subrubro_id)))
        : [];

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleCategoriaToggle = (catId) => {
        setForm(prev => ({
            ...prev,
            categorias: prev.categorias.includes(catId)
                ? prev.categorias.filter(id => id !== catId)
                : [...prev.categorias, catId]
        }));
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        setImagen(file);
        if (file) setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        data.append('nombreProducto', form.nombreProducto);
        data.append('descripcion', form.descripcion);
        data.append('precio', form.precio);
        data.append('rubro_id', form.rubro_id);
        data.append('subrubro_id', form.subrubro_id);
        form.categorias.forEach(c => data.append('categorias[]', c));
        if (imagen) data.append('imagen', imagen);
        try {
            if (isEditing) { data.append('_method', 'PUT'); await api.post(`/productos/${productId}`, data); }
            else { await api.post('/productos', data); }
            onSuccess();
        } catch { /* error */ }
        finally { setLoading(false); }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}>
            <div className={styles.body}>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <label className={styles.label}>
                        Nombre
                        <input type="text" name="nombreProducto" value={form.nombreProducto} onChange={handleChange} className={styles.input} required />
                    </label>
                    <label className={styles.label}>
                        Descripción
                        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className={styles.textarea} required />
                    </label>
                    <label className={styles.label}>
                        Precio
                        <input type="number" step="0.01" min="0" name="precio" value={form.precio} onChange={handleChange} className={styles.input} required />
                    </label>
                    <label className={styles.label}>
                        Rubro
                        <select name="rubro_id" value={form.rubro_id} onChange={handleChange} className={styles.input} required>
                            <option value="">Seleccionar rubro</option>
                            {rubros.map(r => <option key={r.id} value={r.id}>{r.nombreRubro}</option>)}
                        </select>
                    </label>
                    <label className={styles.label}>
                        Subrubro
                        <select name="subrubro_id" value={form.subrubro_id} onChange={handleChange} className={styles.input} required disabled={!form.rubro_id}>
                            <option value="">Seleccionar subrubro</option>
                            {subrubrosFiltrados.map(s => <option key={s.id} value={s.id}>{s.nombreSubrubro}</option>)}
                        </select>
                    </label>
                    <fieldset className={styles.fieldset}>
                        <legend className={styles.legend}>Categorías</legend>
                        {!form.subrubro_id ? (
                            <p className={styles.hint}>Selecciona un subrubro primero</p>
                        ) : categoriasFiltradas.length === 0 ? (
                            <p className={styles.hint}>No hay categorías para este subrubro</p>
                        ) : (
                            <div className={styles.checkboxGrid}>
                                {categoriasFiltradas.map(c => (
                                    <label key={c.id} className={styles.chip}>
                                        <input type="checkbox" checked={form.categorias.includes(c.id)} onChange={() => handleCategoriaToggle(c.id)} />
                                        {c.nombreCategoria}
                                    </label>
                                ))}
                            </div>
                        )}
                    </fieldset>
                    <label className={styles.label}>
                        Imagen
                        <input type="file" accept="image/*" onChange={handleImage} className={styles.input} />
                        {preview && <img src={preview} alt="Preview" className={styles.preview} />}
                    </label>
                    <div className={styles.buttons}>
                        <button type="submit" className={styles.btn} disabled={loading}>{loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}</button>
                        <button type="button" onClick={onClose} className={styles.btnCancel}>Cancelar</button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export default ProductoFormModal;
