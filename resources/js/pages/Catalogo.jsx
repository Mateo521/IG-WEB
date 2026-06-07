import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../services/api';
import SidebarFiltros from '../components/SidebarFiltros/SidebarFiltros';
import Paginacion from '../components/Paginacion/Paginacion';
import ProductoCardSkeleton from '../components/ProductoCardSkeleton/ProductoCardSkeleton';
import styles from './Catalogo.module.css';

/*
 * Estado vacío de filtros. Lo definimos fuera del componente para poder
 * reutilizarlo en el reset y en la comparación de "qué hay activo".
 */
const FILTROS_VACIOS = {
    search:       '',
    rubro_id:     '',
    subrubro_id:  '',
    categoria_id: '',
    precio_min:   '',
    precio_max:   '',
    sort:         'reciente',
};

function Catalogo() {

    // --- Estado de filtros y página actual ---
    const [filtros, setFiltros]   = useState(FILTROS_VACIOS);
    const [pagina,  setPagina]    = useState(1); // página que se está viendo

    // --- Productos que vienen del servidor ---
    const [productos,  setProductos]  = useState([]);
    // meta guarda la info de paginación que devuelve Laravel (current_page, last_page, total)
    const [meta,       setMeta]       = useState({ current_page: 1, last_page: 1, total: 0 });
    const [cargando,   setCargando]   = useState(false);

    // true mientras se genera y descarga el PDF
    const [generandoPdf, setGenerandoPdf] = useState(false);

    // 'grilla' muestra tarjetas en columnas, 'lista' muestra filas horizontales
    // Guardamos la preferencia en localStorage para que se recuerde entre visitas
    const [vista, setVista] = useState(
        () => localStorage.getItem('catalogo_vista') || 'grilla'
    );

    // Cambia entre grilla y lista y guarda la preferencia
    const handleCambioVista = (nuevaVista) => {
        setVista(nuevaVista);
        localStorage.setItem('catalogo_vista', nuevaVista);
    };

    // --- Datos para los dropdowns del sidebar (se cargan una sola vez) ---
    const [rubros,     setRubros]     = useState([]);
    const [subrubros,  setSubrubros]  = useState([]);
    const [categorias, setCategorias] = useState([]);

    // Timer para el debounce del campo de búsqueda por texto
    // (evitamos pedir al servidor en cada pulsación de tecla)
    const timerDebounce = useRef(null);

    // Al montar el componente cargamos los datos de los dropdowns
    useEffect(() => {
        api.get('/rubros').then(r    => setRubros(r.data));
        api.get('/subrubros').then(r => setSubrubros(r.data));
        api.get('/categorias').then(r => setCategorias(r.data));
    }, []);

    /*
     * Cada vez que cambian los filtros o la página pedimos productos.
     * Usamos un debounce de 350ms para que si el usuario escribe rápido
     * solo se haga UNA petición al servidor (cuando termina de escribir).
     * Para los selects y la paginación el retraso es casi imperceptible.
     */
    useEffect(() => {
        clearTimeout(timerDebounce.current);
        timerDebounce.current = setTimeout(() => {
            fetchProductos(filtros, pagina);
        }, 350);

        // Limpiamos el timer si el efecto se vuelve a disparar antes del delay
        return () => clearTimeout(timerDebounce.current);
    }, [filtros, pagina]);

    /*
     * fetchProductos — arma los parámetros de URL y llama a la API.
     * Solo incluye en los params los filtros que tienen valor
     * para mantener la URL limpia.
     */
    const fetchProductos = async (f, p) => {
        setCargando(true);
        try {
            const params = { page: p, por_pagina: 12 };

            if (f.search)       params.search       = f.search;
            if (f.rubro_id)     params.rubro_id     = f.rubro_id;
            if (f.subrubro_id)  params.subrubro_id  = f.subrubro_id;
            if (f.categoria_id) params.categoria_id = f.categoria_id;
            if (f.precio_min)   params.precio_min   = f.precio_min;
            if (f.precio_max)   params.precio_max   = f.precio_max;
            if (f.sort !== 'reciente') params.sort  = f.sort;

            const respuesta = await api.get('/productos', { params });

            // El servidor devuelve un objeto paginado de Laravel:
            // { data: [...], current_page, last_page, total, per_page, ... }
            setProductos(respuesta.data.data);
            setMeta({
                current_page: respuesta.data.current_page,
                last_page:    respuesta.data.last_page,
                total:        respuesta.data.total,
            });
        } catch (error) {
            console.error('Error al cargar productos:', error);
        } finally {
            setCargando(false);
        }
    };

    // Actualiza un campo del estado de filtros y vuelve a la página 1
    const handleCambioFiltro = (campo, valor) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
        setPagina(1); // cualquier cambio de filtro vuelve al inicio
    };

    // Resetea todos los filtros y vuelve a la primera página
    const handleLimpiarFiltros = () => {
        setFiltros(FILTROS_VACIOS);
        setPagina(1);
    };

    // Cambia de página y hace scroll al inicio del contenido
    const handleCambioPagina = (nuevaPagina) => {
        setPagina(nuevaPagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /*
     * handleDescargarPdf — genera un PDF con TODOS los productos que
     * coinciden con los filtros actuales (no solo la página visible).
     *
     * Pasos:
     *   1. Pide todos los productos con paginate=false (sin límite de página)
     *   2. Arma el documento PDF con jsPDF + autoTable
     *   3. Dispara la descarga en el navegador
     *
     * Columnas del PDF: Producto | Descripción | Precio
     * (sin categorías, como pidió el usuario)
     */
    const handleDescargarPdf = async () => {
        setGenerandoPdf(true);
        try {
            // Pedimos TODOS los productos con los filtros activos, sin paginar
            const params = { paginate: 'false' };
            if (filtros.search)       params.search       = filtros.search;
            if (filtros.rubro_id)     params.rubro_id     = filtros.rubro_id;
            if (filtros.subrubro_id)  params.subrubro_id  = filtros.subrubro_id;
            if (filtros.categoria_id) params.categoria_id = filtros.categoria_id;
            if (filtros.precio_min)   params.precio_min   = filtros.precio_min;
            if (filtros.precio_max)   params.precio_max   = filtros.precio_max;
            if (filtros.sort !== 'reciente') params.sort  = filtros.sort;

            const respuesta = await api.get('/productos', { params });
            const todos     = respuesta.data; // array plano (paginate=false)

            // Creamos el documento en formato A4 vertical
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            const anchoPagina = doc.internal.pageSize.getWidth();
            const fechaHoy    = new Date().toLocaleDateString('es-AR', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });

            // --- Encabezado del PDF ---

            // Nombre del negocio en rojo bordo (el color del sistema)
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(20);
            doc.setTextColor(192, 57, 43); // --primary: #c0392b
            doc.text('POLI-RUBROS', 14, 18);

            // Subtítulo en gris
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(113, 128, 150); // --text-muted
            doc.text('Catálogo de Productos', 14, 25);

            // Fecha alineada a la derecha
            doc.setFontSize(9);
            doc.text(fechaHoy, anchoPagina - 14, 18, { align: 'right' });

            // Línea separadora bajo el encabezado
            doc.setDrawColor(192, 57, 43);
            doc.setLineWidth(0.5);
            doc.line(14, 29, anchoPagina - 14, 29);

            // Resumen de filtros activos (si hay alguno)
            let posY = 36;
            const filtrosTexto = [];
            if (filtros.search)      filtrosTexto.push(`Búsqueda: "${filtros.search}"`);
            if (filtros.rubro_id)    filtrosTexto.push(`Rubro: ${rubros.find(r => String(r.id) === String(filtros.rubro_id))?.nombreRubro}`);
            if (filtros.subrubro_id) filtrosTexto.push(`Subrubro: ${subrubros.find(s => String(s.id) === String(filtros.subrubro_id))?.nombreSubrubro}`);
            if (filtros.precio_min)  filtrosTexto.push(`Desde $${filtros.precio_min}`);
            if (filtros.precio_max)  filtrosTexto.push(`Hasta $${filtros.precio_max}`);

            if (filtrosTexto.length > 0) {
                doc.setFontSize(8);
                doc.setTextColor(160, 174, 192); // --text-faint
                doc.text('Filtros aplicados: ' + filtrosTexto.join('  ·  '), 14, posY);
                posY += 6;
            }

            // --- Tabla de productos ---
            // autoTable genera una tabla con estilos automáticos y paginación de PDF
            autoTable(doc, {
                startY: posY,
                head: [['Producto', 'Descripción', 'Precio']],
                body: todos.map(p => [
                    p.nombreProducto,
                    p.descripcion,
                    `$${Number(p.precio).toFixed(2)}`,
                ]),
                // Anchos de columna: nombre fijo, descripción flexible, precio fijo
                columnStyles: {
                    0: { cellWidth: 50 },
                    1: { cellWidth: 'auto' },
                    2: { cellWidth: 28, halign: 'right' },
                },
                headStyles: {
                    fillColor:  [192, 57, 43],  // rojo bordo del sistema
                    textColor:  [255, 255, 255],
                    fontStyle:  'bold',
                    fontSize:   9,
                },
                bodyStyles: {
                    fontSize:   8,
                    textColor:  [45, 55, 72],   // --text
                    lineColor:  [184, 190, 201],
                    lineWidth:  0.1,
                },
                alternateRowStyles: {
                    fillColor: [245, 247, 250], // fila alternada levemente más clara
                },
                margin: { left: 14, right: 14 },
                // Pie de página con número de página y total de productos
                didDrawPage: (data) => {
                    const totalPaginas = doc.internal.getNumberOfPages();
                    const paginaActual = doc.internal.getCurrentPageInfo().pageNumber;

                    doc.setFontSize(8);
                    doc.setTextColor(160, 174, 192);

                    // Número de página a la derecha
                    doc.text(
                        `Pág. ${paginaActual} de ${totalPaginas}`,
                        anchoPagina - 14,
                        doc.internal.pageSize.getHeight() - 8,
                        { align: 'right' }
                    );

                    // Total de productos a la izquierda (solo en la última página)
                    if (paginaActual === totalPaginas) {
                        doc.text(
                            `Total: ${todos.length} producto${todos.length !== 1 ? 's' : ''}`,
                            14,
                            doc.internal.pageSize.getHeight() - 8
                        );
                    }
                },
            });

            // Nombre del archivo con la fecha de hoy
            const fechaArchivo = new Date().toISOString().split('T')[0];
            doc.save(`catalogo-poli-rubros-${fechaArchivo}.pdf`);

        } catch (error) {
            console.error('Error al generar el PDF:', error);
            alert('No se pudo generar el catálogo PDF.');
        } finally {
            setGenerandoPdf(false);
        }
    };

    /*
     * Chips de filtros activos — los que tienen un valor distinto al vacío.
     * Cada chip muestra el nombre del filtro y un botón para quitarlo.
     */
    const chips = [];
    if (filtros.search)
        chips.push({ key: 'search',       label: `"${filtros.search}"` });
    if (filtros.rubro_id)
        chips.push({ key: 'rubro_id',     label: rubros.find(r => String(r.id) === String(filtros.rubro_id))?.nombreRubro });
    if (filtros.subrubro_id)
        chips.push({ key: 'subrubro_id',  label: subrubros.find(s => String(s.id) === String(filtros.subrubro_id))?.nombreSubrubro });
    if (filtros.categoria_id)
        chips.push({ key: 'categoria_id', label: categorias.find(c => String(c.id) === String(filtros.categoria_id))?.nombreCategoria });
    if (filtros.precio_min)
        chips.push({ key: 'precio_min',   label: `Desde $${filtros.precio_min}` });
    if (filtros.precio_max)
        chips.push({ key: 'precio_max',   label: `Hasta $${filtros.precio_max}` });

    return (
        <div className={styles.page}>

            {/* Encabezado con título, contador y botón de descarga PDF */}
            <div className={styles.topBar}>
                <div>
                    <h1 className={styles.title}>Catálogo de Productos</h1>
                    <p className={styles.sub}>
                        {cargando
                            ? 'Buscando...'
                            : `${meta.total} producto${meta.total !== 1 ? 's' : ''} encontrado${meta.total !== 1 ? 's' : ''}`
                        }
                    </p>
                </div>

                {/* Controles de vista (grilla/lista) + botón PDF */}
                <div className={styles.controles}>
                    {/* Toggle grilla/lista — dos botones que actúan como radio */}
                    <div className={styles.toggleVista}>
                        <button
                            className={`${styles.btnVista} ${vista === 'grilla' ? styles.btnVistaActivo : ''}`}
                            onClick={() => handleCambioVista('grilla')}
                            title="Vista en grilla"
                            aria-pressed={vista === 'grilla'}
                        >
                            {/* Ícono de grilla: 4 cuadraditos */}
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="0" y="0" width="6" height="6" rx="1"/>
                                <rect x="10" y="0" width="6" height="6" rx="1"/>
                                <rect x="0" y="10" width="6" height="6" rx="1"/>
                                <rect x="10" y="10" width="6" height="6" rx="1"/>
                            </svg>
                        </button>
                        <button
                            className={`${styles.btnVista} ${vista === 'lista' ? styles.btnVistaActivo : ''}`}
                            onClick={() => handleCambioVista('lista')}
                            title="Vista en lista"
                            aria-pressed={vista === 'lista'}
                        >
                            {/* Ícono de lista: 3 líneas horizontales */}
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <rect x="0" y="1"  width="16" height="3" rx="1"/>
                                <rect x="0" y="6.5" width="16" height="3" rx="1"/>
                                <rect x="0" y="12" width="16" height="3" rx="1"/>
                            </svg>
                        </button>
                    </div>

                    {/* Botón de descarga de PDF */}
                    <button
                        className={styles.btnPdf}
                        onClick={handleDescargarPdf}
                        disabled={generandoPdf || meta.total === 0}
                        title="Descarga el catálogo completo en PDF"
                    >
                        {generandoPdf ? 'Generando...' : 'Descargar Catálogo PDF'}
                    </button>
                </div>
            </div>

            {/* Chips de filtros activos — solo se muestran si hay alguno */}
            {chips.length > 0 && (
                <div className={styles.chips}>
                    {chips.map(chip => (
                        <span key={chip.key} className={styles.chip}>
                            {chip.label}
                            <button
                                className={styles.chipQuitar}
                                onClick={() => handleCambioFiltro(chip.key, '')}
                                aria-label={`Quitar filtro ${chip.label}`}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                    <button className={styles.chipLimpiarTodo} onClick={handleLimpiarFiltros}>
                        Limpiar todo
                    </button>
                </div>
            )}

            {/* Layout de dos columnas: sidebar a la izquierda, grilla a la derecha */}
            <div className={styles.layout}>

                <SidebarFiltros
                    rubros={rubros}
                    subrubros={subrubros}
                    categorias={categorias}
                    filtros={filtros}
                    onChange={handleCambioFiltro}
                    onLimpiar={handleLimpiarFiltros}
                />

                <div className={styles.contenido}>

                    {/* La clase cambia según la vista elegida: grilla o lista */}
                    <div className={`${styles.grid} ${vista === 'lista' ? styles.gridLista : ''}`}>

                        {/* Mientras carga mostramos los placeholders */}
                        {cargando && <ProductoCardSkeleton cantidad={12} />}

                        {/* Productos cargados */}
                        {!cargando && productos.map(p => (
                            <Link
                                key={p.id}
                                to={`/producto/${p.id}`}
                                className={`${styles.card} ${vista === 'lista' ? styles.cardLista : ''}`}
                            >
                                <div className={styles.imgWrap}>
                                    {p.rutaImg ? (
                                        <img
                                            src={`/storage/${p.rutaImg}`}
                                            alt={p.nombreProducto}
                                            className={styles.img}
                                        />
                                    ) : (
                                        <div className={styles.noImg}>Sin imagen</div>
                                    )}
                                </div>
                                <div className={styles.body}>
                                    <h2 className={styles.nombre}>{p.nombreProducto}</h2>
                                    <p className={styles.desc}>{p.descripcion}</p>
                                    <span className={styles.precio}>
                                        ${Number(p.precio).toFixed(2)}
                                    </span>
                                    <span className={styles.categoria}>
                                        {p.categorias?.map(c => c.nombreCategoria).join(', ')
                                            || p.rubro?.nombreRubro
                                            || ''}
                                    </span>
                                </div>
                            </Link>
                        ))}

                        {/* Sin resultados */}
                        {!cargando && productos.length === 0 && (
                            <p className={styles.empty}>
                                No se encontraron productos con los filtros aplicados.
                            </p>
                        )}

                    </div>

                    {/* Paginación al pie de la grilla */}
                    <Paginacion
                        paginaActual={meta.current_page}
                        totalPaginas={meta.last_page}
                        onCambio={handleCambioPagina}
                    />

                </div>
            </div>
        </div>
    );
}

export default Catalogo;
