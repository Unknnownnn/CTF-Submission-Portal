@echo off
REM CTF Collection - Complete Setup Script for Windows

echo CTF Collection - Complete Setup
echo ==================================
echo.

REM Backend setup
echo 1. Setting up Backend...
cd server

if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo. Please edit server\.env with your database credentials
)

echo Installing backend dependencies...
call npm install
echo. Backend dependencies installed

cd ..
echo.

REM Frontend setup
echo 2. Setting up Frontend...
cd client

if not exist .env.local (
    echo Creating .env.local...
    (
        echo REACT_APP_API_URL=http://localhost:5000/api
    ) > .env.local
    echo. .env.local created
)

echo Installing frontend dependencies...
call npm install
echo. Frontend dependencies installed

cd ..
echo.

echo ==================================
echo. Setup completed!
echo.
echo Next steps:
echo 1. Configure database:
echo    - Edit server\.env with your MySQL credentials
echo    - Run: mysql -u root -p ctf_collection ^< sql\schema.sql
echo.
echo 2. Start development servers:
echo    - Terminal 1: cd server ^& npm run dev
echo    - Terminal 2: cd client ^& npm start
echo.
echo 3. Access the application:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:5000/api
echo.
echo 4. For Docker setup, run: docker-compose up -d
