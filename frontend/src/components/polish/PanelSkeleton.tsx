interface Props {
  rows?: number;
}

const PanelSkeleton = ({rows = 4}: Props) => {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({length: rows}).map((_, index) => (
        <div key={index} className="relative h-20 overflow-hidden rounded-2xl border border-white/12 bg-card/70">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/12 to-transparent" />
        </div>
      ))}
    </div>
  );
};

export default PanelSkeleton;
