#!/bin/bash
set -e

# Create both microservice databases
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE authdb;
    CREATE DATABASE ordersdb;
EOSQL

echo "Databases authdb and ordersdb created."
