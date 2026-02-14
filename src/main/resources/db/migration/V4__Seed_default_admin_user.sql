INSERT INTO users (id, email, password)
VALUES (
           '11111111-1111-1111-1111-111111111111',
           'admin@roomflow.local',
           '$2a$10$YPLtU6hAVS4yTYzLDYKUae0uB/czXmikT5jp1ojpOIgLKzXfzZN7W'
       )
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'ROLE_ADMIN'
FROM users
WHERE email = 'admin@roomflow.local'
ON CONFLICT (user_id, role) DO NOTHING;
