import React, {useState} from 'react';
import {motion, useReducedMotion} from 'framer-motion';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useTranslation} from 'react-i18next';
import {useAuth} from '../context/useAuth';
import NeonButton from '../components/ui/NeonButton';
import {loginUser} from '../services/api';
import {getApiErrorMessage} from '../lib/httpError';
import {motionPreset} from '../lib/motion';

const loginSchema = z.object({
  email: z.string().email('Введите корректный email.'),
  password: z.string().min(8, 'Минимальная длина пароля — 8 символов.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const {t} = useTranslation();
  const reducedMotion = useReducedMotion();
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const from = (location.state as {from?: {pathname: string; search?: string}} | null)?.from;
  const redirectTo = from ? `${from.pathname}${from.search ?? ''}` : '/schedule';

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);

    try {
      const response = await loginUser(values);
      await auth.login(response.token);
      navigate(redirectTo, {replace: true});
    } catch (err: unknown) {
      console.error('Login failed:', err);
      setError(getApiErrorMessage(err, 'Неверный email или пароль.'));
    }
  };

  return (
    <motion.div
      layoutId="auth-panel-shell"
      initial={reducedMotion ? false : {opacity: 0, y: 18, scale: 0.98}}
      animate={reducedMotion ? undefined : {opacity: 1, y: 0, scale: 1}}
      transition={motionPreset.springGentle}
      className="rf-modal relative w-full max-w-md overflow-hidden rounded-[1.75rem] p-7 md:p-8"
    >
      <motion.div
        aria-hidden="true"
        initial={reducedMotion ? false : {opacity: 0}}
        animate={reducedMotion ? undefined : {opacity: 0.62}}
        transition={reducedMotion ? motionPreset.quick : motionPreset.smooth}
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(circle at 18% 20%, hsl(var(--glow-1)/0.18), transparent 46%), radial-gradient(circle at 84% 12%, hsl(var(--glow-2)/0.14), transparent 44%), linear-gradient(165deg, hsl(var(--surface-glass-1)/0.38), transparent 62%)',
        }}
      />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/75 to-transparent" />
      <div className="relative">
        <p className="rf-meta m-0 text-[11px] text-muted-foreground">RoomFlow access</p>
        <h1 className="rf-display mb-6 mt-2 text-3xl font-bold">{t('auth.loginTitle')}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full rounded-xl border border-white/16 bg-background/50 px-3 py-2.5 text-sm text-foreground"
          />
          {errors.email && <p className="m-0 text-xs text-danger">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {t('auth.password')}
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="w-full rounded-xl border border-white/16 bg-background/50 px-3 py-2.5 text-sm text-foreground"
          />
          {errors.password && <p className="m-0 text-xs text-danger">{errors.password.message}</p>}
        </div>

        {error && <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        <motion.div layoutId="auth-submit-slot" transition={motionPreset.springGentle}>
          <NeonButton type="submit" disabled={isSubmitting} className="w-full" size="lg">
            {isSubmitting ? t('auth.loginSubmitPending') : t('auth.loginSubmit')}
          </NeonButton>
        </motion.div>
      </form>

      <motion.p layoutId="auth-switch-row" transition={motionPreset.springGentle} className="relative mb-0 mt-4 text-center text-sm text-muted-foreground">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="font-semibold text-primary">
          {t('auth.registerLink')}
        </Link>
      </motion.p>
    </motion.div>
  );
};

export default LoginPage;
