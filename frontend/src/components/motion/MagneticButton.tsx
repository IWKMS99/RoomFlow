import React from 'react';
import {useReducedMotion} from 'framer-motion';
import {cn} from '../../lib/utils';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  magneticStrength?: number;
}

const MagneticButton = ({
  magneticStrength = 20,
  className,
  onMouseMove,
  onMouseLeave,
  children,
  ...props
}: MagneticButtonProps) => {
  const reducedMotion = useReducedMotion();
  const ref = React.useRef<HTMLButtonElement>(null);
  const innerRef = React.useRef<HTMLSpanElement>(null);

  const handleMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (reducedMotion || !ref.current) {
      onMouseMove?.(event);
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    ref.current.style.transform = `translate(${x / magneticStrength}px, ${y / magneticStrength}px)`;
    ref.current.style.borderRadius = `${16 + Math.abs(y) / 7}px ${14 + Math.abs(x) / 6}px ${16 + Math.abs(y) / 9}px ${14 + Math.abs(x) / 8}px`;
    if (innerRef.current) {
      innerRef.current.style.transform = `translate(${x / (magneticStrength * 0.58)}px, ${y / (magneticStrength * 0.58)}px)`;
    }
    onMouseMove?.(event);
  };

  const handleLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (ref.current) {
      ref.current.style.transform = 'translate(0px, 0px)';
      ref.current.style.borderRadius = '';
    }
    if (innerRef.current) {
      innerRef.current.style.transform = 'translate(0px, 0px)';
    }
    onMouseLeave?.(event);
  };

  return (
    <button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn('transition-[transform,border-radius] duration-200 will-change-transform', className)}
      {...props}
    >
      <span ref={innerRef} className="inline-flex items-center justify-center gap-2 transition-transform duration-200 will-change-transform">
        {children}
      </span>
    </button>
  );
};

export default MagneticButton;
