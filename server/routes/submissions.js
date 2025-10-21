const express = require('express');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;
const archiver = require('archiver');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const submissionsPath = path.join(__dirname, '..', '..', process.env.SUBMISSIONS_PATH || 'submissions');

// POST: Create new submission
router.post('/', authenticateToken, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('flag').trim().notEmpty().withMessage('Flag is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, external_link } = req.body;

  // Validate that either file or external_link is provided
  if (!req.files || !req.files.file) {
    if (!external_link) {
      return res.status(400).json({ error: 'Either file upload or external link is required' });
    }
  }

  // Validate writeup file
  if (!req.files || !req.files.writeup) {
    return res.status(400).json({ error: 'Writeup (markdown file) is required' });
  }

  const writeupFile = req.files.writeup;
  // Case-insensitive extension check
  if (!writeupFile.name.toLowerCase().endsWith('.md')) {
    return res.status(400).json({ error: 'Writeup must be a .md file' });
  }
  // Optional: check MIME type if available (not all clients set it reliably)
  // if (writeupFile.mimetype && writeupFile.mimetype !== 'text/markdown' && writeupFile.mimetype !== 'text/plain') {
  //   return res.status(400).json({ error: 'Invalid writeup file type' });
  // }

  try {
    const submissionId = crypto.randomUUID();
    const submissionDir = path.join(submissionsPath, submissionId);
    
    // Create submission directory
    await fs.mkdir(submissionDir, { recursive: true });

    let filePath = null;
    let originalFilename = null;

    // Handle file upload if provided
    if (req.files && req.files.file) {
      const file = req.files.file;
      // Sanitize filename to prevent path traversal and XSS
      originalFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      // Additional check for path traversal
      if (originalFilename.includes('..') || originalFilename.includes('/') || originalFilename.includes('\\')) {
        return res.status(400).json({ error: 'Invalid filename' });
      }
      filePath = path.join(submissionDir, originalFilename);
      await file.mv(filePath);
      filePath = path.join(submissionId, originalFilename); // Store relative path
    }

    // Save writeup
    const writeupPath = path.join(submissionDir, 'writeup.md');
    await writeupFile.mv(writeupPath);

    // Save metadata
    const metaPath = path.join(submissionDir, 'meta.json');
    const metadata = {
      title,
      user_id: req.user.id,
      original_filename: originalFilename,
      uploaded_at: new Date().toISOString(),
      external_link: external_link || null,
    };
    await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2));

    // Save to database
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO submissions (user_id, title, description, file_path, external_link, writeup_path, flag_answer) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        req.user.id,
        title,
        description || null,
        filePath,
        external_link || null,
        path.join(submissionId, 'writeup.md'),
        req.body.flag,
      ]
    );

    // Calculate and store filename
    const dbId = result.insertId;
    const [userResult] = await connection.execute('SELECT name FROM users WHERE id = ?', [req.user.id]);
    const userName = userResult[0].name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `submission_${dbId}_${userName}.zip`;
    await connection.execute('UPDATE submissions SET filename = ? WHERE id = ?', [filename, dbId]);

    connection.release();

    res.status(201).json({
      success: true,
      submission: {
        id: dbId,
        submission_uuid: submissionId,
        title,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Submission creation error:', error);
    res.status(500).json({ error: 'Failed to create submission' });
  }
});

// GET: List user's submissions
router.get('/mine', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [submissions] = await connection.execute(
      'SELECT id, title, description, created_at FROM submissions WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    connection.release();

    res.json({ submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// GET: Get submission details (admin or owner)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [submissions] = await connection.execute(
      `SELECT s.id, s.user_id, s.title, s.description, s.file_path, s.external_link, s.writeup_path, s.flag_answer, s.filename, s.created_at, u.name, u.email
       FROM submissions s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ?`,
      [req.params.id]
    );
    connection.release();

    if (submissions.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const submission = submissions[0];

    // Check authorization
    if (submission.user_id !== req.user.id && !req.user.is_admin) {
      console.log(`Unauthorized access attempt: User ${req.user.id} tried to access submission ${req.params.id} owned by ${submission.user_id}`);
      return res.status(403).json({ error: 'Not authorized to view this submission' });
    }

    res.json({ submission });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

// GET: Preview writeup
router.get('/:id/writeup', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [submissions] = await connection.execute(
      'SELECT user_id, writeup_path FROM submissions WHERE id = ?',
      [req.params.id]
    );
    connection.release();

    if (submissions.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const submission = submissions[0];

    // Check authorization
    if (submission.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const writeupPath = path.join(submissionsPath, submission.writeup_path);
    const content = await fs.readFile(writeupPath, 'utf-8');

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(content);
  } catch (error) {
    console.error('Get writeup error:', error);
    res.status(500).json({ error: 'Failed to fetch writeup' });
  }
});

// GET: Download file or zip
router.get('/:id/download', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [submissions] = await connection.execute(
      `SELECT s.file_path, s.writeup_path, s.flag_answer, s.description, u.name, u.email
       FROM submissions s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ?`,
      [req.params.id]
    );
    connection.release();

    if (submissions.length === 0) {
      console.log(`Download: Submission ${req.params.id} not found in database`);
      return res.status(404).json({ error: 'Submission not found' });
    }

    const submission = submissions[0];

    // Extract directory name from writeup_path (format: uuid/writeup.md)
    const submissionDirName = submission.writeup_path.split('/')[0];
    const submissionDir = path.join(submissionsPath, submissionDirName);

    console.log(`Download: Looking for submission directory: ${submissionDir}`);

    // Check if directory exists
    const exists = await fs.stat(submissionDir).catch(() => null);
    if (!exists) {
      console.log(`Download: Submission directory ${submissionDir} does not exist`);
      return res.status(404).json({ error: 'Submission files not found' });
    }

    // Create flag.txt file with FLAG and description
    const flagFilePath = path.join(submissionDir, 'flag.txt');
    let flagContent = `FLAG: ${submission.flag_answer}\n`;
    if (submission.description) {
      flagContent += `\nDescription: ${submission.description}\n`;
    }
    await fs.writeFile(flagFilePath, flagContent, 'utf8');

    // Create link.txt if external link exists (and no file was uploaded)
    if (submission.external_link && !submission.file_path) {
      const linkFilePath = path.join(submissionDir, 'link.txt');
      const linkContent = `External Link:\n${submission.external_link}\n`;
      await fs.writeFile(linkFilePath, linkContent, 'utf8');
    }

    // Create ZIP archive with user name in filename
    const userName = submission.name.replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize username
    const zipFileName = `submission_${req.params.id}_${userName}.zip`;

    console.log(`Download: Creating ZIP archive: ${zipFileName}`);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${zipFileName}`);
    res.setHeader('X-Filename', zipFileName);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to create archive' });
      }
    });

    archive.pipe(res);
    archive.directory(submissionDir, false);
    await archive.finalize();

    // Clean up flag.txt after sending (optional)
    setTimeout(() => {
      fs.unlink(flagFilePath).catch(() => {});
    }, 1000);

  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download' });
    }
  }
});

// DELETE: Delete submission (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Get submission info before deleting
    const [submissions] = await connection.execute(
      'SELECT writeup_path, file_path FROM submissions WHERE id = ?',
      [req.params.id]
    );

    if (submissions.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Submission not found' });
    }

    const submission = submissions[0];

    // Delete from database
    await connection.execute('DELETE FROM submissions WHERE id = ?', [req.params.id]);
    connection.release();

    // Delete files from filesystem - extract directory name from writeup_path
    const submissionDirName = submission.writeup_path.split('/')[0];
    const submissionDir = path.join(submissionsPath, submissionDirName);
    try {
      await fs.rm(submissionDir, { recursive: true, force: true });
    } catch (fileError) {
      console.warn('Failed to delete submission files:', fileError);
      // Don't fail the request if file deletion fails
    }

    res.json({ success: true, message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ error: 'Failed to delete submission' });
  }
});

// GET: List all submissions (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;
    const offset = (page - 1) * perPage;

    const connection = await pool.getConnection();

    // Get total count
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM submissions');
    const total = countResult[0].total;

    // Get paginated submissions
    // MySQL prepared statements don't reliably accept OFFSET as a separate placeholder in some drivers.
    // Use LIMIT offset, count (LIMIT ?, ?) and pass integers explicitly to avoid ER_WRONG_ARGUMENTS.
    const safePerPage = Number.isFinite(perPage) ? perPage : 10;
    const safeOffset = Number.isFinite(offset) ? offset : 0;
    const sql = `SELECT s.id, s.title, s.user_id, u.name, u.email, s.created_at, s.external_link, s.file_path, s.filename
       FROM submissions s
       JOIN users u ON s.user_id = u.id
       ORDER BY s.created_at DESC
       LIMIT ${safeOffset}, ${safePerPage}`;

    console.log('List submissions SQL:', sql);
    const [submissions] = await connection.query(sql);
    connection.release();

    res.json({
      submissions,
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error('List submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

module.exports = router;
