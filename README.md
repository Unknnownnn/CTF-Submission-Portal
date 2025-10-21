# CTF Submission Portal

A full-stack web application for collecting CTF (Capture The Flag) submissions with file uploads, markdown writeups, and admin management.

## Features

- User registration and authentication (JWT)
- File upload with size limits and type validation
- Markdown writeup preview and download
- Admin dashboard for managing submissions
- Responsive dark theme UI
- CORS-enabled API for cross-origin requests

## Tech Stack

- **Backend**: Node.js, Express.js, MySQL, JWT, bcrypt
- **Frontend**: React, React Router, Axios
- **Deployment**: Nginx, PM2, Ubuntu

## Local Development

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- Git

### Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd CollectionPlat
```

2. Install dependencies:
```bash
npm install
npm run install-all
```

3. Setup MySQL database:
```bash
mysql -u root -p < sql/schema.sql
```

4. Configure environment:
```bash
cp server/.env.example server/.env
# Edit server/.env with your settings
```

5. Start development servers:
```bash
npm run dev  # Starts both frontend and backend
```

6. Open http://localhost:3000

## Production Deployment

### Automated Deployment

Use the provided `deploy.sh` script on a fresh Ubuntu droplet:

```bash
# As deploy user
chmod +x deploy.sh
./deploy.sh
```

### Manual Deployment

1. Install system packages:
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs build-essential git nginx certbot python3-certbot-nginx mysql-server
sudo npm install -g pm2@5
```

2. Clone repository:
```bash
cd /home/deploy
git clone <your-repo-url> CTF-Submission-Portal
cd CTF-Submission-Portal
```

3. Install dependencies:
```bash
cd server
npm ci --omit=dev
cd ../client
npm ci
npm run build
```

4. Setup database:
```bash
sudo mysql_secure_installation
sudo mysql -u root -p <<'SQL'
CREATE DATABASE ctf_collection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ctf_user'@'localhost' IDENTIFIED BY 'strong_db_password';
GRANT ALL PRIVILEGES ON ctf_collection.* TO 'ctf_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
SQL
mysql -u ctf_user -p ctf_collection < sql/schema.sql
```

5. Configure environment:
```bash
# Edit server/.env
PORT=5000
NODE_ENV=production
JWT_SECRET=your_long_random_secret_here
DB_HOST=127.0.0.1
DB_USER=ctf_user
DB_PASSWORD=strong_db_password
DB_NAME=ctf_collection
SUBMISSIONS_PATH=submissions
MAX_UPLOAD_SIZE=209715200
FRONTEND_URLS=http://your-ip,http://your.domain.com
```

6. Configure Nginx:
```bash
sudo cp nginx/ctf-collection /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/ctf-collection /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

7. Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd
```

8. Optional SSL:
```bash
sudo certbot --nginx -d your.domain.com
```

## Environment Variables

### Server (.env)

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (production/development)
- `JWT_SECRET`: JWT signing secret
- `DB_HOST`: MySQL host
- `DB_USER`: MySQL user
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: MySQL database name
- `SUBMISSIONS_PATH`: Path for file uploads
- `MAX_UPLOAD_SIZE`: Max upload size in bytes
- `FRONTEND_URLS`: Comma-separated allowed origins for CORS

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login user |
| GET | /api/auth/me | Yes | Get current user |
| POST | /api/submissions | Yes | Create submission |
| GET | /api/submissions/mine | Yes | List user submissions |
| GET | /api/submissions/:id | Yes | Get submission details |
| GET | /api/submissions/:id/writeup | Yes | Get writeup content |
| GET | /api/submissions/:id/download | Admin | Download submission |
| GET | /api/submissions | Admin | List all submissions |
| POST | /api/admin/make-admin | Admin | Promote user |

## Troubleshooting

### npm install hangs or fails

- Check disk space: `df -h`
- Clean npm cache: `npm cache clean --force`
- Skip optional dependencies: `npm install --no-optional`
- Check npm logs: `tail -n 200 ~/.npm/_logs/*`

### CORS errors

- Ensure `FRONTEND_URLS` in `.env` matches browser origin exactly
- Restart backend after `.env` changes: `pm2 restart CTF-Submission-Portal`

### Database connection fails

- Verify MySQL is running: `sudo systemctl status mysql`
- Check credentials in `.env`
- Test connection: `mysql -u ctf_user -p ctf_collection`

### Nginx issues

- Test config: `sudo nginx -t`
- Check logs: `sudo tail -n 200 /var/log/nginx/error.log`
- Reload config: `sudo systemctl reload nginx`

## License

ISC