import { useState, useEffect } from 'react';
import styles from './SidebarFiltros.module.css';

/*
 * SidebarFiltros — panel lateral izquierdo con todos los controles de filtrado.
 *
 * Props que recibe:
 *   rubros, subrubros, categorias → datos para armar los selects
 *   filtros     → objeto con el estado actual de cada filtro
 *   onChange    → función para actualizar un filtro individual (campo, valor)
 *   onLimpiar   → función para resetear todos los filtros de una vez
 *
 * Los selects están en cascada: elegir un rubro limpia el subrubro,
 * elegir un subrubro limpia la categoría.
 */
function SidebarFiltros({ rubros, subrubros, categorias, filtros, onChange, onLimpiar }) {
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        const check = () => setIsOpen(window.innerWidth >= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Solo mostramos los subrubros que pertenecen al rubro seleccionado
    const subrubrosFiltrados = filtros.rubro_id
        ? subrubros.filter(s => String(s.rubro_id) === String(filtros.rubro_id))
        : subrubros;

    // Solo mostramos las categorías vinculadas al subrubro seleccionado (M:N)
    const categoriasFiltradas = filtros.subrubro_id
        ? categorias.filter(c =>
            c.subrubros?.some(s => String(s.id) === String(filtros.subrubro_id))
          )
        : categorias;

    // Al cambiar el rubro reseteamos también subrubro y categoría
    // para que no queden selecciones inválidas
    const handleCambioRubro = (e) => {
        onChange('rubro_id',    e.target.value);
        onChange('subrubro_id', '');
        onChange('categoria_id', '');
    };

    // Al cambiar el subrubro reseteamos la categoría
    const handleCambioSubrubro = (e) => {
        onChange('subrubro_id',  e.target.value);
        onChange('categoria_id', '');
    };

    const filtrosActivos = Object.entries(filtros).filter(
        ([k, v]) => v !== '' && k !== 'sort'
    ).length;

    return (
        <aside className={styles.sidebar}>
            <div className={styles.encabezado}>
                <span className={styles.titulo}>Filtros{filtrosActivos > 0 ? ` (${filtrosActivos})` : ''}</span>
                <button
                    className={styles.toggleMovil}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-label="Mostrar u ocultar filtros"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
                <button className={styles.btnLimpiar} onClick={onLimpiar}>
                    Limpiar todo
                </button>
            </div>

            <div className={`${styles.contenidoFiltros} ${isOpen ? styles.abierto : styles.cerrado}`}>

            {/* Búsqueda por texto libre */}
            <div className={styles.grupo}>
                <label className={styles.label}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                    Buscar
                </label>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Nombre o descripción..."
                    value={filtros.search}
                    onChange={e => onChange('search', e.target.value)}
                />
            </div>

            {/* Select de Rubro */}
            <div className={styles.grupo}>
                <label className={styles.label}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>
                    Rubro
                </label>
                <select
                    className={styles.select}
                    value={filtros.rubro_id}
                    onChange={handleCambioRubro}
                >
                    <option value="">Todos los rubros</option>
                    {rubros.map(r => (
                        <option key={r.id} value={r.id}>{r.nombreRubro}</option>
                    ))}
                </select>
            </div>

            {/* Select de Subrubro */}
            <div className={`${styles.grupo} ${filtros.rubro_id ? styles.grupoOpen : styles.grupoClosed}`}>
                <label className={styles.label}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" /></svg>
                    Subrubro
                </label>
                <select
                    className={styles.select}
                    value={filtros.subrubro_id}
                    onChange={handleCambioSubrubro}
                >
                    <option value="">Todos los subrubros</option>
                    {subrubrosFiltrados.map(s => (
                        <option key={s.id} value={s.id}>{s.nombreSubrubro}</option>
                    ))}
                </select>
            </div>

            {/* Select de Categoría */}
            <div className={`${styles.grupo} ${filtros.subrubro_id ? styles.grupoOpen : styles.grupoClosed}`}>
                <label className={styles.label}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" /></svg>
                    Categoría
                </label>
                <select
                    className={styles.select}
                    value={filtros.categoria_id}
                    onChange={e => onChange('categoria_id', e.target.value)}
                >
                    <option value="">Todas las categorías</option>
                    {categoriasFiltradas.map(c => (
                        <option key={c.id} value={c.id}>{c.nombreCategoria}</option>
                    ))}
                </select>
            </div>

            {/* Rango de precio: dos inputs numéricos lado a lado */}
            <div className={styles.grupo}>
                <label className={styles.label}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    Precio
                </label>
                <div className={styles.filaPrecio}>
                    <input
                        type="number"
                        className={styles.inputPrecio}
                        placeholder="Mín"
                        min="0"
                        value={filtros.precio_min}
                        onChange={e => onChange('precio_min', e.target.value)}
                    />
                    <span className={styles.separadorPrecio}>—</span>
                    <input
                        type="number"
                        className={styles.inputPrecio}
                        placeholder="Máx"
                        min="0"
                        value={filtros.precio_max}
                        onChange={e => onChange('precio_max', e.target.value)}
                    />
                </div>
            </div>

            {/* Ordenamiento */}
            <div className={styles.grupo}>
                <label className={styles.label}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.242 5.992h12m-12 6.003H20.24m-12 5.999h12M4.117 7.495v-3.75H2.99m1.125 3.75H2.99m1.125 0H5.24m-1.92 2.577a1.125 1.125 0 1 1 1.591 1.59l-1.83 1.83h2.16M2.99 15.745h1.125a1.125 1.125 0 0 1 0 2.25H3.74m0-.002h.375a1.125 1.125 0 0 1 0 2.25H2.99" /></svg>
                    Ordenar por
                </label>
                <select
                    className={styles.select}
                    value={filtros.sort}
                    onChange={e => onChange('sort', e.target.value)}
                >
                    <option value="reciente">Más recientes</option>
                    <option value="precio_asc">Precio: menor a mayor</option>
                    <option value="precio_desc">Precio: mayor a menor</option>
                    <option value="nombre_asc">Nombre A → Z</option>
                </select>
            </div>
            </div>
        </aside>
    );
}

export default SidebarFiltros;
