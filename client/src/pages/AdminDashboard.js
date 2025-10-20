import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user?.is_admin) return;

    const fetchSubmissions = async () => {
      try {
        const response = await api.get('/submissions', { params: { page, per_page: 20 } });
        setSubmissions(response.data.submissions);
        setTotalPages(response.data.pagination.total_pages);
      } catch (err) {
        setError('Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [page, user]);

  const handleDownload = async (submission) => {
    try {
      const response = await api.get(`/submissions/${submission.id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', submission.filename || `submission_${submission.id}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError('Failed to download');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/submissions/${id}`);
      // Remove from local state
      setSubmissions(submissions.filter(sub => sub.id !== id));
      setError(''); // Clear any previous errors
    } catch (err) {
      setError('Failed to delete submission');
    } finally {
      setDeletingId(null);
    }
  };

  if (!user?.is_admin) {
    return <div className="container"><p>Admin access required</p></div>;
  }

  return (
    <div className="admin-dashboard-container">
      <h1>Admin Dashboard</h1>
      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>User</th>
                <th>Email</th>
                <th>Submitted</th>
                <th>File</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id}>
                  <td>{sub.id}</td>
                  <td>{sub.title}</td>
                  <td>{sub.name}</td>
                  <td>{sub.email}</td>
                  <td>{new Date(sub.created_at).toLocaleDateString()}</td>
                  <td>{sub.file_path ? '✓' : 'Link'}</td>
                  <td>
                    <a href={`/submission/${sub.id}`} className="btn-small">
                      View
                    </a>
                    <button
                      onClick={() => handleDownload(sub)}
                      className="btn-small"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      disabled={deletingId === sub.id}
                      className="btn-small btn-danger"
                    >
                      {deletingId === sub.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="btn-secondary"
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="btn-secondary"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
