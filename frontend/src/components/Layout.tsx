import React from 'react';
import {NavLink, Outlet} from 'react-router-dom';
import styles from './Layout.module.css';

const ListIcon = () => <span>📋</span>;
const CalendarIcon = () => <span>📅</span>;
const WarningIcon = () => <span>⚠️</span>;

const Layout: React.FC = () => {
    return (
        <div className={styles.layoutContainer}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>RoomFlow</div>
                <nav className={styles.nav}>
                    <NavLink to="/booking/new" className={`${styles.navLink} ${styles.primary}`}>
                        <div className={styles.textWrapper}>
                            <p className={styles.title}>Забронировать</p>
                            <p className={styles.subtitle}>Выберите дату и помещение</p>
                        </div>
                    </NavLink>
                    <NavLink to="/my-bookings"
                             className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                        <ListIcon/> Мои бронирования
                    </NavLink>
                    <NavLink to="/schedule"
                             className={({isActive}) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                        <CalendarIcon/> Журнал занятости
                    </NavLink>
                </nav>
                <div className={styles.sidebarFooter}>
                    <div className={styles.rulesBox}>
                        <div className={styles.rulesIcon}><WarningIcon/></div>
                        <div className={styles.rulesContent}>
                            <h4>Правила бронирования</h4>
                            <ul>
                                <li>Максимальная длительность: 2 часа</li>
                                <li>Бесплатная отмена за 2+ часа до начала</li>
                                <li>Бронирование доступно на 2 недели вперёд</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </aside>
            <main className={styles.mainContent}>
                <Outlet/>
            </main>
        </div>
    );
};

export default Layout;