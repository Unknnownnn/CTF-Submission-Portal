import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TerminalButton from '../components/TerminalButton';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import '../styles/Submission.css';

function SubmissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [writeup, setWriteup] = useState('');
  const [showWriteup, setShowWriteup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await api.get(`/submissions/${id}`);
        setSubmission(response.data.submission);
      } catch (err) {
        setError('Failed to load submission');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id]);

  const loadWriteup = async () => {
    if (writeup) return; // Already loaded

    try {
      const writeupResponse = await api.get(`/submissions/${id}/writeup`);
      setWriteup(writeupResponse.data);
    } catch (err) {
      setError('Failed to load writeup');
    }
  };

  const toggleWriteup = async () => {
    if (!showWriteup && !writeup) {
      await loadWriteup();
    }
    setShowWriteup(!showWriteup);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/submissions/${id}/download`, {
        responseType: 'blob',
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Get filename from submission data
      const filename = submission.filename || `submission_${id}.zip`;

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download submission');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/submissions/${id}`);
      alert('Submission deleted successfully');
      // Redirect to admin dashboard
      navigate('/admin');
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete submission');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (error) return <div className="container"><div className="error-message">{error}</div></div>;
  if (!submission) return <div className="container"><p>Submission not found</p></div>;

  return (
    <div className="submission-detail-container">
      <div className="submission-detail-card">
        <div className="detail-header">
          <h1>{submission.title}</h1>
          <div className="action-buttons">
            {submission.external_link && (
              <a href={submission.external_link} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                External Link
              </a>
            )}
            {user?.is_admin && (
              <>
                <TerminalButton 
                  onClick={handleDownload} 
                  disabled={downloading} 
                  className="btn-secondary"
                  label={downloading ? 'Downloading...' : '[DOWNLOAD]'}
                />
                <TerminalButton 
                  onClick={handleDelete} 
                  disabled={deleting} 
                  className="btn-danger"
                  label={deleting ? 'Deleting...' : '[DELETE]'}
                />
              </>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h3>Submitted by</h3>
          <div className="submitter-info">
            <p><strong>Name:</strong> {submission.name}</p>
            <p><strong>Email:</strong> {submission.email}</p>
          </div>
        </div>

        {submission.external_link && (
          <div className="detail-section">
            <h3>External Link</h3>
            <p><strong>URL:</strong> {submission.external_link}</p>
            <a href={submission.external_link} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              Open Link
            </a>
          </div>
        )}

        <div className="detail-section">
          <h3>Description</h3>
          <p>{submission.description || 'No description provided'}</p>
        </div>

        <div className="detail-section">
          <h3>FLAG</h3>
          <div className="flag-display">
            <code>{submission.flag_answer}</code>
          </div>
        </div>

        <div className="detail-section">
          <div className="writeup-header">
            <h3>Writeup</h3>
            <TerminalButton 
              onClick={toggleWriteup} 
              className="btn-secondary"
              label={showWriteup ? '[HIDE]' : '[SHOW]'}
            />
          </div>
          {showWriteup && (
            <div className="writeup-content">
              {writeup ? (
                <Markdown remarkPlugins={[remarkGfm]}>{writeup}</Markdown>
              ) : (
                <p>Loading writeup...</p>
              )}
            </div>
          )}
        </div>

        <div className="detail-footer">
          <small>Submitted: {new Date(submission.created_at).toLocaleString()}</small>
        </div>
      </div>
    </div>
  );
}

export default SubmissionDetail;
