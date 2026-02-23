import type React from 'react';
import type {LucideIcon} from 'lucide-react';
import GlassCard from './GlassCard';

interface Props {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}

const EmptyState = ({title, description, icon: Icon, action}: Props) => {
  return (
    <GlassCard variant="compact" className="px-5 py-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/8 text-primary shadow-[0_0_28px_hsl(var(--glow-2)/0.22)]">
        <Icon size={22} />
      </div>
      <h2 className="rf-display m-0 text-xl font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mb-0 mt-1 max-w-lg text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </GlassCard>
  );
};

export default EmptyState;
