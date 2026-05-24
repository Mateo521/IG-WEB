import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import styles from './Productos.module.css';

function Productos() {
    const [productos, setProductos] = useState([]);
    useEffect(() => { fetchProductos(); }, []);
    const fetchProductos = async () => { setProductos((await api.get('/productos')).data); };
    const handleDelete = async (id) => { if (!confirm('¿Eliminar este producto?')) return; await api.delete(`/productos/${id}`); fetchProductos(); };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Productos</h1>
                <Link to="/admin/productos/nuevo" className={styles.btnNuevo}>+ Nuevo Producto</Link>
            </div>
            <table className={styles.table}>
                <thead><tr><th>ID</th><th>Imagen</th><th>Nombre</th><th>Precio</th><th>Rubro</th><th>Subrubro</th><th>Categoría</th><th>Acciones</th></tr></thead>
                <tbody>
                    {productos.map(p => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.rutaImg ? <img src={`/storage/${p.rutaImg}`} alt={p.nombreProducto} className={styles.img} /> : <span className={styles.noImg}>-</span>}</td>
                            <td>{p.nombreProducto}</td>
                            <td>${Number(p.precio).toFixed(2)}</td>
                            <td>{p.categoria?.subrubro?.rubro?.nombreRubro || '-'}</td>
                            <td>{p.categoria?.subrubro?.nombreSubrubro || '-'}</td>
                            <td>{p.categoria?.nombreCategoria || '-'}</td>
                            <td className={styles.actions}>
                                <Link to={`/admin/productos/${p.id}/editar`} className={styles.btnEdit}>Editar</Link>
                                <button onClick={() => handleDelete(p.id)} className={styles.btnDelete}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                    {productos.length === 0 && <tr><td colSpan={8} className={styles.empty}>No hay productos</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

export default Productos;
