CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings
    ADD CONSTRAINT uq_room_booking_overlap
        EXCLUDE USING GIST (
        room_id WITH =,
        tsrange(start_time, end_time) WITH &&
        )
        WHERE (status <> 'CANCELLED');