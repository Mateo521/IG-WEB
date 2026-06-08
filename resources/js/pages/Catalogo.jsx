import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../services/api';
import SidebarFiltros from '../components/SidebarFiltros/SidebarFiltros';
import Paginacion from '../components/Paginacion/Paginacion';
import ProductoCardSkeleton from '../components/ProductoCardSkeleton/ProductoCardSkeleton';
import { FloatingCubes } from '../remotion/FloatingCubes';
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

function useTyping(text, speed = 80, startDelay = 400) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);

    useEffect(() => {
        setDisplayed('');
        setDone(false);
        let i = 0;
        const timeout = setTimeout(() => {
            const interval = setInterval(() => {
                i++;
                setDisplayed(text.slice(0, i));
                if (i >= text.length) {
                    clearInterval(interval);
                    setDone(true);
                }
            }, speed);
            return () => clearInterval(interval);
        }, startDelay);
        return () => clearTimeout(timeout);
    }, [text, speed, startDelay]);

    return [displayed, done];
}

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

    const heroRef = useRef(null);
    const floatingRef = useRef(null);
    const heroContentRef = useRef(null);
    const contenidoRef = useRef(null);

    useEffect(() => {
        const el = floatingRef.current;
        if (!el) return;
        const onScroll = () => {
            const rect = el.getBoundingClientRect();
            const viewportMid = window.innerHeight / 2;
            const elMid = rect.top + rect.height / 2;
            const offset = (elMid - viewportMid) * 0.08;
            el.style.transform = `translateY(${offset}px)`;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const hero = heroRef.current;
        const content = heroContentRef.current;
        if (!hero || !content) return;
        const onScroll = () => {
            const heroRect = hero.getBoundingClientRect();
            const progress = Math.max(0, Math.min(1, -heroRect.top / heroRect.height));
            const translateY = progress * 80;
            content.style.transform = `translateY(${-translateY}px)`;
            content.style.opacity = Math.max(0.7, 1 - progress * 0.3);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const [typedText, typingDone] = useTyping('POLI-RUBROS', 100, 500);

    const handleCambioVista = (nuevaVista) => {
        setVista(nuevaVista);
        localStorage.setItem('catalogo_vista', nuevaVista);
    };

    const [rubros,     setRubros]     = useState([]);
    const [subrubros,  setSubrubros]  = useState([]);
    const [categorias, setCategorias] = useState([]);

    const timerDebounce = useRef(null);

    useEffect(() => {
        api.get('/rubros').then(r    => setRubros(r.data));
        api.get('/subrubros').then(r => setSubrubros(r.data));
        api.get('/categorias').then(r => setCategorias(r.data));
    }, []);

    const fetchProductos = useCallback(async (f, p) => {
        setCargando(true);
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
            setCargando(false);
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
        const el = document.getElementById('catalogo-content');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
                if (contenidoRef.current) contenidoRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }, 120);
        }
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
            doc.setTextColor(234, 88, 12);
            doc.text('POLI-RUBROS', 14, 18);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(100, 116, 139);
            doc.text('Catálogo de Productos', 14, 25);

            doc.setFontSize(9);
            doc.text(fechaHoy, anchoPagina - 14, 18, { align: 'right' });

            doc.setDrawColor(234, 88, 12);
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
                doc.setTextColor(148, 163, 184);
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
                    fillColor:  [234, 88, 12],
                    textColor:  [255, 255, 255],
                    fontStyle:  'bold',
                    fontSize:   9,
                },
                bodyStyles: {
                    fontSize:   8,
                    textColor:  [15, 23, 42],
                    lineColor:  [226, 232, 240],
                    lineWidth:  0.1,
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 252],
                },
                margin: { left: 14, right: 14 },
                didDrawPage: (data) => {
                    const totalPaginas = doc.internal.getNumberOfPages();
                    const paginaActual = doc.internal.getCurrentPageInfo().pageNumber;
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
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
            doc.save(`catalogo-poli-rubros-${fechaArchivo}.pdf`);
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
        const el = document.getElementById('catalogo-content');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className={styles.page}>
            <section ref={heroRef} className={styles.hero}>
                <div className={styles.heroBg}>
                    <div className={styles.heroOrb1} />
                    <div className={styles.heroOrb2} />
                    <div className={styles.floatingVideoWrapper}>
                        <div ref={floatingRef} className={styles.floatingVideoInner}>
                            <FloatingCubes />
                        </div>
                    </div>
                </div>

                <Link to="/login" className={styles.loginBtn}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                        <polyline points="10 17 15 12 10 7"/>
                        <line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                    Iniciar Sesión
                </Link>

                <div ref={heroContentRef} className={styles.heroContent}>
                    <p className={styles.heroLabel}>Catálogo</p>
                    <h1 className={styles.heroTitle}>
                        <span className={styles.heroTyping}>
                            {typedText}
                            <span className={`${styles.cursor} ${typingDone ? styles.cursorDone : ''}`} />
                        </span>
                    </h1>
                    <p className={styles.heroSub}>
                        Marroquinería, vitrofusión, textil, carpintería y mucho más.
                    </p>
                </div>

                <button
                    className={styles.scrollIndicator}
                    onClick={scrollToContent}
                    aria-label="Desplazarse al contenido"
                >
                    <svg className={styles.scrollArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                    <svg className={styles.scrollArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                    <svg className={styles.scrollArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </button>
            </section>

            <div className={styles.contentSection} id="catalogo-content">
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
                        <div className={`${styles.grid} ${vista === 'lista' ? styles.gridLista : ''}`}>
                            {cargando && <ProductoCardSkeleton cantidad={12} />}

                            {!cargando && productos.map((p) => (
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
