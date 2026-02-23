ALTER TABLE rooms
    ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX idx_rooms_is_active ON rooms (is_active);

CREATE TABLE room_files
(
    id            UUID PRIMARY KEY,
    room_id       UUID         NOT NULL,
    file_key      VARCHAR(1024) NOT NULL UNIQUE,
    original_name VARCHAR(255) NOT NULL,
    content_type  VARCHAR(128) NOT NULL,
    size          BIGINT       NOT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_room_files_room FOREIGN KEY (room_id) REFERENCES rooms (id)
);

CREATE INDEX idx_room_files_room_id ON room_files (room_id);
