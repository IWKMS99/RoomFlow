import type React from 'react';
import {cn} from '../../lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'border-primary/45 bg-primary/80 text-primary-foreground shadow-[0_12px_34px_-16px_hsl(var(--primary)/0.88)] hover:bg-primary',
  secondary: 'border-white/20 bg-white/10 text-foreground hover:bg-white/16',
  ghost: 'border-transparent bg-transparent text-muted-foreground hover:border-white/20 hover:bg-white/8 hover:text-foreground',
  danger: 'border-danger/60 bg-danger/18 text-danger hover:bg-danger/28',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'rounded-lg px-3 py-1.5 text-xs',
  md: 'rounded-xl px-3.5 py-2 text-sm',
  lg: 'rounded-xl px-4 py-2.5 text-sm',
};

const NeonButton = ({variant = 'primary', size = 'md', className, type = 'button', ...props}: Props) => {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 border font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60',
        sizeClass[size],
        variantClass[variant],
        className
      )}
      {...props}
    />
  );
};

export default NeonButton;
