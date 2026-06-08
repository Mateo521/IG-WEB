import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../services/api';
import SidebarFiltros from '../components/SidebarFiltros/SidebarFiltros';
import Paginacion from '../components/Paginacion/Paginacion';
import ProductoCardSkeleton from '../components/ProductoCardSkeleton/ProductoCardSkeleton';
import ASCIIText from '../components/ASCIIText/ASCIIText';
import styles from './Catalogo.module.css';

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
    const [filtros, setFiltros]   = useState(FILTROS_VACIOS);
    const [pagina,  setPagina]    = useState(1);
    const [productos,  setProductos]  = useState([]);
    const [meta,       setMeta]       = useState({ current_page: 1, last_page: 1, total: 0 });
    const [cargando,   setCargando]   = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);
    const [vista, setVista] = useState(
        () => localStorage.getItem('catalogo_vista') || 'grilla'
    );
    const [catalogoVisible, setCatalogoVisible] = useState(false);

    const heroRef = useRef(null);
    const contenidoRef = useRef(null);

    const handleCambioVista = (nuevaVista) => {
        setVista(nuevaVista);
        localStorage.setItem('catalogo_vista', nuevaVista);
    };

    const [rubros,     setRubros]     = useState([]);
    const [subrubros,  setSubrubros]  = useState([]);
    const [categorias, setCategorias] = useState([]);

    const timerDebounce = useRef(null);
    const tiempoCargaRef = useRef(null);

    useEffect(() => {
        api.get('/rubros').then(r    => setRubros(r.data));
        api.get('/subrubros').then(r => setSubrubros(r.data));
        api.get('/categorias').then(r => setCategorias(r.data));
    }, []);

    const fetchProductos = useCallback(async (f, p) => {
        setCargando(true);
        if (!tiempoCargaRef.current) tiempoCargaRef.current = Date.now();
        try {
            const params = { page: p, por_pagina: 18 };
            if (f.search)       params.search       = f.search;
            if (f.rubro_id)     params.rubro_id     = f.rubro_id;
            if (f.subrubro_id)  params.subrubro_id  = f.subrubro_id;
            if (f.categoria_id) params.categoria_id = f.categoria_id;
            if (f.precio_min)   params.precio_min   = f.precio_min;
            if (f.precio_max)   params.precio_max   = f.precio_max;
            if (f.sort !== 'reciente') params.sort  = f.sort;

            const respuesta = await api.get('/productos', { params });
            setProductos(respuesta.data.data);
            setMeta({
                current_page: respuesta.data.current_page,
                last_page:    respuesta.data.last_page,
                total:        respuesta.data.total,
            });
        } catch (error) {
            console.error('Error al cargar productos:', error);
        } finally {
            const elapsed = Date.now() - tiempoCargaRef.current;
            const restante = Math.max(0, 500 - elapsed);
            tiempoCargaRef.current = null;
            setTimeout(() => setCargando(false), restante);
        }
    }, []);

    useEffect(() => {
        clearTimeout(timerDebounce.current);
        timerDebounce.current = setTimeout(() => {
            fetchProductos(filtros, pagina);
        }, 350);
        return () => clearTimeout(timerDebounce.current);
    }, [filtros, pagina, fetchProductos]);

    const handleCambioFiltro = (campo, valor) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
        setPagina(1);
    };

    const handleLimpiarFiltros = () => {
        setFiltros(FILTROS_VACIOS);
        setPagina(1);
    };

    const handleCambioPagina = (nuevaPagina) => {
        setPagina(nuevaPagina);
        setCargando(true);
        tiempoCargaRef.current = Date.now();
        if (contenidoRef.current) contenidoRef.current.scrollTop = 0;
    };

    const handleDescargarPdf = async () => {
        setGenerandoPdf(true);
        try {
            const params = { paginate: 'false' };
            if (filtros.search)       params.search       = filtros.search;
            if (filtros.rubro_id)     params.rubro_id     = filtros.rubro_id;
            if (filtros.subrubro_id)  params.subrubro_id  = filtros.subrubro_id;
            if (filtros.categoria_id) params.categoria_id = filtros.categoria_id;
            if (filtros.precio_min)   params.precio_min   = filtros.precio_min;
            if (filtros.precio_max)   params.precio_max   = filtros.precio_max;
            if (filtros.sort !== 'reciente') params.sort  = filtros.sort;

            const respuesta = await api.get('/productos', { params });
            const todos     = respuesta.data;
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const anchoPagina = doc.internal.pageSize.getWidth();
            const fechaHoy    = new Date().toLocaleDateString('es-AR', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(20);
            doc.setTextColor(250, 250, 250);
            doc.text('VITRIO', 14, 18);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(161, 161, 170);
            doc.text('Catálogo de Productos', 14, 25);

            doc.setFontSize(9);
            doc.setTextColor(82, 82, 91);
            doc.text(fechaHoy, anchoPagina - 14, 18, { align: 'right' });

            doc.setDrawColor(250, 250, 250);
            doc.setLineWidth(0.5);
            doc.line(14, 29, anchoPagina - 14, 29);

            let posY = 36;
            const filtrosTexto = [];
            if (filtros.search)      filtrosTexto.push(`Búsqueda: "${filtros.search}"`);
            if (filtros.rubro_id)    filtrosTexto.push(`Rubro: ${rubros.find(r => String(r.id) === String(filtros.rubro_id))?.nombreRubro}`);
            if (filtros.subrubro_id) filtrosTexto.push(`Subrubro: ${subrubros.find(s => String(s.id) === String(filtros.subrubro_id))?.nombreSubrubro}`);
            if (filtros.precio_min)  filtrosTexto.push(`Desde $${filtros.precio_min}`);
            if (filtros.precio_max)  filtrosTexto.push(`Hasta $${filtros.precio_max}`);

            if (filtrosTexto.length > 0) {
                doc.setFontSize(8);
                doc.setTextColor(161, 161, 170);
                doc.text('Filtros aplicados: ' + filtrosTexto.join('  ·  '), 14, posY);
                posY += 6;
            }

            autoTable(doc, {
                startY: posY,
                head: [['Producto', 'Descripción', 'Precio']],
                body: todos.map(p => [
                    p.nombreProducto,
                    p.descripcion,
                    `$${Number(p.precio).toFixed(2)}`,
                ]),
                columnStyles: {
                    0: { cellWidth: 50 },
                    1: { cellWidth: 'auto' },
                    2: { cellWidth: 28, halign: 'right' },
                },
                headStyles: {
                    fillColor:  [250, 250, 250],
                    textColor:  [0, 0, 0],
                    fontStyle:  'bold',
                    fontSize:   9,
                },
                bodyStyles: {
                    fontSize:   8,
                    textColor:  [250, 250, 250],
                    lineColor:  [39, 39, 42],
                    lineWidth:  0.1,
                },
                alternateRowStyles: {
                    fillColor: [24, 24, 27],
                },
                margin: { left: 14, right: 14 },
                didDrawPage: (data) => {
                    const totalPaginas = doc.internal.getNumberOfPages();
                    const paginaActual = doc.internal.getCurrentPageInfo().pageNumber;
                    doc.setFontSize(8);
                    doc.setTextColor(82, 82, 91);
                    doc.text(
                        `Pág. ${paginaActual} de ${totalPaginas}`,
                        anchoPagina - 14,
                        doc.internal.pageSize.getHeight() - 8,
                        { align: 'right' }
                    );
                    if (paginaActual === totalPaginas) {
                        doc.text(
                            `Total: ${todos.length} producto${todos.length !== 1 ? 's' : ''}`,
                            14,
                            doc.internal.pageSize.getHeight() - 8
                        );
                    }
                },
            });

            const fechaArchivo = new Date().toISOString().split('T')[0];
            doc.save(`catalogo-vitrio-${fechaArchivo}.pdf`);
        } catch (error) {
            console.error('Error al generar el PDF:', error);
            alert('No se pudo generar el catálogo PDF.');
        } finally {
            setGenerandoPdf(false);
        }
    };

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

    const scrollToContent = () => {
        setCatalogoVisible(true);
    };

    return (
        <div className={styles.page}>
            <Link to="/login" className={styles.loginBtn}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Iniciar Sesión
            </Link>

            <section ref={heroRef} className={styles.hero}>
                <div className={styles.heroBg}>
                    <ASCIIText
                        text="VITRIO"
                        paused={catalogoVisible}
                        enableWaves={false}
                        asciiFontSize={8}
                        textFontSize={200}
                        textColor="#ffffff"
                        planeBaseHeight={8}
                    />
                </div>

                <button
                    className={styles.scrollBtn}
                    onClick={scrollToContent}
                    aria-label="Ver catálogo"
                >
                    VER CATÁLOGO
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </button>
            </section>

            <div className={`${styles.contentSection} ${catalogoVisible ? styles.contentSectionVisible : ''}`}>
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
                    <div className={styles.controles}>
                        <div className={styles.toggleVista}>
                            <button
                                className={`${styles.btnVista} ${vista === 'grilla' ? styles.btnVistaActivo : ''}`}
                                onClick={() => handleCambioVista('grilla')}
                                title="Vista en grilla"
                                aria-pressed={vista === 'grilla'}
                            >
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
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <rect x="0" y="1"  width="16" height="3" rx="1"/>
                                    <rect x="0" y="6.5" width="16" height="3" rx="1"/>
                                    <rect x="0" y="12" width="16" height="3" rx="1"/>
                                </svg>
                            </button>
                        </div>
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

                <div className={styles.layout}>
                    <div className={styles.sidebarSticky}>
                        <SidebarFiltros
                            rubros={rubros}
                            subrubros={subrubros}
                            categorias={categorias}
                            filtros={filtros}
                            onChange={handleCambioFiltro}
                            onLimpiar={handleLimpiarFiltros}
                        />
                    </div>

                    <div ref={contenidoRef} className={styles.contenido}>
                        <div className={styles.gridWrapper}>
                            <div className={`${styles.grid} ${vista === 'lista' ? styles.gridLista : ''}`}>
                                {productos.map((p) => (
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

                                {!cargando && productos.length === 0 && (
                                    <p className={styles.empty}>
                                        No se encontraron productos con los filtros aplicados.
                                    </p>
                                )}
                            </div>

                            {cargando && (
                                <div className={`${styles.gridSkeleton} ${vista === 'lista' ? styles.gridListaSkeleton : ''}`}>
                                    <ProductoCardSkeleton cantidad={12} />
                                </div>
                            )}
                        </div>

                        <Paginacion
                            paginaActual={meta.current_page}
                            totalPaginas={meta.last_page}
                            onCambio={handleCambioPagina}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Catalogo;
