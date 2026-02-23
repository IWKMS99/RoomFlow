import {useEffect, useRef, useState} from 'react';
import type React from 'react';
import {AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform} from 'framer-motion';
import {BookMarked, CalendarDays, Languages, LogIn, LogOut, MoonStar, Shield, Sun, UserCircle2, X} from 'lucide-react';
import {NavLink, useLocation, useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {cn} from '../../lib/utils';
import {motionPreset} from '../../lib/motion';
import {useMediaQuery} from '../../hooks/useMediaQuery';
import MagneticButton from '../motion/MagneticButton';
import type {ThemeMode} from '../../hooks/useTheme';

interface DockItem {
  to: string;
  label: string;
  icon: React.ComponentType<{size?: number}>;
  flyoutPanelLayoutId?: string;
}

interface Props {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userEmail?: string;
  onLogout: () => Promise<void>;
  theme: ThemeMode;
  onToggleTheme: (origin?: {x: number; y: number}) => void;
  onRouteHover?: (route: string) => void;
}

const itemBase =
  'group relative inline-flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_hsl(var(--primary)/0.62),0_0_0_4px_hsl(var(--primary)/0.16)] sm:px-4';
const accountPanelLayoutId = 'dock-account-panel';

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
      layout
      initial={reducedMotion ? false : {opacity: 0, scale: 0.92, width: 0}}
      animate={reducedMotion ? undefined : {opacity: 1, scale: 1, width: 'auto'}}
      exit={reducedMotion ? undefined : {opacity: 0, scale: 0.88, width: 0}}
      transition={reducedMotion ? motionPreset.quick : motionPreset.springGentle}
      style={{scale: isCoarsePointer ? 1 : scale}}
      onMouseMove={(event) => {
        if (isCoarsePointer) return;
        const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
        mouseX.set(event.clientX - (rect.left + rect.width / 2));
      }}
      onMouseLeave={() => mouseX.set(-1000)}
      onMouseEnter={() => onRouteHover?.(item.to)}
      className="origin-right overflow-hidden"
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
            {item.flyoutPanelLayoutId ? (
              <motion.span
                layoutId={item.flyoutPanelLayoutId}
                aria-hidden="true"
                transition={reducedMotion ? motionPreset.quick : motionPreset.springGentle}
                className="absolute inset-[1px] rounded-full bg-primary/14"
              />
            ) : (
              isActive && (
                <motion.span
                  layoutId="dock-nav-active-pill"
                  aria-hidden="true"
                  transition={reducedMotion ? motionPreset.quick : motionPreset.springGentle}
                  className="absolute inset-0 bg-primary/25"
                />
              )
            )}
            <span className="relative z-[1] inline-flex items-center gap-2">
              <item.icon size={15} />
              <span className="hidden md:inline">{item.label}</span>
            </span>
            {isActive && !item.flyoutPanelLayoutId && (
              <span className="pointer-events-none absolute bottom-1.5 left-1/2 h-0.5 w-7 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.82)]" />
            )}
          </>
        )}
      </NavLink>
    </motion.div>
  );
};

const DockNav = ({isAuthenticated, isAdmin, userEmail, onLogout, theme, onToggleTheme, onRouteHover}: Props) => {
  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const location = useLocation();
  const navigate = useNavigate();
  const {t, i18n} = useTranslation();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<{right: number; bottom: number} | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  const items: DockItem[] = [
    {to: '/schedule', label: t('nav.schedule'), icon: CalendarDays},
    ...(isAuthenticated ? [{to: '/my-bookings', label: t('nav.myBookings'), icon: BookMarked, flyoutPanelLayoutId: 'my-bookings-panel'}] : []),
    ...(isAdmin ? [{to: '/admin', label: t('nav.admin'), icon: Shield, flyoutPanelLayoutId: 'admin-panel'}] : []),
  ];
  const isBookingsOpen = location.pathname.startsWith('/my-bookings');
  const isAdminOpen = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (!isAuthenticated) {
      setIsAccountMenuOpen(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !accountMenuRef.current?.contains(target)) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAccountMenuOpen]);

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return;
    }
    const handleViewportChange = () => setIsAccountMenuOpen(false);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isAccountMenuOpen]);

  const handleOpenAccountMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setAccountMenuAnchor({
      right: Math.max(12, window.innerWidth - rect.right),
      bottom: Math.max(12, window.innerHeight - rect.top + 8),
    });
    setIsAccountMenuOpen(true);
  };

  return (
    <motion.nav
        initial={reducedMotion ? false : {y: 26, opacity: 0}}
        animate={reducedMotion ? undefined : {y: 0, opacity: 1}}
        transition={motionPreset.springGentle}
        className="pointer-events-auto fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 px-3"
        aria-label="Основная навигация"
      >
        <motion.div
          layout
          transition={reducedMotion ? motionPreset.quick : motionPreset.springGentle}
          className="mx-auto flex w-fit max-w-full items-center gap-1 overflow-x-auto overflow-y-visible rounded-full border border-white/20 bg-[linear-gradient(140deg,hsl(var(--surface-glass-1)),hsl(var(--surface-glass-2)))] p-1.5 shadow-glow backdrop-blur-2xl rf-scrollbar"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {items
              .filter((item) => !((item.to === '/my-bookings' && isBookingsOpen) || (item.to === '/admin' && isAdminOpen)))
              .map((item) => (
                <DockItemButton key={item.to} item={item} onRouteHover={onRouteHover} />
              ))}
          </AnimatePresence>
          <MagneticButton
            onClick={() => {
              void i18n.changeLanguage(i18n.language === 'ru' ? 'en' : 'ru');
            }}
            title={t('nav.lang')}
            className={cn(itemBase, 'border-transparent text-muted-foreground hover:border-white/15 hover:bg-white/10 hover:text-foreground')}
            aria-label={t('nav.lang')}
          >
            <Languages size={15} />
            <span className="hidden md:inline">{i18n.language === 'ru' ? 'RU' : 'EN'}</span>
          </MagneticButton>
          <MagneticButton
            onClick={(event) => onToggleTheme({x: event.clientX, y: event.clientY})}
            title={t('nav.theme')}
            className={cn(itemBase, 'border-transparent text-muted-foreground hover:border-white/15 hover:bg-white/10 hover:text-foreground')}
            aria-label={t('nav.theme')}
          >
            {theme === 'dark' ? <Sun size={15} /> : <MoonStar size={15} />}
            <span className="hidden md:inline">{theme === 'dark' ? t('nav.themeLight') : t('nav.themeDark')}</span>
          </MagneticButton>

          {isAuthenticated ? (
            <AnimatePresence initial={false} mode="popLayout">
              {!isAccountMenuOpen && (
                <motion.div key="account-trigger" layout transition={reducedMotion ? motionPreset.quick : motionPreset.springGentle}>
                  <MagneticButton
                    onClick={handleOpenAccountMenu}
                    title={userEmail}
                    aria-label={t('nav.profile')}
                    className={cn(itemBase + ' overflow-hidden', 'border-transparent text-muted-foreground hover:border-white/15 hover:bg-white/10 hover:text-foreground')}
                  >
                    <motion.span
                      layoutId={accountPanelLayoutId}
                      transition={reducedMotion ? motionPreset.quick : motionPreset.springGentle}
                      aria-hidden="true"
                      className="absolute inset-[1px] rounded-full bg-primary/14"
                    />
                    <UserCircle2 size={15} />
                    <span className="hidden max-w-[140px] truncate md:inline">{userEmail ?? t('nav.profile')}</span>
                  </MagneticButton>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <MagneticButton
              onClick={() => navigate('/login')}
              className={cn(itemBase, 'border-primary/42 bg-primary/22 text-foreground hover:bg-primary/32')}
            >
              <LogIn size={15} />
              <span className="hidden md:inline">{t('nav.login')}</span>
            </MagneticButton>
          )}
        </motion.div>

        <AnimatePresence>
        {isAuthenticated && isAccountMenuOpen && (
          <motion.div
            ref={accountMenuRef}
            initial={reducedMotion ? false : {opacity: 0}}
            animate={reducedMotion ? undefined : {opacity: 1}}
            exit={reducedMotion ? undefined : {opacity: 0}}
            transition={reducedMotion ? motionPreset.quick : motionPreset.springGentle}
            className={cn(
              'z-[70] min-w-[220px] p-2',
              isDesktop && accountMenuAnchor
                ? 'fixed'
                : 'absolute bottom-full right-3 mb-2 rounded-2xl border border-white/20 bg-[linear-gradient(140deg,hsl(var(--surface-glass-1)),hsl(var(--surface-glass-2)))] shadow-glow backdrop-blur-2xl'
            )}
            style={
              isDesktop && accountMenuAnchor
                ? {
                    right: `${accountMenuAnchor.right}px`,
                    bottom: `${accountMenuAnchor.bottom}px`,
                    transformOrigin: 'bottom right',
                  }
                : undefined
            }
          >
            <motion.div
              layoutId={accountPanelLayoutId}
              transition={reducedMotion ? motionPreset.quick : motionPreset.springGentle}
              className="absolute inset-0 rounded-2xl border border-white/20 bg-[linear-gradient(140deg,hsl(var(--surface-glass-1)),hsl(var(--surface-glass-2)))] shadow-glow backdrop-blur-2xl"
            />
            <motion.span
              aria-hidden="true"
              initial={reducedMotion ? false : {opacity: 0, scaleY: 0.35, y: 3}}
              animate={reducedMotion ? undefined : {opacity: 1, scaleY: 1, y: 0}}
              exit={reducedMotion ? undefined : {opacity: 0, scaleY: 0.35, y: 3}}
              transition={reducedMotion ? motionPreset.quick : motionPreset.standard}
              className={cn(
                'pointer-events-none absolute -bottom-3 right-5 h-4 w-14 origin-top rounded-b-2xl border-x border-b border-white/18 bg-[linear-gradient(180deg,hsl(var(--surface-glass-2))_0%,hsl(var(--surface-glass-1)/0.58)_100%)]',
                isDesktop && 'hidden'
              )}
            />
            <div className="relative px-2 pb-2 pt-1">
              <div className="flex items-center justify-between gap-2">
                <p className="m-0 text-xs text-muted-foreground">{t('nav.profile')}</p>
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen(false)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                  aria-label="Закрыть профиль"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="m-0 mt-1 truncate text-sm font-semibold text-foreground">{userEmail}</p>
              <p className="m-0 mt-1 text-xs text-muted-foreground">{isAdmin ? t('nav.roleAdmin') : t('nav.roleUser')}</p>
            </div>
            <button
              type="button"
              className="relative flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
              onClick={() => {
                setIsAccountMenuOpen(false);
                navigate('/my-bookings');
              }}
            >
              <BookMarked size={14} className="mr-2" />
              {t('nav.myBookings')}
            </button>
            {isAdmin && (
              <button
                type="button"
                className="relative mt-1 flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  navigate('/admin');
                }}
              >
                <Shield size={14} className="mr-2" />
                {t('nav.admin')}
              </button>
            )}
            <button
              type="button"
              className="relative mt-1 flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-danger/14 hover:text-danger"
              onClick={() => {
                setIsAccountMenuOpen(false);
                void onLogout();
              }}
            >
              <LogOut size={14} className="mr-2" />
              {t('nav.logoutAria')}
            </button>
          </motion.div>
        )}
        </AnimatePresence>
      </motion.nav>
  );
};

export default DockNav;
