import React from 'react';
import {Link} from 'react-router-dom';
import {useAdminUsersQuery} from '../services/hooks/useAdminUsersQuery';

const AdminPage: React.FC = () => {
  const users = useAdminUsersQuery();

  return (
    <section className="mx-auto max-w-4xl space-y-4 pb-8">
      <h1 className="rf-display text-3xl font-bold">Admin</h1>
      <p className="text-sm text-muted-foreground">
        Этот экран временно работает в fallback-режиме. Spatial admin-режим будет в следующей итерации.
      </p>

      {users.isLoading && <p className="text-sm text-muted-foreground">Загрузка пользователей...</p>}
      {users.isError && (
        <p className="text-sm text-danger">
          Не удалось загрузить пользователей. <button type="button" className="underline" onClick={() => void users.refetch()}>Повторить</button>
        </p>
      )}

      {!users.isLoading && !users.isError && (
        <div className="space-y-2">
          {(users.data ?? []).map((user) => (
            <div key={user.id} className="rounded-xl border border-white/16 bg-card/70 px-3 py-2 text-sm">
              <span className="font-medium text-foreground">{user.email}</span>
              <span className="ml-2 text-muted-foreground">{user.roles.join(', ')}</span>
            </div>
          ))}
        </div>
      )}

      <Link to="/schedule" className="text-sm text-primary underline">Вернуться в Spatial Schedule</Link>
    </section>
  );
};

export default AdminPage;
