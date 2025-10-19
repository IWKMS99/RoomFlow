CREATE TABLE rooms (
                       id UUID PRIMARY KEY,
                       name VARCHAR(255) NOT NULL,
                       floor INT NOT NULL,
                       capacity INT NOT NULL
);

CREATE TABLE bookings (
                          id UUID PRIMARY KEY,
                          room_id UUID NOT NULL,
                          user_id UUID NOT NULL,
                          start_time TIMESTAMP NOT NULL,
                          end_time TIMESTAMP NOT NULL,
                          status VARCHAR(50) NOT NULL,
                          CONSTRAINT fk_bookings_room FOREIGN KEY (room_id) REFERENCES rooms(id)
);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);

INSERT INTO rooms (id, name, floor, capacity) VALUES
                                                  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Переговорка А', 3, 6),
                                                  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Переговорка Б', 5, 10);