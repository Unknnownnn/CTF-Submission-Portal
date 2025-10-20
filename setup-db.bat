@echo off
REM CTF Collection - Database Setup Script for Windows

echo CTF Collection - Database Setup
echo ================================

REM Check if mysql is available
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: MySQL is not installed or not in PATH
    exit /b 1
)

REM Prompt for MySQL root password
setlocal enabledelayedexpansion
set /p DB_PASSWORD="Enter MySQL root password: "

REM Create database and tables
echo Creating database...
mysql -u root -p%DB_PASSWORD% < sql\schema.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Database setup completed successfully!
    echo.
    echo Next steps:
    echo 1. Configure .env files:
    echo    - server\.env with your database credentials
    echo 2. Start the backend: cd server ^& npm run dev
    echo 3. Start the frontend: cd client ^& npm start
) else (
    echo.
    echo Database setup failed
    exit /b 1
)
