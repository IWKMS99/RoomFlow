import type React from 'react';
import {cn} from '../../lib/utils';

type GlassVariant = 'hero' | 'panel' | 'compact';
type GlassTone = 'neutral' | 'accent';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: GlassVariant;
  tone?: GlassTone;
  interactive?: boolean;
}

const variantClass: Record<GlassVariant, string> = {
  hero: 'rounded-[2rem] p-5 sm:p-6',
  panel: 'rounded-3xl',
  compact: 'rounded-2xl',
};

const toneClass: Record<GlassTone, string> = {
  neutral: '',
  accent:
    'before:absolute before:inset-0 before:rounded-[inherit] before:bg-[radial-gradient(circle_at_18%_16%,hsl(var(--glow-1)/0.16),transparent_50%)] before:opacity-90 before:content-[""]',
};

const GlassCard = ({children, className, variant = 'panel', tone = 'neutral', interactive = false, ...rest}: Props) => {
  return (
    <div
      data-interactive={interactive ? 'true' : undefined}
      className={cn(
        'rf-glass relative overflow-hidden',
        interactive && 'transition duration-300 hover:-translate-y-0.5 hover:shadow-glow',
        variantClass[variant],
        toneClass[tone],
        className
      )}
      {...rest}
    >
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-70" />
      <div className="relative">{children}</div>
    </div>
  );
};

export default GlassCard;
