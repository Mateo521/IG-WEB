import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

import styles from './Login.module.css';

function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/login', form);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.formPanel}>
                    <h1 className={styles.title}>Iniciar Sesión</h1>
                    <p className={styles.subtitle}>Accedé al panel de administración</p>
                    {error && <p className={styles.error}>{error}</p>}
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <label className={styles.label}>
                            Email
                            <input type="email" name="email" value={form.email} onChange={handleChange} className={styles.input} placeholder="tu@email.com" required />
                        </label>
                        <label className={styles.label}>
                            Contraseña
                            <div className={styles.passwordWrapper}>
                                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} className={styles.input} placeholder="••••••••" required />
                                <button type="button" className={styles.toggle} onClick={() => setShowPassword((p) => !p)} aria-label={showPassword ? 'Ocultar' : 'Mostrar'}>{showPassword ? 'Ocultar' : 'Mostrar'}</button>
                            </div>
                        </label>
                        <button type="submit" className={styles.btn} disabled={loading}>
                            {loading ? <span className={styles.spinner} /> : 'Entrar'}
                        </button>
                    </form>
                    <p className={styles.footer}>¿No tenés cuenta? <Link to="/register">Registrate</Link></p>
                    <Link to="/" className={styles.back}>← Volver al Catálogo</Link>
                </div>
                <div className={styles.divider} />
                <div className={styles.iconPanel} />
            </div>
        </div>
    );
}

export default Login;
