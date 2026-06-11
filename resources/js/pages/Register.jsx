import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

import styles from './Register.module.css';

function Register() {
    const navigate = useNavigate();
    // Estado del formulario con nombre, email, password y confirmacion
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // Envia los datos de registro, guarda el token y redirige al dashboard
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/register', form);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/admin/dashboard');
        } catch (err) {
            // Tomamos el primer error de validacion que devuelva el backend
            const messages = err.response?.data?.errors;
            const first = messages ? Object.values(messages)[0]?.[0] : '';
            setError(first || err.response?.data?.message || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.formPanel}>
                    <h1 className={styles.title}>Crear Cuenta</h1>
                    <p className={styles.subtitle}>Registrate para gestionar el catálogo</p>
                    {error && <p className={styles.error}>{error}</p>}
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <label className={styles.label}>
                            Nombre
                            <input type="text" name="name" value={form.name} onChange={handleChange} className={styles.input} placeholder="Tu nombre" required />
                        </label>
                        <label className={styles.label}>
                            Email
                            <input type="email" name="email" value={form.email} onChange={handleChange} className={styles.input} placeholder="tu@email.com" required />
                        </label>
                        <label className={styles.label}>
                            Contraseña
                            <div className={styles.passwordWrapper}>
                                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} className={styles.input} placeholder="Mínimo 8 caracteres" required minLength={8} />
                                <button type="button" className={styles.toggle} onClick={() => setShowPassword((p) => !p)}>{showPassword ? 'Ocultar' : 'Mostrar'}</button>
                            </div>
                        </label>
                        <label className={styles.label}>
                            Confirmar Contraseña
                            <input type={showPassword ? 'text' : 'password'} name="password_confirmation" value={form.password_confirmation} onChange={handleChange} className={styles.input} placeholder="Repetí tu contraseña" required />
                        </label>
                        <button type="submit" className={styles.btn} disabled={loading}>
                            {loading ? <span className={styles.spinner} /> : 'Registrarse'}
                        </button>
                    </form>
                    <p className={styles.footer}>¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link></p>
                    <Link to="/" className={styles.back}>← Volver al Catálogo</Link>
                </div>
                <div className={styles.divider} />
                <div className={styles.iconPanel} />
            </div>
        </div>
    );
}

export default Register;
