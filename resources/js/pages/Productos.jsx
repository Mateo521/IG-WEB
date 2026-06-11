import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import Modal from '../components/Modal/Modal';
import ProductoFormModal from '../components/ProductoFormModal/ProductoFormModal';
import styles from './Productos.module.css';

function Productos() {
    const [productos,        setProductos]        = useState([]);
    const [importando,       setImportando]        = useState(false);
    const [exportando,       setExportando]        = useState(false);
    // resultadoImport: guarda lo que devuelve el backend despues de importar (creados, errores, etc.)
    const [resultadoImport,  setResultadoImport]   = useState(null);

    // Referencia al input de archivo oculto para importar CSV
    const refInputArchivo = useRef(null);
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });
    const [showProductoModal, setShowProductoModal] = useState(false);
    const [editProductoId, setEditProductoId] = useState(null);
    // previewImage: ruta de la imagen que se muestra en el modal de vista previa
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => { fetchProductos(); }, []);

    // Traemos todos los productos sin paginar para mostrar en la tabla del admin
    const fetchProductos = async () => {
        setProductos((await api.get('/productos', { params: { paginate: 'false' } })).data);
    };

    const handleDelete = (id) => setConfirmDelete({ isOpen: true, id });

    const handleConfirmDelete = async () => {
        await api.delete(`/productos/${confirmDelete.id}`);
        setConfirmDelete({ isOpen: false, id: null });
        fetchProductos();
    };

    const handleCancelDelete = () => setConfirmDelete({ isOpen: false, id: null });

    const openCreateModal = () => {
        setEditProductoId(null);
        setShowProductoModal(true);
    };

    const openEditModal = (id) => {
        setEditProductoId(id);
        setShowProductoModal(true);
    };

    const closeProductoModal = () => {
        setShowProductoModal(false);
        setEditProductoId(null);
    };

    const onProductoSuccess = () => {
        closeProductoModal();
        fetchProductos();
    };

    // Toma el archivo CSV seleccionado y lo envia al backend para procesarlo fila por fila
    const handleImportar = async (e) => {
        const archivo = e.target.files[0];
        if (!archivo) return;

        setImportando(true);
        setResultadoImport(null);

        const formData = new FormData();
        formData.append('archivo', archivo);

        try {
            const r = await api.post('/productos/importar', formData);
            setResultadoImport({ ok: true, ...r.data });
            fetchProductos();
        } catch (error) {
            const mensaje = error.response?.data?.message || 'Error al procesar el archivo CSV';
            setResultadoImport({ ok: false, mensaje });
        } finally {
            setImportando(false);
            // Limpiamos el input para poder subir el mismo archivo de nuevo
            e.target.value = '';
        }
    };

    // Descarga los productos actuales como CSV usando el endpoint de exportacion
    const handleExportar = async () => {
        setExportando(true);
        try {
            const respuesta = await api.get('/productos/exportar', { responseType: 'blob' });

            const urlBlob  = URL.createObjectURL(new Blob([respuesta.data], { type: 'text/csv' }));
            const fechaHoy = new Date().toISOString().split('T')[0];

            // Creamos un <a> invisible para forzar la descarga del navegador
            const enlace      = document.createElement('a');
            enlace.href       = urlBlob;
            enlace.download   = `productos-${fechaHoy}.csv`;
            document.body.appendChild(enlace);
            enlace.click();
            document.body.removeChild(enlace);

            URL.revokeObjectURL(urlBlob);
        } catch (error) {
            console.error('Error al exportar:', error);
            alert('No se pudo generar el archivo de exportación.');
        } finally {
            setExportando(false);
        }
    };

    // Genera un CSV de ejemplo en el cliente para que el usuario sepa el formato esperado
    const handleDescargarPlantilla = () => {
        const contenido =
            'sep=,\n' +
            'nombreProducto,descripcion,precio,rubro_id,subrubro_id,categorias\n' +
            '"Producto de ejemplo","Descripción del producto",1500.00,1,1,1|2\n';

        const blob  = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
        const url   = URL.createObjectURL(blob);
        const a     = document.createElement('a');
        a.href      = url;
        a.download  = 'plantilla-productos.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Productos</h1>

                <div className={styles.acciones}>
                    <input
                        type="file"
                        accept=".csv,text/csv"
                        ref={refInputArchivo}
                        onChange={handleImportar}
                        style={{ display: 'none' }}
                    />

                    <button
                        className={styles.btnPlantilla}
                        onClick={handleDescargarPlantilla}
                        title="Descarga un CSV de ejemplo con el formato correcto"
                    >
                        Plantilla CSV
                    </button>

                    <button
                        className={styles.btnImportar}
                        onClick={() => refInputArchivo.current?.click()}
                        disabled={importando}
                    >
                        {importando ? 'Importando...' : 'Importar CSV'}
                    </button>

                    <button
                        className={styles.btnExportar}
                        onClick={handleExportar}
                        disabled={exportando}
                    >
                        {exportando ? 'Generando...' : 'Exportar CSV'}
                    </button>

                    <button onClick={openCreateModal} className={styles.btnNuevo}>
                        + Nuevo Producto
                    </button>
                </div>
            </div>

            {resultadoImport && (
                <div className={`${styles.resultadoImport} ${resultadoImport.ok ? styles.resultadoOk : styles.resultadoError}`}>
                    <div className={styles.resultadoHeader}>
                        <span>{resultadoImport.mensaje}</span>
                        <button className={styles.btnCerrarResultado} onClick={() => setResultadoImport(null)}>×</button>
                    </div>
                    {resultadoImport.errores?.length > 0 && (
                        <ul className={styles.listaErrores}>
                            {resultadoImport.errores.map((e, i) => (
                                <li key={i}>Fila {e.fila}: {e.motivo}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <div className={styles.tableContainer}><table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Imagen</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Rubro</th>
                        <th>Subrubro</th>
                        <th>Categoría</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map(p => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>
                                {p.rutaImg
                                    ? <button className={styles.imgWrap} onClick={() => setPreviewImage(`/storage/${p.rutaImg}`)} aria-label={`Ver imagen de ${p.nombreProducto}`}>
                                        <img src={`/storage/${p.rutaImg}`} alt={p.nombreProducto} className={styles.img} />
                                        <span className={styles.imgOverlay}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                                            </svg>
                                        </span>
                                    </button>
                                    : <span className={styles.noImg}>-</span>
                                }
                            </td>
                            <td>{p.nombreProducto}</td>
                            <td>${Number(p.precio).toFixed(2)}</td>
                            <td>{p.rubro?.nombreRubro       || '-'}</td>
                            <td>{p.subrubro?.nombreSubrubro || '-'}</td>
                            <td>{p.categorias?.map(c => c.nombreCategoria).join(', ') || '-'}</td>
                            <td>
                                <div className={styles.actions}>
                                    <button onClick={() => openEditModal(p.id)} className={styles.btnEdit} aria-label={`Editar ${p.nombreProducto}`}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg></button>
                                    <button onClick={() => handleDelete(p.id)} className={styles.btnDelete} aria-label={`Eliminar ${p.nombreProducto}`}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {productos.length === 0 && (
                        <tr>
                            <td colSpan={8} className={styles.empty}>No hay productos</td>
                        </tr>
                    )}
                </tbody>
            </table>            </div>

            <ProductoFormModal
                isOpen={showProductoModal}
                productId={editProductoId}
                onClose={closeProductoModal}
                onSuccess={onProductoSuccess}
            />

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                message="¿Eliminar este producto?"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />

            <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} title="Vista previa">
                {previewImage && <img src={previewImage} alt="Vista previa" className={styles.previewImg} />}
            </Modal>
        </div>
    );
}

export default Productos;
