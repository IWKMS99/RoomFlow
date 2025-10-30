import React from 'react';
import {NavLink, Outlet, useNavigate} from 'react-router-dom';
import styles from './Layout.module.css';
import {useAuth} from '../context/AuthContext.tsx';
import {Toaster} from "react-hot-toast";

const ListIcon = () => <span>📋</span>;
const CalendarIcon = () => <span>📅</span>;
const LogoutIcon = () => <span>🚪</span>;

const Layout: React.FC = () => {
    const {isAuthenticated, user, logout, isLoading} = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
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
                        </>
                    ) : (
                        <NavLink to="/schedule"
                                 className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                            <CalendarIcon/> Журнал занятости
                        </NavLink>
                    )}
                </nav>

                <div className={styles.sidebarFooter}>
                    {isAuthenticated ? (
                        <div className={styles.userInfo}>
                            <p className={styles.userEmail}>{user?.sub}</p>
                            <button onClick={handleLogout} className={styles.logoutButton}>
                                <LogoutIcon/> Выйти
                            </button>
                        </div>
                    ) : (
                        <div className={styles.authButtons}>
                            <NavLink to="/login" className={styles.navLink}>Вход</NavLink>
                            <NavLink to="/register"
                                     className={`${styles.navLink} ${styles.primary}`}>Регистрация</NavLink>
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