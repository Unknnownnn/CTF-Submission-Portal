require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const submissionRoutes = require('./routes/submissions');
const adminRoutes = require('./routes/admin');

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
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth attempts per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(limiter);
app.use('/api/auth', authLimiter);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(fileUpload({
  limits: { fileSize: parseInt(process.env.MAX_UPLOAD_SIZE) || 209715200 },
  abortOnLimit: true,
  responseOnLimit: 'File size exceeds the maximum limit.',
  safeFileNames: true,
  preserveExtension: true,
}));

// Ensure submissions directory exists
const submissionsPath = path.join(__dirname, '..', process.env.SUBMISSIONS_PATH || 'submissions');
if (!fs.existsSync(submissionsPath)) {
  fs.mkdirSync(submissionsPath, { recursive: true });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);

// Public sample writeup download (helps users create writeups)
app.get('/api/sample-walkthrough', (req, res) => {
  try {
    const samplePath = path.join(__dirname, '..', 'Sample_Walkthrough.md');
    if (!fs.existsSync(samplePath)) {
      return res.status(404).json({ error: 'Sample walkthrough not found' });
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
    const samplePath = path.join(__dirname, '..', 'Sample_Walkthrough.md');
    if (!fs.existsSync(samplePath)) {
      return res.status(404).json({ error: 'Sample walkthrough not found' });
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
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
