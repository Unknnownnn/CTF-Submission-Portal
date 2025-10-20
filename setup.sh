#!/bin/bash

# CTF Collection - Complete Setup Script
# Sets up both backend and frontend

set -e

echo "CTF Collection - Complete Setup"
echo "=================================="
echo

# Backend setup
echo "1. Setting up Backend..."
cd server

if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✓ Please edit server/.env with your database credentials"
fi

echo "Installing backend dependencies..."
npm install
echo "✓ Backend dependencies installed"

cd ..
echo

# Frontend setup
echo "2. Setting up Frontend..."
cd client

if [ ! -f .env.local ]; then
    echo "Creating .env.local..."
    echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local
    echo "✓ .env.local created"
fi

echo "Installing frontend dependencies..."
npm install
echo "✓ Frontend dependencies installed"

cd ..
echo

echo "=================================="
echo "✓ Setup completed!"
echo
echo "Next steps:"
echo "1. Configure database:"
echo "   - Edit server/.env with your MySQL credentials"
echo "   - Run: mysql -u root -p ctf_collection < sql/schema.sql"
echo
echo "2. Start development servers:"
echo "   - Terminal 1: cd server && npm run dev"
echo "   - Terminal 2: cd client && npm start"
echo
echo "3. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5000/api"
echo
echo "4. For Docker setup, run: docker-compose up -d"
