import React, {useState} from 'react';
import {motion, useReducedMotion} from 'framer-motion';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../context/useAuth';
import NeonButton from '../components/ui/NeonButton';
import {loginUser} from '../services/api';
import {getApiErrorMessage} from '../lib/httpError';
import {motionPreset} from '../lib/motion';

const LoginPage: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as {from?: {pathname: string; search?: string}} | null)?.from;
  const redirectTo = from ? `${from.pathname}${from.search ?? ''}` : '/schedule';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await loginUser({email, password});
      await auth.login(response.token);
      navigate(redirectTo, {replace: true});
    } catch (err: unknown) {
      console.error('Login failed:', err);
      setError(getApiErrorMessage(err, 'Неверный email или пароль.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={reducedMotion ? false : {opacity: 0, y: 18, scale: 0.98}}
      animate={reducedMotion ? undefined : {opacity: 1, y: 0, scale: 1}}
      transition={motionPreset.springGentle}
      className="rf-modal relative w-full max-w-md overflow-hidden rounded-[1.75rem] p-7 md:p-8"
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/75 to-transparent" />
      <p className="rf-meta m-0 text-[11px] text-muted-foreground">RoomFlow access</p>
      <h1 className="rf-display mb-6 mt-2 text-3xl font-bold">Вход в RoomFlow</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-xl border border-white/16 bg-background/50 px-3 py-2.5 text-sm text-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Пароль
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full rounded-xl border border-white/16 bg-background/50 px-3 py-2.5 text-sm text-foreground"
          />
        </div>

        <p className="min-h-5 text-sm text-danger">{error}</p>

        <NeonButton type="submit" disabled={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? 'Вход...' : 'Войти'}
        </NeonButton>
      </form>

      <p className="mb-0 mt-4 text-center text-sm text-muted-foreground">
        Нет аккаунта?{' '}
        <Link to="/register" className="font-semibold text-primary">
          Зарегистрируйтесь
        </Link>
      </p>
    </motion.div>
  );
};

export default LoginPage;
