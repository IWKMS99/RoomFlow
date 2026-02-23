import React, {Suspense} from 'react';
import {AnimatePresence} from 'framer-motion';
import {useHubStore} from '../../store/useHubStore';

const RoomDetailOverlay = React.lazy(() => import('./components/RoomDetailOverlay'));
const MyBookingsOverlay = React.lazy(() => import('./components/MyBookingsOverlay'));
const AdminOverlay = React.lazy(() => import('./components/AdminOverlay'));

const OverlayLayer = () => {
  const viewMode = useHubStore((state) => state.viewMode);

  return (
    <Suspense fallback={null}>
      <AnimatePresence mode="sync">
        {viewMode === 'room_detail' && <RoomDetailOverlay key="room" />}
        {viewMode === 'my_bookings' && <MyBookingsOverlay key="bookings" />}
        {viewMode === 'admin' && <AdminOverlay key="admin" />}
      </AnimatePresence>
    </Suspense>
  );
};

export default OverlayLayer;
