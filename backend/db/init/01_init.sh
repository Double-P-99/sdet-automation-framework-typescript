#!/bin/bash
set -e

# ── Create databases ──────────────────────────────────────────────────────────
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE authdb;
    CREATE DATABASE ordersdb;
EOSQL
echo "Databases authdb and ordersdb created."

# ── Auth service schema (authdb) ──────────────────────────────────────────────
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "authdb" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    DO \$\$ BEGIN
        CREATE TYPE user_role AS ENUM ('customer', 'admin');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END \$\$;

    CREATE TABLE IF NOT EXISTS users (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email           VARCHAR(255) NOT NULL UNIQUE,
        hashed_password VARCHAR(255) NOT NULL,
        full_name       VARCHAR(255) NOT NULL,
        role            user_role NOT NULL DEFAULT 'customer',
        is_active       BOOLEAN NOT NULL DEFAULT TRUE,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);

    INSERT INTO users (id, email, hashed_password, full_name, role, is_active) VALUES
        (
            '00000000-0000-0000-0000-000000000001',
            'customer@test.com',
            '\$2b\$12\$wmpIw.eMDP/W7KCW6KX9xO3ulUjdwi40Zt.UMSoM8Vcb9z7bjTaqC',
            'Test Customer',
            'customer',
            TRUE
        ),
        (
            '00000000-0000-0000-0000-000000000002',
            'admin@test.com',
            '\$2b\$12\$wmpIw.eMDP/W7KCW6KX9xO3ulUjdwi40Zt.UMSoM8Vcb9z7bjTaqC',
            'Test Admin',
            'admin',
            TRUE
        )
    ON CONFLICT (email) DO NOTHING;
EOSQL
echo "authdb schema and seed applied."

# ── Orders service schema (ordersdb) ──────────────────────────────────────────
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "ordersdb" <<-EOSQL
    DO \$\$ BEGIN
        CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END \$\$;

    CREATE TABLE IF NOT EXISTS orders (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id      UUID NOT NULL,
        status       order_status NOT NULL DEFAULT 'PENDING',
        total_amount NUMERIC(12, 2) NOT NULL,
        currency     CHAR(3) NOT NULL DEFAULT 'USD',
        notes        TEXT,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id   VARCHAR(255) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity     INTEGER NOT NULL CHECK (quantity > 0),
        unit_price   NUMERIC(10, 2) NOT NULL CHECK (unit_price > 0),
        subtotal     NUMERIC(12, 2) NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_orders_user_id        ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status         ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id  ON order_items(order_id);
EOSQL
echo "ordersdb schema applied."
