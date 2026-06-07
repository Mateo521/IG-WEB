import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import FloatingIcons from '../components/FloatingIcons/FloatingIcons';
import styles from './Productos.module.css';

const SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg>';

function Productos() {
    const [productos,        setProductos]        = useState([]);
    const [importando,       setImportando]        = useState(false);  // true mientras se procesa la subida
    const [exportando,       setExportando]        = useState(false);  // true mientras descarga el CSV
    const [resultadoImport,  setResultadoImport]   = useState(null);   // objeto con { ok, mensaje, creados, errores[] }

    // Referencia al input de archivo oculto — lo activamos desde el botón "Importar"
    const refInputArchivo = useRef(null);

    useEffect(() => { fetchProductos(); }, []);

    // Pedimos todos los productos sin paginar (admin no necesita paginación)
    const fetchProductos = async () => {
        setProductos((await api.get('/productos', { params: { paginate: 'false' } })).data);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este producto?')) return;
        await api.delete(`/productos/${id}`);
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
            <FloatingIcons svg={SVG} />
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

                    <Link to="/admin/productos/nuevo" className={styles.btnNuevo}>
                        + Nuevo Producto
                    </Link>
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

            <table className={styles.table}>
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
                                    <Link to={`/admin/productos/${p.id}/editar`} className={styles.btnEdit}>
                                        Editar
                                    </Link>
                                    <button onClick={() => handleDelete(p.id)} className={styles.btnDelete}>
                                        Eliminar
                                    </button>
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
            </table>
        </div>
    );
}

export default Productos;
