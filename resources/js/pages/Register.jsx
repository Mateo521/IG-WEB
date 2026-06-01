import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './Register.module.css';

function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/register', form);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/admin/dashboard');
        } catch (err) {
            const messages = err.response?.data?.errors;
            const first = messages ? Object.values(messages)[0]?.[0] : '';
            setError(first || err.response?.data?.message || 'Error al registrarse');
        }
    };

    return (
        <div className={styles.wrapper}>
            <form className={styles.card} onSubmit={handleSubmit}>
                <h1 className={styles.title}>Registrarse</h1>
                {error && <p className={styles.error}>{error}</p>}
                <label className={styles.label}>
                    Nombre
                    <input type="text" name="name" value={form.name} onChange={handleChange} className={styles.input} required />
                </label>
                <label className={styles.label}>
                    Email
                    <input type="email" name="email" value={form.email} onChange={handleChange} className={styles.input} required />
                </label>
                <label className={styles.label}>
                    Contraseña
                    <input type="password" name="password" value={form.password} onChange={handleChange} className={styles.input} required minLength={8} />
                </label>
                <label className={styles.label}>
                    Confirmar Contraseña
                    <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={handleChange} className={styles.input} required />
                </label>
                <button type="submit" className={styles.btn}>Registrarse</button>
    <p className={styles.footer}>
                        ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
                    </p>
                    <Link to="/" className={styles.backLink}>← Volver al Catálogo</Link>
            </form>
        </div>
    );
}

export default Register;
