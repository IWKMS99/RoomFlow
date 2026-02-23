import type React from 'react';
import {motion, useMotionValue, useReducedMotion, useSpring, useTransform} from 'framer-motion';
import {BookMarked, CalendarDays, LogIn, LogOut, Shield, UserCircle2} from 'lucide-react';
import {NavLink, useNavigate} from 'react-router-dom';
import {cn} from '../../lib/utils';
import {motionPreset} from '../../lib/motion';
import {useMediaQuery} from '../../hooks/useMediaQuery';
import MagneticButton from '../motion/MagneticButton';

interface DockItem {
  to: string;
  label: string;
  icon: React.ComponentType<{size?: number}>;
}

interface Props {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userEmail?: string;
  onLogout: () => Promise<void>;
  onRouteHover?: (route: string) => void;
}

const itemBase =
  'group relative inline-flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition sm:px-4';

const DockItemButton = ({
  item,
  onRouteHover,
}: {
  item: DockItem;
  onRouteHover?: (route: string) => void;
}) => {
  const reducedMotion = useReducedMotion();
  const isCoarsePointer = useMediaQuery('(pointer: coarse)');
  const mouseX = useMotionValue(-1000);
  const scaleRaw = useTransform(mouseX, [-180, -60, 0, 60, 180], [1, 1.05, 1.2, 1.05, 1]);
  const scale = useSpring(scaleRaw, {stiffness: 260, damping: 22});

  return (
    <motion.div
      style={{scale: isCoarsePointer ? 1 : scale}}
      onMouseMove={(event) => {
        if (isCoarsePointer) return;
        const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
        mouseX.set(event.clientX - (rect.left + rect.width / 2));
      }}
      onMouseLeave={() => mouseX.set(-1000)}
      onMouseEnter={() => onRouteHover?.(item.to)}
    >
      <NavLink
        to={item.to}
        className={({isActive}) =>
          cn(
            `${itemBase} overflow-hidden`,
            isActive
              ? 'border-primary/50 text-foreground shadow-[0_14px_30px_-18px_hsl(var(--primary)/0.9)]'
              : 'border-transparent text-muted-foreground hover:border-white/15 hover:bg-white/10 hover:text-foreground'
          )
        }
      >
        {({isActive}) => (
          <>
            {isActive && (
              <motion.span
                layoutId="dock-nav-active-pill"
                aria-hidden="true"
                transition={reducedMotion ? motionPreset.quick : motionPreset.springGentle}
                className="absolute inset-0 bg-primary/25"
              />
            )}
            <span className="relative z-[1] inline-flex items-center gap-2">
              <item.icon size={15} />
              <span className="hidden md:inline">{item.label}</span>
            </span>
            {isActive && (
              <span className="pointer-events-none absolute bottom-1.5 left-1/2 h-0.5 w-7 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.82)]" />
            )}
          </>
        )}
      </NavLink>
    </motion.div>
  );
};

const DockNav = ({isAuthenticated, isAdmin, userEmail, onLogout, onRouteHover}: Props) => {
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();

  const items: DockItem[] = [
    {to: '/schedule', label: 'Расписание', icon: CalendarDays},
    ...(isAuthenticated ? [{to: '/my-bookings', label: 'Мои брони', icon: BookMarked}] : []),
    ...(isAdmin ? [{to: '/admin', label: 'Админ', icon: Shield}] : []),
  ];

  return (
    <motion.nav
      initial={reducedMotion ? false : {y: 26, opacity: 0}}
      animate={reducedMotion ? undefined : {y: 0, opacity: 1}}
      transition={motionPreset.springGentle}
      className="pointer-events-auto fixed inset-x-0 bottom-4 z-50 px-3"
      aria-label="Основная навигация"
    >
      <div className="mx-auto flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/20 bg-[linear-gradient(140deg,hsl(var(--surface-glass-1)),hsl(var(--surface-glass-2)))] p-1.5 shadow-glow backdrop-blur-2xl rf-scrollbar">
        {items.map((item) => (
          <DockItemButton key={item.to} item={item} onRouteHover={onRouteHover} />
        ))}

        {isAuthenticated ? (
          <>
            <MagneticButton
              onClick={() => navigate('/my-bookings')}
              title={userEmail}
              className={cn(itemBase, 'border-transparent text-muted-foreground hover:border-white/15 hover:bg-white/10 hover:text-foreground')}
            >
              <UserCircle2 size={15} />
              <span className="hidden max-w-[140px] truncate md:inline">{userEmail ?? 'Профиль'}</span>
            </MagneticButton>
            <MagneticButton
              onClick={() => void onLogout()}
              className={cn(itemBase, 'border-transparent text-muted-foreground hover:border-danger/35 hover:bg-danger/14 hover:text-danger')}
              aria-label="Выйти"
            >
              <LogOut size={15} />
            </MagneticButton>
          </>
        ) : (
          <MagneticButton
            onClick={() => navigate('/login')}
            className={cn(itemBase, 'border-primary/42 bg-primary/22 text-foreground hover:bg-primary/32')}
          >
            <LogIn size={15} />
            <span className="hidden md:inline">Войти</span>
          </MagneticButton>
        )}
      </div>
    </motion.nav>
  );
};

export default DockNav;
