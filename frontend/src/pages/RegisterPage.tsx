import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {registerUser} from '../services/api';
import styles from './LoginPage.module.css';

const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const auth = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            const response = await registerUser({email, password});
            auth.login(response.token);
            navigate('/schedule');
        } catch (err: any) {
            console.error("Registration failed:", err);
            setError(err.response?.data?.message || "Ошибка при регистрации.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.title}>Регистрация</h1>
            <form onSubmit={handleSubmit}>
                <div className={styles.formField}>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                </div>
                <div className={styles.formField}>
                    <label htmlFor="password">Пароль (мин. 6 символов)</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                           required minLength={6}/>
                </div>
                <p className={styles.error}>{error}</p>
                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                    {isSubmitting ? 'Регистрация...' : 'Создать аккаунт'}
                </button>
            </form>
            <p className={styles.link}>
                Уже есть аккаунт? <Link to="/login">Войдите</Link>
            </p>
        </div>
    );
};

export default RegisterPage;