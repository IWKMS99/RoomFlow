import React, {Suspense} from 'react';
import {AnimatePresence} from 'framer-motion';
import {useHubStore} from '../../store/useHubStore';

const RoomDetailOverlay = React.lazy(() => import('./components/RoomDetailOverlay'));

const OverlayLayer = () => {
  const viewMode = useHubStore((state) => state.viewMode);

  return (
    <Suspense fallback={null}>
      <AnimatePresence mode="wait">
        {viewMode === 'room_detail' && <RoomDetailOverlay key="room" />}
      </AnimatePresence>
    </Suspense>
  );
};

export default OverlayLayer;
