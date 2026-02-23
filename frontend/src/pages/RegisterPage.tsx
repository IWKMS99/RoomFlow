import React, {useMemo, useState} from 'react';
import {motion, useReducedMotion} from 'framer-motion';
import {Link, useNavigate} from '@tanstack/react-router';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useTranslation} from 'react-i18next';
import {useAuth} from '../context/useAuth';
import NeonButton from '../components/ui/NeonButton';
import {registerUser} from '../services/api';
import {getApiErrorMessage} from '../lib/httpError';
import {motionPreset} from '../lib/motion';

type RegisterFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

const RegisterPage: React.FC = () => {
  const {t} = useTranslation();
  const registerSchema = useMemo(
    () =>
      z
        .object({
          email: z.string().email(t('auth.validation.email')),
          password: z.string().min(8, t('auth.validation.passwordMin')),
          confirmPassword: z.string().min(8, t('auth.validation.passwordMin')),
        })
        .refine((values) => values.password === values.confirmPassword, {
          path: ['confirmPassword'],
          message: t('auth.validation.passwordsMatch'),
        }),
    [t]
  );
  const reducedMotion = useReducedMotion();
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setError(null);

    try {
      const response = await registerUser({email: values.email, password: values.password});
      await auth.login(response.token);
      navigate({to: '/schedule'});
    } catch (err: unknown) {
      console.error('Registration failed:', err);
      setError(getApiErrorMessage(err, t('auth.registerError')));
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
            'radial-gradient(circle at 16% 18%, hsl(var(--glow-2)/0.16), transparent 44%), radial-gradient(circle at 82% 14%, hsl(var(--accent-mint)/0.14), transparent 44%), linear-gradient(165deg, hsl(var(--surface-glass-1)/0.38), transparent 62%)',
        }}
      />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/75 to-transparent" />
      <div className="relative">
        <p className="rf-meta m-0 text-[11px] text-muted-foreground">{t('auth.registerMeta')}</p>
        <h1 className="rf-display mb-6 mt-2 text-3xl font-bold">{t('auth.registerTitle')}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {t('auth.email')}
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

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {t('auth.confirmPassword')}
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            className="w-full rounded-xl border border-white/16 bg-background/50 px-3 py-2.5 text-sm text-foreground"
          />
          {errors.confirmPassword && <p className="m-0 text-xs text-danger">{errors.confirmPassword.message}</p>}
        </div>

        {error && <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        <motion.div layoutId="auth-submit-slot" transition={motionPreset.springGentle}>
          <NeonButton type="submit" disabled={isSubmitting} className="w-full" size="lg">
            {isSubmitting ? t('auth.registerSubmitPending') : t('auth.registerSubmit')}
          </NeonButton>
        </motion.div>
      </form>

      <motion.p layoutId="auth-switch-row" transition={motionPreset.springGentle} className="relative mb-0 mt-4 text-center text-sm text-muted-foreground">
        {t('auth.haveAccount')}{' '}
        <Link to="/login" className="font-semibold text-primary">
          {t('auth.loginLink')}
        </Link>
      </motion.p>
    </motion.div>
  );
};

export default RegisterPage;
