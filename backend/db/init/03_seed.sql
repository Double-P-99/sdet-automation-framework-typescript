-- Seed data for testing
-- NOTE: passwords are bcrypt hashes of "Test@12345"

-- =====================
-- authdb seed
-- =====================

INSERT INTO users (id, email, hashed_password, full_name, role, is_active)
VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        'customer@test.com',
        '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',  -- Test@12345
        'Test Customer',
        'customer',
        TRUE
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'admin@test.com',
        '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',  -- Test@12345
        'Test Admin',
        'admin',
        TRUE
    )
ON CONFLICT (email) DO NOTHING;
