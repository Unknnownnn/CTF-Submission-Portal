#!/bin/bash

# CTF Collection - Database Setup Script
# This script creates the MySQL database and tables

set -e

echo "CTF Collection - Database Setup"
echo "================================"

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "Error: MySQL is not installed or not in PATH"
    exit 1
fi

# Prompt for MySQL root password
read -sp "Enter MySQL root password: " DB_PASSWORD
echo

# Create database and tables
echo "Creating database..."
mysql -u root -p"$DB_PASSWORD" < sql/schema.sql

if [ $? -eq 0 ]; then
    echo "✓ Database setup completed successfully!"
    echo
    echo "Next steps:"
    echo "1. Configure .env files:"
    echo "   - server/.env with your database credentials"
    echo "2. Start the backend: cd server && npm run dev"
    echo "3. Start the frontend: cd client && npm start"
else
    echo "✗ Database setup failed"
    exit 1
fi
