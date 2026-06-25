import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import Modal from '../Modal/Modal';
import styles from './ProductoDetalleModal.module.css';

function ProductoDetalleModal({ productoId, isOpen, onClose }) {
    const [producto, setProducto] = useState(null);
    const [cargando, setCargando] = useState(true);

    const [nombreConsulta, setNombreConsulta] = useState('');
    const [email, setEmail] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [exito, setExito] = useState('');
    const [errorForm, setErrorForm] = useState('');
    const [formVisible, setFormVisible] = useState(false);
    const formRef = useRef(null);

    useEffect(() => {
        if (formVisible && formRef.current) {
            const el = formRef.current;
            setTimeout(() => {
                requestAnimationFrame(() => {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            }, 380);
        }
    }, [formVisible]);

    useEffect(() => {
        setFormVisible(false);
    }, [productoId, isOpen]);

    useEffect(() => {
        if (!isOpen || !productoId) return;
        const fetchProducto = async () => {
            setCargando(true);
            setProducto(null);
            setExito('');
            setErrorForm('');
            try {
                const res = await api.get(`/productos/${productoId}`);
                setProducto(res.data);
            } catch (err) {
                console.error('Error al cargar producto:', err);
            } finally {
                setCargando(false);
            }
        };
        fetchProducto();
    }, [productoId, isOpen]);

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
                producto_id: productoId,
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

    const renderContent = () => {
        if (cargando) {
            return (
                <div className={styles.skeleton}>
                    <div className={styles.skelImg} />
                    <div className={styles.skelBody}>
                        <div className={styles.skelLine} style={{ width: '60%' }} />
                        <div className={styles.skelLine} style={{ width: '90%' }} />
                        <div className={styles.skelLine} style={{ width: '40%' }} />
                    </div>
                </div>
            );
        }

        if (!producto) {
            return (
                <p className={styles.notFound}>Producto no encontrado.</p>
            );
        }

        return (
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

                    <button
                        className={styles.btnConsultar}
                        onClick={() => setFormVisible(prev => !prev)}
                        aria-expanded={formVisible}
                    >
                        <span>{formVisible ? 'OCULTAR FORMULARIO' : 'CONSULTAR'}</span>
                        <svg
                            className={`${styles.chevron} ${formVisible ? styles.chevronOpen : ''}`}
                            width="16" height="16" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2.5"
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>

                    <div className={`${styles.formCollapse} ${formVisible ? styles.formOpen : ''}`}>
                        <div className={styles.formInner} ref={formRef}>
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
                                    rows={4}
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
            </div>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={producto?.nombreProducto || 'Cargando...'}
            className={styles.modalWide}
        >
            {renderContent()}
        </Modal>
    );
}

export default ProductoDetalleModal;
