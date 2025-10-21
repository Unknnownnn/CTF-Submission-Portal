# CTF Collection Platform# CTF Collection Platform# CTF Submission Collection Web App



A modern, terminal-themed platform for collecting and managing CTF (Capture The Flag) submissions with file uploads, markdown writeups, and admin capabilities.



## FeaturesA modern, terminal-themed platform for collecting and managing CTF (Capture The Flag) submissions with file uploads, markdown writeups, and admin capabilities.A secure dark-themed web application to collect CTF challenge packages and writeups from authenticated VIT students.



- **Terminal-themed UI** with glitch effects and dark theme

- **User authentication** with @vitstudent.ac.in email validation

- **File upload** support for CTF submissions## Features## Features

- **Markdown writeup** validation and rendering

- **Admin dashboard** for managing all submissions

- **Download functionality** (individual files and ZIP archives)

- **Sample walkthrough** download feature- **Terminal-themed UI** with glitch effects and dark theme- ✅ **Secure Authentication**: Register/login with @vitstudent.ac.in email

- **Responsive design** for mobile and desktop

- **User authentication** with @vitstudent.ac.in email validation- ✅ **CTF Submissions**: Upload files or external links with markdown writeups

## Tech Stack

- **File upload** support for CTF submissions- ✅ **File Storage**: Server-side storage under `submissions/` folder

- **Frontend**: React 18 + React Router + Axios

- **Backend**: Node.js + Express.js- **Markdown writeup** validation and rendering- ✅ **Admin Dashboard**: List, preview, and download submissions

- **Database**: MySQL 8.0

- **File Storage**: Local filesystem- **Admin dashboard** for managing all submissions- ✅ **Dark Theme UI**: Modern dark interface with responsive design

- **Authentication**: JWT (JSON Web Tokens)

- **Security**: bcrypt password hashing- **Download functionality** (individual files and ZIP archives)- ✅ **Progress Tracking**: Upload progress indicators



## Quick Start with Docker Compose- **Sample walkthrough** download feature- ✅ **Input Validation**: Email domain, file type, and form validation



The easiest way to get started is using Docker Compose, which sets up the entire stack automatically.- **Responsive design** for mobile and desktop



### Prerequisites## Tech Stack



- [Docker](https://docs.docker.com/get-docker/)## Quick Start with Docker Compose

- [Docker Compose](https://docs.docker.com/compose/install/)

- **Frontend**: React 18 + React Router + Axios

### Setup

The easiest way to get started is using Docker Compose, which sets up the entire stack automatically.- **Backend**: Node.js + Express.js

1. **Clone the repository:**

   ```bash- **Database**: MySQL 8.0

   git clone <repository-url>

   cd CollectionPlat### Prerequisites- **File Storage**: Local filesystem

   ```

- **Authentication**: JWT (JSON Web Tokens)

2. **Start all services:**

   ```bash- [Docker](https://docs.docker.com/get-docker/)- **Security**: bcrypt password hashing

   docker-compose up --build

   ```- [Docker Compose](https://docs.docker.com/compose/install/)



   Or use the automated setup script:## Project Structure

   ```bash

   # Windows### Setup

   .\setup-docker.bat

```

   # Linux/Mac

   ./setup-docker.sh1. **Clone the repository:**CollectionPlat/

   ```

   ```bash├── server/                 # Express backend

   This will:

   - Build the React frontend   git clone <repository-url>│   ├── config/

   - Build the Express.js backend

   - Set up MySQL database with schema   cd CollectionPlat│   │   └── database.js    # MySQL connection pool

   - Mount the submissions volume

   ```│   ├── routes/

3. **Access the application:**

   - Frontend: http://localhost:3000│   │   ├── auth.js        # Authentication endpoints

   - Backend API: http://localhost:5000

   - Database: localhost:3307 (MySQL)2. **Start all services:**│   │   ├── submissions.js # Submission CRUD



### First Time Setup   ```bash│   │   └── admin.js       # Admin operations



1. **Register an admin user:**   docker-compose up --build│   ├── middleware/

   - Go to http://localhost:3000/register

   - Use an email ending with `@vitstudent.ac.in`   ```│   │   └── auth.js        # JWT validation

   - Register and login

│   ├── server.js          # Express app setup

2. **Promote to admin (optional):**

   - Access the admin promotion endpoint or use the database directly   This will:│   ├── package.json



## Manual Development Setup   - Build the React frontend│   ├── .env.example



If you prefer to run services individually:   - Build the Express.js backend│   └── Dockerfile



### Backend Setup   - Set up MySQL database with schema├── client/                # React frontend



```bash   - Mount the submissions volume│   ├── src/

cd server

npm install│   │   ├── pages/         # Page components

cp .env.example .env  # Configure your environment variables

npm run dev3. **Access the application:**│   │   ├── components/    # Reusable components

```

   - Frontend: http://localhost:3000│   │   ├── context/       # Auth context

### Frontend Setup

   - Backend API: http://localhost:5000│   │   ├── styles/        # CSS files

```bash

cd client   - Database: localhost:3307 (MySQL)│   │   ├── api.js         # Axios client

npm install

npm start│   │   └── App.js

```

### First Time Setup│   ├── public/

### Database Setup

│   └── package.json

```bash

# Using Docker1. **Register an admin user:**├── sql/

docker run --name mysql-ctf -e MYSQL_ROOT_PASSWORD=rootpassword -e MYSQL_DATABASE=ctf_collection -p 3307:3306 -d mysql:8.0

   - Go to http://localhost:3000/register│   └── schema.sql         # Database schema

# Or using local MySQL

mysql -u root -p < sql/schema.sql   - Use an email ending with `@vitstudent.ac.in`├── submissions/           # File storage directory

```

   - Register and login├── docker-compose.yml

## Environment Variables

└── README.md

### Backend (.env)

2. **Promote to admin (optional):**```

```env

PORT=5000   - Access the admin promotion endpoint or use the database directly

NODE_ENV=development

DB_HOST=mysql## Setup Instructions

DB_USER=root

DB_PASSWORD=rootpassword## Manual Development Setup

DB_NAME=ctf_collection

DB_PORT=3306### Option 1: Native Linux/Windows Setup

JWT_SECRET=your_super_secret_key_change_this_in_production

JWT_EXPIRE=7dIf you prefer to run services individually:

MAX_UPLOAD_SIZE=209715200

SUBMISSIONS_PATH=./submissions#### Prerequisites

```

### Backend Setup- Node.js 18+

### Frontend

- MySQL 8.0+

```env

REACT_APP_API_URL=http://localhost:5000/api```bash- npm or yarn

```

cd server

## API Endpoints

npm install#### Backend Setup

| Method | Endpoint | Auth | Description |

|--------|----------|------|-------------|cp .env.example .env  # Configure your environment variables

| POST | /api/auth/register | No | Register user |

| POST | /api/auth/login | No | Login user |npm run dev1. **Create MySQL Database**:

| GET | /api/auth/me | Yes | Get current user |

| POST | /api/submissions | Yes | Create submission |```   ```bash

| GET | /api/submissions/mine | Yes | List user submissions |

| GET | /api/submissions/:id | Yes | Get submission details |   mysql -u root -p -e "CREATE DATABASE ctf_collection;"

| GET | /api/submissions/:id/writeup | Yes | Get writeup content |

| GET | /api/submissions/:id/download | Admin | Download submission |### Frontend Setup   mysql -u root -p ctf_collection < sql/schema.sql

| GET | /api/submissions | Admin | List all submissions |

| POST | /api/admin/make-admin | Admin | Promote user |   ```



## Project Structure```bash



```cd client2. **Configure Environment**:

CollectionPlat/

├── client/              # React frontendnpm install   ```bash

│   ├── public/

│   ├── src/npm start   cd server

│   │   ├── components/  # Reusable components

│   │   ├── pages/       # Page components```   cp .env.example .env

│   │   ├── context/     # React context

│   │   ├── hooks/       # Custom hooks   ```

│   │   └── styles/      # CSS styles

│   └── Dockerfile### Database Setup   Edit `.env` and update:

├── server/              # Express.js backend

│   ├── routes/          # API routes   - `DB_PASSWORD` - your MySQL root password

│   ├── middleware/      # Custom middleware

│   ├── config/          # Database config```bash   - `JWT_SECRET` - generate a strong secret key

│   └── Dockerfile

├── sql/                 # Database schema# Using Docker

├── submissions/         # File storage

├── docker-compose.yml   # Docker setupdocker run --name mysql-ctf -e MYSQL_ROOT_PASSWORD=rootpassword -e MYSQL_DATABASE=ctf_collection -p 3307:3306 -d mysql:8.03. **Install Dependencies & Start**:

└── README.md

```   ```bash



## Docker Commands# Or using local MySQL   npm install



```bashmysql -u root -p < sql/schema.sql   npm run dev

# Start services

docker-compose up```   ```



# Start in background   Server runs on `http://localhost:5000`

docker-compose up -d

## Environment Variables

# Stop services

docker-compose down#### Frontend Setup



# Rebuild and start### Backend (.env)

docker-compose up --build

1. **Configure Environment**:

# View logs

docker-compose logs```env   ```bash



# View logs for specific serviceNODE_ENV=development   cd client

docker-compose logs app

docker-compose logs clientDB_HOST=localhost   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local

docker-compose logs mysql

```DB_USER=root   ```



## TroubleshootingDB_PASSWORD=rootpassword



### Common IssuesDB_NAME=ctf_collection2. **Install Dependencies & Start**:



1. **Port conflicts:**DB_PORT=3307   ```bash

   - Change ports in `docker-compose.yml` if 3000, 5000, or 3307 are in use

JWT_SECRET=your_super_secret_key_change_this_in_production   npm install

2. **Database connection issues:**

   - Ensure MySQL container is healthy: `docker-compose ps`SUBMISSIONS_PATH=./submissions   npm start

   - Check logs: `docker-compose logs mysql`

PORT=5000   ```

3. **File upload issues:**

   - Check submissions volume permissions```   App runs on `http://localhost:3000`

   - Ensure SUBMISSIONS_PATH is correctly set



4. **CORS issues:**

   - Verify REACT_APP_API_URL points to correct backend URL### Frontend### Option 2: Docker Compose Setup



### Database Reset



```bash```env1. **Configure Environment**:

# Stop services

docker-compose downREACT_APP_API_URL=http://localhost:5000/api   ```bash



# Remove database volume```   cd server

docker volume rm collectionplat_mysql_data

   cp .env.example .env

# Restart

docker-compose up --build## API Endpoints   # Edit .env - set DB_PASSWORD and JWT_SECRET

```

   ```

## Security Notes

| Method | Endpoint | Auth | Description |

- Change `JWT_SECRET` in production

- Use strong database passwords|--------|----------|------|-------------|2. **Start Services**:

- Configure proper CORS origins

- Enable HTTPS in production| POST | /api/auth/register | No | Register user |   ```bash

- Regularly update dependencies

| POST | /api/auth/login | No | Login user |   docker-compose up -d

## Contributing

| GET | /api/auth/me | Yes | Get current user |   ```

1. Fork the repository

2. Create a feature branch| POST | /api/submissions | Yes | Create submission |

3. Make your changes

4. Test with Docker Compose| GET | /api/submissions/mine | Yes | List user submissions |3. **Access Application**:

5. Submit a pull request

| GET | /api/submissions/:id | Yes | Get submission details |   - Frontend: `http://localhost:3000`

## License

| GET | /api/submissions/:id/writeup | Yes | Get writeup content |   - Backend: `http://localhost:5000`

ISC License
| GET | /api/submissions/:id/download | Admin | Download submission |   - MySQL: `localhost:3306`

| GET | /api/submissions | Admin | List all submissions |

| POST | /api/admin/make-admin | Admin | Promote user |4. **Stop Services**:

   ```bash

## Project Structure   docker-compose down

   ```

```

CollectionPlat/## API Endpoints

├── client/              # React frontend

│   ├── public/### Authentication

│   ├── src/- `POST /api/auth/register` - Register new user

│   │   ├── components/  # Reusable components- `POST /api/auth/login` - Login user

│   │   ├── pages/       # Page components- `GET /api/auth/me` - Get current user

│   │   ├── context/     # React context

│   │   ├── hooks/       # Custom hooks### Submissions

│   │   └── styles/      # CSS styles- `POST /api/submissions` - Create submission (requires auth)

│   └── Dockerfile- `GET /api/submissions/mine` - List user's submissions

├── server/              # Express.js backend- `GET /api/submissions/:id` - Get submission details

│   ├── routes/          # API routes- `GET /api/submissions/:id/writeup` - Get writeup content

│   ├── middleware/      # Custom middleware- `GET /api/submissions/:id/download` - Download submission (admin only)

│   ├── config/          # Database config- `GET /api/submissions` - List all submissions (admin only)

│   └── Dockerfile

├── sql/                 # Database schema### Admin

├── submissions/         # File storage- `POST /api/admin/make-admin` - Promote user to admin (admin only)

└── docker-compose.yml   # Docker setup

```## Database Schema



## Development### users table

```sql

### Running Tests- id (INT, PRIMARY KEY)

- name (VARCHAR)

```bash- email (VARCHAR, UNIQUE, must end with @vitstudent.ac.in)

# Backend tests- password_hash (VARCHAR)

cd server- is_admin (BOOLEAN, DEFAULT FALSE)

npm test- created_at (TIMESTAMP)

```

# Frontend tests

cd client### submissions table

npm test```sql

```- id (INT, PRIMARY KEY)

- user_id (INT, FOREIGN KEY)

### Building for Production- title (VARCHAR)

- description (TEXT)

```bash- file_path (VARCHAR) - relative path to uploaded file

# Build frontend- external_link (VARCHAR) - external challenge URL

cd client- writeup_path (VARCHAR) - path to markdown writeup

npm run build- flag_answer (VARCHAR) - FLAG submission

- created_at (TIMESTAMP)

# Build backend```

cd server

npm run build## File Storage Layout

```

```

## Docker Commandssubmissions/

└── {submission_id}/

```bash    ├── original_file.ext     (optional - uploaded challenge)

# Start services    ├── writeup.md            (required - markdown file)

docker-compose up    └── meta.json             (auto-generated metadata)

```

# Start in background

docker-compose up -d## Validation Rules



# Stop services- **Email**: Must match `^[A-Za-z0-9._%+-]+@vitstudent\.ac\.in$`

docker-compose down- **Password**: Minimum 8 characters

- **Writeup**: Must be `.md` file

# Rebuild and start- **File or Link**: At least one required (file upload OR external_link)

docker-compose up --build- **Max Upload Size**: 200MB (configurable)



# View logs## Security Features

docker-compose logs

- ✅ Password hashing with bcrypt

# View logs for specific service- ✅ JWT token-based authentication

docker-compose logs app- ✅ Path traversal prevention

docker-compose logs client- ✅ File upload validation

docker-compose logs mysql- ✅ Role-based access control (admin)

```- ✅ CORS enabled

- ✅ Input validation with express-validator

## Troubleshooting

## Creating Admin User

### Common Issues

### Option 1: Using API

1. **Port conflicts:**```bash

   - Change ports in `docker-compose.yml` if 3000, 5000, or 3307 are in use# First create a regular user account, then use admin endpoint

curl -X POST http://localhost:5000/api/admin/make-admin \

2. **Database connection issues:**  -H "Authorization: Bearer <admin_token>" \

   - Ensure MySQL container is healthy: `docker-compose ps`  -H "Content-Type: application/json" \

   - Check logs: `docker-compose logs mysql`  -d '{"email":"user@vitstudent.ac.in"}'

```

3. **File upload issues:**

   - Check submissions volume permissions### Option 2: Direct Database

   - Ensure SUBMISSIONS_PATH is correctly set```bash

mysql -u root -p ctf_collection

4. **CORS issues:**UPDATE users SET is_admin = TRUE WHERE email = 'user@vitstudent.ac.in';

   - Verify REACT_APP_API_URL points to correct backend URL```



### Database Reset## Environment Variables



```bash### Backend (.env)

# Stop services```

docker-compose downPORT=5000

NODE_ENV=development

# Remove database volume

docker volume rm collectionplat_mysql_dataDB_HOST=localhost

DB_USER=root

# RestartDB_PASSWORD=your_password_here

docker-compose up --buildDB_NAME=ctf_collection

```DB_PORT=3306



## Security NotesJWT_SECRET=your_super_secret_key_change_this_in_production

JWT_EXPIRE=7d

- Change `JWT_SECRET` in production

- Use strong database passwordsMAX_UPLOAD_SIZE=209715200

- Configure proper CORS originsSUBMISSIONS_PATH=./submissions

- Enable HTTPS in production```

- Regularly update dependencies

### Frontend (.env.local)

## Contributing```

REACT_APP_API_URL=http://localhost:5000/api

1. Fork the repository```

2. Create a feature branch

3. Make your changes## Usage Guide

4. Test with Docker Compose

5. Submit a pull request### For Users



## License1. **Register**: Visit landing page, click "Get Started"

   - Use your VIT email (@vitstudent.ac.in)

ISC License   - Set a strong password (min 8 characters)

2. **Submit CTF**: From dashboard, click "New Submission"
   - Enter challenge title
   - Upload file OR provide external link
   - Upload writeup (.md file)
   - Enter the flag answer
   - Submit

3. **View Submissions**: Dashboard shows all your submissions
   - Click "View" to see details and writeup

### For Admins

1. **Admin Access**: Click "Admin" in navbar
2. **Browse Submissions**: View all submissions in paginated table
3. **Preview Writeup**: Click "View" for full submission details
4. **Download**: Click "Download" to get submission as ZIP
5. **Promote Users**: Use API endpoint to make admins

## Troubleshooting

### MySQL Connection Error
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1"

# Verify credentials in .env
# Check database exists
mysql -u root -p -e "SHOW DATABASES"
```

### Port Already in Use
```bash
# Change PORT in .env or docker-compose.yml
# Or kill existing process on port
# Linux/Mac: lsof -ti:5000 | xargs kill
# Windows: netstat -ano | findstr :5000
```

### Upload Fails
- Check `submissions/` directory permissions
- Verify `MAX_UPLOAD_SIZE` in .env
- Check disk space

## Development Notes

- Token expires in 7 days (configurable via JWT_EXPIRE)
- Submissions are immutable (no edit endpoint)
- File names are sanitized to prevent path traversal
- Markdown writeups support GitHub Flavored Markdown (GFM)

## License

MIT
# #   T e s t i n g   t h e   S e t u p 
 
 A f t e r   s t a r t i n g   t h e   s e r v i c e s   w i t h   D o c k e r   C o m p o s e ,   y o u   c a n   t e s t   t h a t   e v e r y t h i n g   i s   w o r k i n g : 
 
 ` ` ` b a s h 
 #   W i n d o w s 
 . \ t e s t - s e t u p . b a t 
 
 #   L i n u x / M a c 
 . / t e s t - s e t u p . s h 
 ` ` ` 
 
 T h i s   w i l l   c h e c k : 
 -   C o n t a i n e r   s t a t u s 
 -   B a c k e n d   h e a l t h   e n d p o i n t 
 -   F r o n t e n d   a c c e s s i b i l i t y 
 -   S a m p l e   w a l k t h r o u g h   d o w n l o a d  
 