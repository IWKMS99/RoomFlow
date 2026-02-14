import React, {useEffect, useState} from 'react';
import styles from './AdminPage.module.css';
import {getAdminUsers, updateUserRole, type AdminUser} from '../services/api';
import toast from 'react-hot-toast';

const AdminPage: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await getAdminUsers();
                setUsers(data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Не удалось загрузить пользователей.');
            } finally {
                setIsLoading(false);
            }
        };

        loadUsers();
    }, []);

    const handleRoleChange = async (userId: string, role: 'ROLE_USER' | 'ROLE_ADMIN') => {
        setUpdatingUserId(userId);
        const promise = updateUserRole(userId, role);
        toast.promise(promise, {
            loading: 'Обновляем роль...',
            success: (updatedUser) => {
                setUsers(prevUsers => prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user));
                return 'Роль успешно обновлена.';
            },
            error: (err) => err.response?.data?.message || 'Не удалось обновить роль.',
        });
        try {
            await promise;
        } finally {
            setUpdatingUserId(null);
        }
    };

    const getPrimaryRole = (roles: string[]): 'ROLE_ADMIN' | 'ROLE_USER' => {
        return roles.includes('ROLE_ADMIN') ? 'ROLE_ADMIN' : 'ROLE_USER';
    };

    return (
        <div className={styles.pageContainer}>
            <h1>Админ-панель</h1>
            {isLoading && <p>Загрузка пользователей...</p>}
            {error && <p className={styles.error}>{error}</p>}
            {!isLoading && !error && (
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>Email</th>
                        <th>Роль</th>
                        <th>Действие</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(user => {
                        const primaryRole = getPrimaryRole(user.roles);
                        const nextRole = primaryRole === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
                        const buttonLabel = primaryRole === 'ROLE_ADMIN' ? 'Сделать пользователем' : 'Сделать админом';
                        return (
                            <tr key={user.id}>
                                <td>{user.email}</td>
                                <td>{primaryRole}</td>
                                <td>
                                    <button
                                        className={styles.actionButton}
                                        disabled={updatingUserId === user.id}
                                        onClick={() => handleRoleChange(user.id, nextRole)}
                                    >
                                        {buttonLabel}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminPage;
