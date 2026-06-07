import styles from './Paginacion.module.css';

/*
 * Paginacion — barra de navegación entre páginas de resultados.
 *
 * Props:
 *   paginaActual  → número de la página que se muestra ahora
 *   totalPaginas  → cuántas páginas hay en total
 *   onCambio      → función que recibe el número de la página nueva
 *
 * Genera un rango inteligente de botones:
 *   siempre muestra la primera y la última página,
 *   y las 2 páginas vecinas de la actual.
 *   Si hay un salto entre números se pone "…"
 */
function Paginacion({ paginaActual, totalPaginas, onCambio }) {

    // Si solo hay una página no tiene sentido mostrar la barra
    if (totalPaginas <= 1) return null;

    // Armamos el arreglo de números de página que vamos a mostrar
    const paginas = [];
    for (let i = 1; i <= totalPaginas; i++) {
        // Incluimos: primera, última, y vecinas de la página actual (rango ±2)
        if (
            i === 1 ||
            i === totalPaginas ||
            (i >= paginaActual - 2 && i <= paginaActual + 2)
        ) {
            paginas.push(i);
        }
    }

    // Insertamos el separador "…" entre números no consecutivos
    const paginasConSaltos = [];
    for (let i = 0; i < paginas.length; i++) {
        if (i > 0 && paginas[i] - paginas[i - 1] > 1) {
            paginasConSaltos.push('...');
        }
        paginasConSaltos.push(paginas[i]);
    }

    return (
        <nav className={styles.nav} aria-label="Paginación de resultados">

            {/* Botón "Anterior" */}
            <button
                className={styles.btn}
                onClick={() => onCambio(paginaActual - 1)}
                disabled={paginaActual === 1}
                aria-label="Página anterior"
            >
                ‹
            </button>

            {/* Botones numerados (con posibles separadores "…") */}
            {paginasConSaltos.map((p, i) =>
                p === '...' ? (
                    <span key={`sep-${i}`} className={styles.sep}>…</span>
                ) : (
                    <button
                        key={p}
                        className={`${styles.btn} ${p === paginaActual ? styles.activo : ''}`}
                        onClick={() => onCambio(p)}
                        aria-current={p === paginaActual ? 'page' : undefined}
                    >
                        {p}
                    </button>
                )
            )}

            {/* Botón "Siguiente" */}
            <button
                className={styles.btn}
                onClick={() => onCambio(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                aria-label="Página siguiente"
            >
                ›
            </button>

        </nav>
    );
}

export default Paginacion;
