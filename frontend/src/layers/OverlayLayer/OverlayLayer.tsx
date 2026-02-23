import {AnimatePresence} from 'framer-motion';
import {useHubStore} from '../../store/useHubStore';

import RoomDetailOverlay from './components/RoomDetailOverlay';
import MyBookingsOverlay from './components/MyBookingsOverlay';
import AdminOverlay from './components/AdminOverlay';

const OverlayLayer = () => {
  const viewMode = useHubStore((state) => state.viewMode);

  return (
    <AnimatePresence mode="sync">
      {viewMode === 'room_detail' && <RoomDetailOverlay key="room" />}
      {viewMode === 'my_bookings' && <MyBookingsOverlay key="bookings" />}
      {viewMode === 'admin' && <AdminOverlay key="admin" />}
    </AnimatePresence>
  );
};

export default OverlayLayer;