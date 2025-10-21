#!/bin/bash

echo "Setting up CTF Collection Platform with Docker Compose..."
echo

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "ERROR: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
COMPOSE_CMD=""
if command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
elif docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    echo "ERROR: Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

echo "Building and starting services..."
$COMPOSE_CMD up --build -d

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to start services. Check the logs above for details."
    exit 1
fi

echo
echo "Services are starting up. This may take a few minutes..."
echo
echo "Once all services are healthy, you can access:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:5000"
echo "- Database: localhost:3307 (MySQL)"
echo
echo "To view logs: $COMPOSE_CMD logs -f"
echo "To stop services: $COMPOSE_CMD down"
echo