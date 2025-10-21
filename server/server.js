require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const pool = require('./config/database');

// Startup safety checks
const JWT_SECRET = process.env.JWT_SECRET || '';
if (!JWT_SECRET || JWT_SECRET === 'your_super_secret_key_change_this_in_production' || JWT_SECRET === 'your_secret') {
  console.error('FATAL: JWT_SECRET is not set to a secure value. Set JWT_SECRET in your environment before deploying.');
  // Exit early in non-development environments to avoid accidental insecure deployments
  if (process.env.NODE_ENV === 'production') process.exit(1);
}

const authRoutes = require('./routes/auth');
const submissionRoutes = require('./routes/submissions');
const adminRoutes = require('./routes/admin');

// Test database connection
const testDbConnection = async () => {
  console.log('Testing database connection, pool:', typeof pool, !!pool);
  if (!pool) {
    console.error('Pool is not defined, skipping database test');
    return;
  }
  try {
    await pool.execute('SELECT 1');
    console.log('Database connection established');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    // Don't exit, let the app start and retry connections
  }
};

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false
}));

// CORS configuration - applied early
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests) or 'null' origin
    if (!origin || origin === 'null') return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5000'
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Rate limiting (configurable via env vars)
// RATE_WINDOW_MIN: window size in minutes (default 15)
// RATE_MAX: global max requests per window (default 100)
// AUTH_MAX: auth-specific max requests per window (default 30)
const rateWindowMin = parseInt(process.env.RATE_WINDOW_MIN || '15', 10);
const rateMax = parseInt(process.env.RATE_MAX || '100', 10);
const authMax = parseInt(process.env.AUTH_MAX || '30', 10);
const windowMs = rateWindowMin * 60 * 1000;

// Respect reverse proxies (Docker, nginx) if explicitly enabled
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', true);
}

const limiter = rateLimit({
  windowMs,
  max: rateMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  handler: (req, res) => {
    const retryAfter = Math.ceil((windowMs - (Date.now() % windowMs)) / 1000);
    res.set('Retry-After', String(retryAfter));
    res.status(429).json({ error: 'Too many requests from this IP, please try again later.' });
  }
});

const authLimiter = rateLimit({
  windowMs,
  max: authMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  handler: (req, res) => {
    const retryAfter = Math.ceil((windowMs - (Date.now() % windowMs)) / 1000);
    res.set('Retry-After', String(retryAfter));
    res.status(429).json({ error: 'Too many authentication attempts, please try again later.' });
  }
});

// Middleware
app.use(limiter);
app.use('/api/auth', authLimiter);

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(fileUpload({
  limits: { fileSize: parseInt(process.env.MAX_UPLOAD_SIZE) || 209715200 },
  abortOnLimit: true,
  responseOnLimit: 'File size exceeds the maximum limit.',
  safeFileNames: true,
  preserveExtension: true,
}));

// Ensure submissions directory exists (handle absolute and relative env paths safely)
const submissionsEnv = process.env.SUBMISSIONS_PATH || 'submissions';
let submissionsPath;
if (path.isAbsolute(submissionsEnv)) {
  submissionsPath = submissionsEnv;
} else {
  // Resolve relative paths against the current working directory (container/app root)
  // This avoids resolving to filesystem root when __dirname's parent is '/'
  submissionsPath = path.resolve(process.cwd(), submissionsEnv);
}

console.log('Submissions directory resolved to:', submissionsPath);

try {
  if (!fs.existsSync(submissionsPath)) {
    fs.mkdirSync(submissionsPath, { recursive: true });
  }
} catch (err) {
  console.error(`Failed to ensure submissions directory (${submissionsPath}):`, err.message);
  // Re-throw so startup fails visibly when directory cannot be created due to permissions
  throw err;
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);

// Public sample writeup download (helps users create writeups)
app.get('/api/sample-walkthrough', (req, res) => {
  try {
    // Try multiple likely locations depending on build context
    const candidates = [
      path.join(__dirname, '..', 'Sample_Walkthrough.md'),
      path.join(__dirname, 'Sample_Walkthrough.md'),
      path.join(process.cwd(), 'Sample_Walkthrough.md')
    ];

    let samplePath = null;
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        samplePath = c;
        break;
      }
    }

    if (!samplePath) {
      // Fallback: send an embedded minimal sample markdown
      const fallback = `# Sample CTF Writeup\n\nUse the web UI to download the sample writeup or add a Sample_Walkthrough.md file to the server directory.`;
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      return res.send(fallback);
    }

    // Use res.download to set safe headers and stream file as attachment
    return res.download(samplePath, 'Sample_Walkthrough.md');
  } catch (err) {
    console.error('Error serving sample walkthrough:', err);
    return res.status(500).json({ error: 'Failed to download sample walkthrough' });
  }
});

// Serve raw markdown for in-app preview
app.get('/api/sample-walkthrough/raw', (req, res) => {
  try {
    const candidates = [
      path.join(__dirname, '..', 'Sample_Walkthrough.md'),
      path.join(__dirname, 'Sample_Walkthrough.md'),
      path.join(process.cwd(), 'Sample_Walkthrough.md')
    ];

    let samplePath = null;
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        samplePath = c;
        break;
      }
    }

    if (!samplePath) {
      const fallback = `# Sample CTF Writeup\n\nUse the web UI to download the sample writeup or add a Sample_Walkthrough.md file to the server directory.`;
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      return res.send(fallback);
    }

    const content = fs.readFileSync(samplePath, 'utf8');
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    return res.send(content);
  } catch (err) {
    console.error('Error serving sample walkthrough raw:', err);
    return res.status(500).json({ error: 'Failed to load sample walkthrough' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const status = err.status || 500;
  const message = isDevelopment ? err.message : 'Internal Server Error';

  // Log sensitive errors but don't expose them
  if (status === 500) {
    console.error('Internal server error details:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip
    });
  }

  res.status(status).json({
    error: message,
    ...(isDevelopment && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, async () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  await testDbConnection();
});
