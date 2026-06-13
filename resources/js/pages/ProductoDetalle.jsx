import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import styles from './ProductoDetalle.module.css';

function ProductoDetalle() {
    const { id } = useParams();
    const [producto, setProducto] = useState(null);
    const [cargando, setCargando] = useState(true);

    // Estado del formulario de consulta sobre este producto
    const [nombreConsulta, setNombreConsulta] = useState('');
    const [email, setEmail] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [exito, setExito] = useState('');
    const [errorForm, setErrorForm] = useState('');

    useEffect(() => {
        const fetchProducto = async () => {
            setCargando(true);
            try {
                const res = await api.get(`/productos/${id}`);
                setProducto(res.data);
            } catch (err) {
                console.error('Error al cargar producto:', err);
            } finally {
                setCargando(false);
            }
        };
        fetchProducto();
    }, [id]);

    // Envia la consulta del cliente al backend asociada a este producto
    const handleSubmitConsulta = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setErrorForm('');
        setExito('');

        try {
            await api.post('/consultas', {
                nombreConsulta,
                email,
                mensaje,
                producto_id: id,
            });
            setExito('Consulta enviada con éxito. Nos pondremos en contacto pronto.');
            setNombreConsulta('');
            setEmail('');
            setMensaje('');
        } catch (err) {
            setErrorForm(
                err.response?.data?.message
                || 'Error al enviar la consulta. Verificá los datos e intentá de nuevo.'
            );
        } finally {
            setEnviando(false);
        }
    };

    if (cargando) {
        return (
            <div className={styles.page}>
                <div className={styles.skeleton}>
                    <div className={styles.skelImg} />
                    <div className={styles.skelBody}>
                        <div className={styles.skelLine} style={{ width: '60%' }} />
                        <div className={styles.skelLine} style={{ width: '90%' }} />
                        <div className={styles.skelLine} style={{ width: '40%' }} />
                    </div>
                </div>
            </div>
        );
    }

    if (!producto) {
        return (
            <div className={styles.page}>
                <p className={styles.notFound}>Producto no encontrado.</p>
                <Link to="/" className={styles.volver}>Volver al catálogo</Link>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <Link to="/" className={styles.volver}>&larr; Volver al catálogo</Link>

            <div className={styles.layout}>
                <div className={styles.imgCol}>
                    {producto.rutaImg ? (
                        <img
                            src={`/storage/${producto.rutaImg}`}
                            alt={producto.nombreProducto}
                            className={styles.img}
                        />
                    ) : (
                        <div className={styles.noImg}>Sin imagen</div>
                    )}
                </div>

                <div className={styles.infoCol}>
                    <h1 className={styles.nombre}>{producto.nombreProducto}</h1>

                    <p className={styles.precio}>${Number(producto.precio).toFixed(2)}</p>

                    <div className={styles.meta}>
                        {producto.rubro && (
                            <span className={styles.metaItem}>
                                <strong>Rubro:</strong> {producto.rubro.nombreRubro}
                            </span>
                        )}
                        {producto.subrubro && (
                            <span className={styles.metaItem}>
                                <strong>Subrubro:</strong> {producto.subrubro.nombreSubrubro}
                            </span>
                        )}
                        {producto.categorias?.length > 0 && (
                            <span className={styles.metaItem}>
                                <strong>Categorías:</strong>{' '}
                                {producto.categorias.map(c => c.nombreCategoria).join(', ')}
                            </span>
                        )}
                    </div>

                    <p className={styles.desc}>{producto.descripcion}</p>

                    <hr className={styles.divisor} />

                    <h2 className={styles.formTitle}>Consultar sobre este producto</h2>

                    {exito && <div className={styles.exito}>{exito}</div>}
                    {errorForm && <div className={styles.error}>{errorForm}</div>}

                    <form onSubmit={handleSubmitConsulta} className={styles.form}>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="Tu nombre"
                            value={nombreConsulta}
                            onChange={e => setNombreConsulta(e.target.value)}
                            required
                        />
                        <input
                            className={styles.input}
                            type="email"
                            placeholder="Tu email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        <textarea
                            className={styles.textarea}
                            placeholder="Tu mensaje o consulta"
                            rows={5}
                            value={mensaje}
                            onChange={e => setMensaje(e.target.value)}
                            required
                        />
                        <button className={styles.btnEnviar} type="submit" disabled={enviando}>
                            {enviando ? 'Enviando...' : 'Enviar consulta'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProductoDetalle;
