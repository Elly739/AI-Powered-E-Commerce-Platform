-- Run this script as the PostgreSQL superuser (usually postgres).
-- It creates the application role and database used by local development.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ecommerce_user') THEN
    CREATE ROLE ecommerce_user LOGIN PASSWORD 'ecommerce_password';
  END IF;
END
$$;

ALTER ROLE ecommerce_user WITH PASSWORD 'ecommerce_password';

SELECT 'CREATE DATABASE ecommerce_db OWNER ecommerce_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ecommerce_db')\gexec

GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;