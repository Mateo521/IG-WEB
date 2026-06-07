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

    return (
        <aside className={styles.sidebar}>
            <div className={styles.encabezado}>
                <span className={styles.titulo}>Filtros</span>
                <button className={styles.btnLimpiar} onClick={onLimpiar}>
                    Limpiar todo
                </button>
            </div>

            {/* Búsqueda por texto libre */}
            <div className={styles.grupo}>
                <label className={styles.label}>Buscar</label>
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
                <label className={styles.label}>Rubro</label>
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

            {/* Select de Subrubro — solo visible cuando hay un rubro elegido */}
            {filtros.rubro_id && (
                <div className={styles.grupo}>
                    <label className={styles.label}>Subrubro</label>
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
            )}

            {/* Select de Categoría — solo visible cuando hay un subrubro elegido */}
            {filtros.subrubro_id && (
                <div className={styles.grupo}>
                    <label className={styles.label}>Categoría</label>
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
            )}

            {/* Rango de precio: dos inputs numéricos lado a lado */}
            <div className={styles.grupo}>
                <label className={styles.label}>Precio</label>
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
                <label className={styles.label}>Ordenar por</label>
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
        </aside>
    );
}

export default SidebarFiltros;
