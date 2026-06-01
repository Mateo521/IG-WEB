import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './Login.module.css';

function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/login', form);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        }
    };

    return (
        <div className={styles.wrapper}>
            <form className={styles.card} onSubmit={handleSubmit}>
                <h1 className={styles.title}>Iniciar Sesión</h1>
                {error && <p className={styles.error}>{error}</p>}
                <label className={styles.label}>
                    Email
                    <input type="email" name="email" value={form.email} onChange={handleChange} className={styles.input} required />
                </label>
                <label className={styles.label}>
                    Contraseña
                    <input type="password" name="password" value={form.password} onChange={handleChange} className={styles.input} required />
                </label>
                <button type="submit" className={styles.btn}>Entrar</button>
    <p className={styles.footer}>
                        ¿No tenés cuenta? <Link to="/register">Registrate</Link>
                    </p>
                    <Link to="/" className={styles.backLink}>← Volver al Catálogo</Link>
            </form>
        </div>
    );
}

export default Login;
