#!/bin/bash

# CTF Submission Portal Deployment Script
# Run as deploy user on Ubuntu droplet

set -e  # Exit on any error

echo "Starting deployment..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js LTS (18.x)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential git nginx certbot python3-certbot-nginx mysql-server

# Install PM2 globally
sudo npm install -g pm2@5

# Clone or update repo
REPO_DIR="/home/deploy/CTF-Submission-Portal"
if [ ! -d "$REPO_DIR" ]; then
  git clone <your-repo-url> "$REPO_DIR"
fi
cd "$REPO_DIR"
git pull origin main

# Set ownership
sudo chown -R deploy:deploy "$REPO_DIR"

# Install server dependencies
cd server
npm ci --omit=dev

# Install and build client
cd ../client
npm ci
npm run build

# Setup MySQL
sudo mysql_secure_installation

sudo mysql -u root -p <<'SQL'
CREATE DATABASE ctf_collection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ctf_user'@'localhost' IDENTIFIED BY 'strong_db_password';
GRANT ALL PRIVILEGES ON ctf_collection.* TO 'ctf_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
SQL

mysql -u ctf_user -p ctf_collection < ../sql/schema.sql

# Create .env if not exists
if [ ! -f .env ]; then
  cat > .env <<EOF
PORT=5000
NODE_ENV=production
JWT_SECRET=your_long_random_secret_here
DB_HOST=127.0.0.1
DB_USER=ctf_user
DB_PASSWORD=strong_db_password
DB_NAME=ctf_collection
SUBMISSIONS_PATH=submissions
MAX_UPLOAD_SIZE=209715200
FRONTEND_URLS=http://139.59.74.221,http://your.domain.com
EOF
fi

# Configure Nginx
sudo tee /etc/nginx/sites-available/ctf-collection > /dev/null <<EOF
server {
    listen 80;
    server_name your.domain.com 139.59.74.221;

    root /home/deploy/CTF-Submission-Portal/client/build;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \$connection_upgrade;
    }

    location ~* \.(?:css|js|jpg|jpeg|gif|png|ico|svg|woff2?)\$ {
        try_files \$uri =404;
        expires 30d;
        add_header Cache-Control "public, must-revalidate";
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/ctf-collection /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Start with PM2
cd "$REPO_DIR"
pm2 stop CTF-Submission-Portal || true
pm2 delete CTF-Submission-Portal || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd

# Optional: SSL
# sudo certbot --nginx -d your.domain.com

echo "Deployment complete. Check http://your-ip-or-domain"