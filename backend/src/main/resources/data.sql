INSERT INTO app_user (id, email, password, name)
VALUES (1, 'test@example.com', 'dummy-password', 'Test User')
    ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, roles)
VALUES (1, 'GUEST')
    ON CONFLICT DO NOTHING;