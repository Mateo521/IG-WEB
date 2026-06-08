import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import ProductoFormModal from '../components/ProductoFormModal/ProductoFormModal';
import styles from './Productos.module.css';

function Productos() {
    const [productos,        setProductos]        = useState([]);
    const [importando,       setImportando]        = useState(false);  // true mientras se procesa la subida
    const [exportando,       setExportando]        = useState(false);  // true mientras descarga el CSV
    const [resultadoImport,  setResultadoImport]   = useState(null);   // objeto con { ok, mensaje, creados, errores[] }

    // Referencia al input de archivo oculto — lo activamos desde el botón "Importar"
    const refInputArchivo = useRef(null);
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });
    const [showProductoModal, setShowProductoModal] = useState(false);
    const [editProductoId, setEditProductoId] = useState(null);

    useEffect(() => { fetchProductos(); }, []);

    // Pedimos todos los productos sin paginar (admin no necesita paginación)
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

    /*
     * handleImportar — recibe el archivo CSV elegido por el usuario y lo
     * manda al servidor con POST /api/productos/importar.
     *
     * El servidor procesa fila por fila y devuelve cuántos se crearon
     * y qué errores hubo. Mostramos ese resultado en pantalla.
     */
    const handleImportar = async (e) => {
        const archivo = e.target.files[0];
        if (!archivo) return;

        setImportando(true);
        setResultadoImport(null);

        // El endpoint espera multipart/form-data con el campo "archivo"
        const formData = new FormData();
        formData.append('archivo', archivo);

        try {
            const r = await api.post('/productos/importar', formData);
            setResultadoImport({ ok: true, ...r.data });
            fetchProductos(); // recargamos la tabla para ver los nuevos productos
        } catch (error) {
            const mensaje = error.response?.data?.message || 'Error al procesar el archivo CSV';
            setResultadoImport({ ok: false, mensaje });
        } finally {
            setImportando(false);
            // Limpiamos el input para poder volver a subir el mismo archivo si es necesario
            e.target.value = '';
        }
    };

    /*
     * handleExportar — descarga los productos actuales como CSV.
     *
     * Usamos Axios con responseType 'blob' (porque necesitamos enviar el
     * Bearer token en el header). Luego creamos un enlace temporal y
     * lo "hacemos clic" para disparar la descarga del navegador.
     */
    const handleExportar = async () => {
        setExportando(true);
        try {
            const respuesta = await api.get('/productos/exportar', { responseType: 'blob' });

            // Creamos una URL temporal que apunta al blob del archivo
            const urlBlob  = URL.createObjectURL(new Blob([respuesta.data], { type: 'text/csv' }));
            const fechaHoy = new Date().toISOString().split('T')[0]; // "2026-06-07"

            // Creamos un <a> invisible, lo "hacemos clic" y lo eliminamos
            const enlace      = document.createElement('a');
            enlace.href       = urlBlob;
            enlace.download   = `productos-${fechaHoy}.csv`;
            document.body.appendChild(enlace);
            enlace.click();
            document.body.removeChild(enlace);

            // Liberamos la URL temporal de memoria
            URL.revokeObjectURL(urlBlob);
        } catch (error) {
            console.error('Error al exportar:', error);
            alert('No se pudo generar el archivo de exportación.');
        } finally {
            setExportando(false);
        }
    };

    /*
     * handleDescargarPlantilla — genera un CSV de ejemplo en el navegador
     * (sin llamar al servidor) para que el usuario sepa qué formato usar.
     */
    const handleDescargarPlantilla = () => {
        // sep=, le dice a Excel qué separador usar (evita la columna única en español)
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

                {/* Grupo de acciones: Nuevo + CSV */}
                <div className={styles.acciones}>
                    {/* Input de archivo oculto — solo se activa desde el botón de abajo */}
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

            {/* Resultado de la última importación */}
            {resultadoImport && (
                <div className={`${styles.resultadoImport} ${resultadoImport.ok ? styles.resultadoOk : styles.resultadoError}`}>
                    <div className={styles.resultadoHeader}>
                        <span>{resultadoImport.mensaje}</span>
                        <button
                            className={styles.btnCerrarResultado}
                            onClick={() => setResultadoImport(null)}
                        >
                            ×
                        </button>
                    </div>

                    {/* Si hubo errores por fila los listamos */}
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
                                    ? <img src={`/storage/${p.rutaImg}`} alt={p.nombreProducto} className={styles.img} />
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
                                    <button onClick={() => openEditModal(p.id)} className={styles.btnEdit}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg></button>
                                    <button onClick={() => handleDelete(p.id)} className={styles.btnDelete}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg></button>
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
        </div>
    );
}

export default Productos;
