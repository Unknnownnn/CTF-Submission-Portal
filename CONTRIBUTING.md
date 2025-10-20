# CTF Collection - Contributing Guide

## Development Setup

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Git

### Local Development

1. **Clone and setup**:
   ```bash
   ./setup.sh  # Linux/Mac
   # or
   setup.bat   # Windows
   ```

2. **Configure environment variables**:
   ```bash
   # Backend
   cp server/.env.example server/.env
   # Edit server/.env with your database credentials

   # Frontend
   echo "REACT_APP_API_URL=http://localhost:5000/api" > client/.env.local
   ```

3. **Setup database**:
   ```bash
   mysql -u root -p ctf_collection < sql/schema.sql
   ```

4. **Start development servers**:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm start
   ```

## Project Structure

### Backend (`server/`)
- `server.js` - Express app entry point
- `routes/` - API endpoints
- `middleware/` - Authentication and validation
- `config/` - Database configuration

### Frontend (`client/`)
- `src/pages/` - Page components
- `src/components/` - Reusable components
- `src/context/` - React context (auth state)
- `src/styles/` - CSS files
- `src/api.js` - Axios client setup

### Database (`sql/`)
- `schema.sql` - Database schema and initial data

## Code Style

### Backend (Express.js)
- Use ES6+ syntax
- Use async/await for async operations
- Use descriptive variable names
- Add JSDoc comments for complex functions

### Frontend (React)
- Functional components with hooks
- Use camelCase for variables and functions
- Use PascalCase for component names
- Keep components small and focused
- Use CSS modules or CSS files for styling

## Testing

### API Testing
```bash
# Using the test script
./test-api.sh

# Or manual curl
curl http://localhost:5000/api/health
```

### Frontend Testing
```bash
cd client
npm test
```

## Common Tasks

### Add a new API endpoint
1. Create route handler in `server/routes/`
2. Add validation with express-validator
3. Test with curl or Postman
4. Document in README.md

### Add a new page
1. Create component in `client/src/pages/`
2. Add route in `client/src/App.js`
3. Update navbar if needed in `client/src/components/Navbar.js`
4. Create associated CSS file in `client/src/styles/`

### Update database schema
1. Modify `sql/schema.sql`
2. Re-run: `mysql -u root -p ctf_collection < sql/schema.sql`
3. Restart backend

## Deployment

### Using Docker
```bash
docker-compose up -d
```

### Manual deployment
1. Build frontend: `cd client && npm run build`
2. Configure environment variables
3. Start backend: `cd server && npm start`
4. Serve frontend build files via web server

## Troubleshooting

### Issue: API connection refused
- Check backend is running on port 5000
- Verify REACT_APP_API_URL in .env.local

### Issue: Database connection error
- Check MySQL is running
- Verify credentials in .env
- Run `mysql -u root -p -e "SHOW DATABASES"`

### Issue: Port already in use
- Change PORT in .env
- Or kill existing process

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add description of changes"

# Push to remote
git push origin feature/your-feature-name

# Create pull request
```
