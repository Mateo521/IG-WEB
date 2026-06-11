/* 
 * ProductoFormModal — formulario completo de producto dentro de un Modal.
 *
 * Sirve tanto para crear como para editar productos (se deduce por la
 * presencia de productId). Carga en cascada rubros, subrubros y categorías
 * para los selects, maneja la selección múltiple de categorías (M:N) y
 * la subida de imagen con preview en vivo.
 *
 * Props:
 *   isOpen     → controla la visibilidad del modal
 *   productId  → si existe, estamos editando; si es null, estamos creando
 *   onClose    → función para cerrar el modal sin guardar
 *   onSuccess  → se llama después de guardar exitosamente
 */
import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import Modal from '../Modal/Modal';
import styles from './ProductoFormModal.module.css';

function ProductoFormModal({ isOpen, productId, onClose, onSuccess }) {
    // Si tenemos productId significa que estamos editando un producto existente
    const isEditing = Boolean(productId);

    // Datos para los selects en cascada
    const [rubros, setRubros] = useState([]);
    const [subrubros, setSubrubros] = useState([]);
    const [categorias, setCategorias] = useState([]);

    // Estado del formulario
    const [form, setForm] = useState({
        nombreProducto: '', descripcion: '', precio: '',
        rubro_id: '', subrubro_id: '', categorias: []
    });
    const [imagen, setImagen] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    // Ref para revocar el object URL del preview cuando ya no se necesite
    const previewRef = useRef(null);

    // Al abrir el modal cargamos los catálogos (rubros, subrubros, categorías)
    // y si es edición precargamos los datos del producto
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
            // Si es nuevo, reseteamos el formulario a valores vacíos
            setForm({ nombreProducto: '', descripcion: '', precio: '', rubro_id: '', subrubro_id: '', categorias: [] });
            setImagen(null);
            setPreview(null);
        }
        setErrors({});
        // Al desmontar liberamos el object URL del preview para evitar memory leaks
        return () => {
            if (previewRef.current) URL.revokeObjectURL(previewRef.current);
        };
    }, [isOpen, productId, isEditing]);

    // Filtramos subrubros que pertenecen al rubro seleccionado
    const subrubrosFiltrados = subrubros.filter(s => String(s.rubro_id) === String(form.rubro_id));
    // Filtramos categorías vinculadas al subrubro seleccionado (relación M:N)
    const categoriasFiltradas = form.subrubro_id
        ? categorias.filter(c => c.subrubros?.some(s => String(s.id) === String(form.subrubro_id)))
        : [];

    // Actualiza un campo del formulario por su name
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // Agrega o quita una categoría del arreglo de seleccionadas
    const handleCategoriaToggle = (catId) => {
        setForm(prev => ({
            ...prev,
            categorias: prev.categorias.includes(catId)
                ? prev.categorias.filter(id => id !== catId)
                : [...prev.categorias, catId]
        }));
    };

    // Maneja la selección de archivo de imagen generando un preview en vivo
    const handleImage = (e) => {
        const file = e.target.files[0];
        if (previewRef.current) URL.revokeObjectURL(previewRef.current);
        setImagen(file);
        if (file) {
            const url = URL.createObjectURL(file);
            previewRef.current = url;
            setPreview(url);
        } else {
            previewRef.current = null;
            setPreview(null);
        }
    };

    // Envía el formulario como multipart/form-data (necesario para la imagen)
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
            // Laravel no soporta PUT con multipart, así que usamos POST con _method=PUT
            if (isEditing) { data.append('_method', 'PUT'); await api.post(`/productos/${productId}`, data); }
            else { await api.post('/productos', data); }
            setErrors({});
            onSuccess();
        } catch (err) {
            // Si Laravel devuelve 422 (ValidationException) mostramos los errores por campo
            if (err.response?.status === 422 && err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ general: err.response?.data?.message || 'Error al guardar el producto. Intenta de nuevo.' });
            }
        }
        finally { setLoading(false); }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                    {errors.general && <div className={styles.errorBanner} role="alert">{errors.general}</div>}

                    <label className={styles.label}>
                        Nombre
                        <input type="text" name="nombreProducto" value={form.nombreProducto} onChange={handleChange} className={`${styles.input} ${errors.nombreProducto ? styles.inputError : ''}`} required />
                        {errors.nombreProducto && <span className={styles.fieldError}>{errors.nombreProducto[0]}</span>}
                    </label>
                    <label className={styles.label}>
                        Descripción
                        <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className={`${styles.textarea} ${errors.descripcion ? styles.inputError : ''}`} required />
                        {errors.descripcion && <span className={styles.fieldError}>{errors.descripcion[0]}</span>}
                    </label>
                    <label className={styles.label}>
                        Precio
                        <input type="number" step="0.01" min="0" name="precio" value={form.precio} onChange={handleChange} className={`${styles.input} ${errors.precio ? styles.inputError : ''}`} required />
                        {errors.precio && <span className={styles.fieldError}>{errors.precio[0]}</span>}
                    </label>
                    <label className={styles.label}>
                        Rubro
                        <select name="rubro_id" value={form.rubro_id} onChange={handleChange} className={`${styles.input} ${errors.rubro_id ? styles.inputError : ''}`} required>
                            <option value="">Seleccionar rubro</option>
                            {rubros.map(r => <option key={r.id} value={r.id}>{r.nombreRubro}</option>)}
                        </select>
                        {errors.rubro_id && <span className={styles.fieldError}>{errors.rubro_id[0]}</span>}
                    </label>
                    <label className={styles.label}>
                        Subrubro
                        <select name="subrubro_id" value={form.subrubro_id} onChange={handleChange} className={`${styles.input} ${errors.subrubro_id ? styles.inputError : ''}`} required disabled={!form.rubro_id}>
                            <option value="">Seleccionar subrubro</option>
                            {subrubrosFiltrados.map(s => <option key={s.id} value={s.id}>{s.nombreSubrubro}</option>)}
                        </select>
                        {errors.subrubro_id && <span className={styles.fieldError}>{errors.subrubro_id[0]}</span>}
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
                        {errors.categorias && <span className={styles.fieldError}>{errors.categorias[0]}</span>}
                    </fieldset>
                    <label className={styles.uploadArea}>
                        <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.uploadIcon}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                        </svg>
                        <span className={styles.uploadText}>{preview ? 'Cambiar imagen' : 'Subir imagen'}</span>
                        {errors.imagen && <span className={styles.fieldError}>{errors.imagen[0]}</span>}
                    </label>
                    <div className={styles.buttons}>
                        <button type="submit" className={styles.btn} disabled={loading}>{loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}</button>
                        <button type="button" onClick={onClose} className={styles.btnCancel}>Cancelar</button>
                    </div>
                </form>
        </Modal>
    );
}

export default ProductoFormModal;
