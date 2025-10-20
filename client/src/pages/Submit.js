import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import TerminalButton from '../components/TerminalButton';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import '../styles/Submission.css';

function Submit() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [flag, setFlag] = useState('');
  const [file, setFile] = useState(null);
  const [externalLink, setExternalLink] = useState('');
  const [writeup, setWriteup] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  // Backend sample file URL (prefers REACT_APP_API_URL if set)
  const sampleUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/sample-walkthrough`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!title) {
      setError('Title is required');
      return;
    }
    if (!flag) {
      setError('Flag is required');
      return;
    }
    if (!writeup) {
      setError('Writeup (markdown file) is required');
      return;
    }
    if (!writeup.name.endsWith('.md')) {
      setError('Writeup must be a .md file');
      return;
    }
    if (!file && !externalLink) {
      setError('Either file upload or external link is required');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('flag', flag);
      if (file) formData.append('file', file);
      if (externalLink) formData.append('external_link', externalLink);
      formData.append('writeup', writeup);

      const response = await api.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      setSuccess('Submission created successfully!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="submit-container">
      <div className="submit-card">
        <h1>Submit CTF Challenge</h1>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Sample Writeup</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <a href={sampleUrl} className="btn-secondary" target="_blank" rel="noopener noreferrer">
                Download Sample Writeup (.md)
              </a>
            </div>
            <small>Use this template to format your writeup</small>
          </div>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Challenge title"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Challenge File (optional if using external link)</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <div className="form-group">
            <label>External Link (optional if uploading file)</label>
            <input
              type="url"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="https://example.com/challenge"
            />
          </div>

          <div className="form-group">
            <label>Writeup (Markdown file) *</label>
            <input
              type="file"
              accept=".md"
              onChange={(e) => setWriteup(e.target.files[0])}
              required
            />
            <small>Must be a .md file</small>
          </div>

          <div className="form-group">
            <label>FLAG Answer *</label>
            <input
              type="text"
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
              placeholder="FLAG{...}"
              required
            />
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="progress-bar">
              <div className="progress" style={{ width: `${uploadProgress}%` }}>
                {uploadProgress}%
              </div>
            </div>
          )}

          <TerminalButton 
            type="submit" 
            disabled={loading} 
            className="btn-primary"
            label={loading ? `Uploading... ${uploadProgress}%` : 'Submit'}
          />
        </form>
      </div>
    </div>
  );
}

export default Submit;
