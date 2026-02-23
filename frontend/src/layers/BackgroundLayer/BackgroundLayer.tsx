const BackgroundLayer = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 rf-stage-surface rf-stage-surface--dark" />
      <div className="absolute inset-0 rf-stage-grid rf-stage-grid--dark" />
    </div>
  );
};

export default BackgroundLayer;
