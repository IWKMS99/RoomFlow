import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from './Layout.module.css';

const CalendarIcon = () => <span>📅</span>;
const ListIcon = () => <span>📋</span>;

const Layout: React.FC = () => {
    return (
        <div className={styles.layoutContainer}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>RoomFlow</div>
                <nav className={styles.nav}>
                    <NavLink to="/schedule" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                        <CalendarIcon /> Журнал занятости
                    </NavLink>
                    <NavLink to="/my-bookings" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                        <ListIcon /> Мои бронирования
                    </NavLink>
                </nav>
                <div className={styles.sidebarFooter}>
                    {}
                </div>
            </aside>
            <main className={styles.mainContent}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;