import {cn} from '../../lib/utils';

type StatusTone = 'active' | 'warning' | 'danger' | 'muted';

interface Props {
  tone: StatusTone;
  label: string;
  className?: string;
}

const toneClass: Record<StatusTone, string> = {
  active: 'border-primary/45 bg-primary/16 text-primary',
  warning: 'border-warning/40 bg-warning/18 text-warning',
  danger: 'border-danger/45 bg-danger/14 text-danger',
  muted: 'border-white/12 bg-white/6 text-muted-foreground',
};

const StatusChip = ({tone, label, className}: Props) => {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold', toneClass[tone], className)}>
      {label}
    </span>
  );
};

export default StatusChip;
