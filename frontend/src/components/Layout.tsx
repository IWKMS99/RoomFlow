import React from 'react';
import {NavLink, Outlet, useNavigate} from 'react-router-dom';
import styles from './Layout.module.css';
import {useAuth} from '../context/AuthContext.tsx';
import {Toaster} from "react-hot-toast";

const ListIcon = () => <span>📋</span>;
const CalendarIcon = () => <span>📅</span>;
const LogoutIcon = () => <span>🚪</span>;
const RulesIcon = () => <span>💡</span>;
const AdminIcon = () => <span>🛠️</span>;

const Layout: React.FC = () => {
    const {isAuthenticated, isAdmin, user, logout, isLoading} = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (isLoading) {
        return <div>Загрузка приложения...</div>;
    }

    return (
        <div className={styles.layoutContainer}>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                    },
                }}
            />
            <aside className={styles.sidebar}>
                <div className={styles.logo}>RoomFlow</div>
                <nav className={styles.nav}>
                    {isAuthenticated ? (
                        <>
                            <NavLink to="/booking/new" className={`${styles.navLink} ${styles.primary}`}>
                                <p className={styles.title}>Забронировать</p>
                            </NavLink>
                            <NavLink to="/my-bookings"
                                     className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                                <ListIcon/> Мои бронирования
                            </NavLink>
                            <NavLink to="/schedule"
                                     className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                                <CalendarIcon/> Журнал занятости
                            </NavLink>
                            {isAdmin && (
                                <NavLink to="/admin"
                                         className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                                    <AdminIcon/> Админ-панель
                                </NavLink>
                            )}
                        </>
                    ) : (
                        <NavLink to="/schedule"
                                 className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                            <CalendarIcon/> Журнал занятости
                        </NavLink>
                    )}
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.rulesBox}>
                        <div className={styles.rulesIcon}><RulesIcon/></div>
                        <div className={styles.rulesContent}>
                            <h4>Правила бронирования</h4>
                            <ul>
                                <li>Время работы: с 9:00 до 18:00.</li>
                                <li>Бронирование возможно только на будущее время.</li>
                                <li>Отмена бронирования доступна до его начала.</li>
                            </ul>
                        </div>
                    </div>

                    {isAuthenticated ? (
                        <div className={styles.userInfo}>
                            <p className={styles.userEmail} title={user?.email}>{user?.email}</p>
                            <button onClick={handleLogout} className={styles.logoutButton}>
                                <LogoutIcon/> Выйти
                            </button>
                        </div>
                    ) : (
                        <div className={styles.authButtons}>
                            <p className={styles.authHint}>Чтобы бронировать комнаты, войдите в аккаунт</p>
                            <NavLink to="/login" className={`${styles.authLink} ${styles.authPrimary}`}>
                                Войти
                            </NavLink>
                            <NavLink to="/register" className={styles.authLink}>
                                Регистрация
                            </NavLink>
                        </div>
                    )}
                </div>
            </aside>
            <main className={styles.mainContent}>
                <Outlet/>
            </main>
        </div>
    );
};

export default Layout;
