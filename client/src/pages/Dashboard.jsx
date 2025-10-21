import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import TerminalLink from '../components/TerminalLink';
import useTypingAnimation from '../hooks/useTypingAnimation';
import useRandomCharacters from '../hooks/useRandomCharacters';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import '../styles/Dashboard.css';

function Dashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const welcomeMessage = `Welcome, ${user?.name}!`;
  const { displayText, isComplete } = useTypingAnimation(welcomeMessage, 50);
  // Download sample markdown directly from backend
  const downloadSample = () => {
    const url = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/sample-walkthrough`;
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'Sample_Walkthrough.md');
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  
  // Continuous random glitch effect after typing completes
  const [isGlitching, setIsGlitching] = useState(false);
  const glitchedText = useRandomCharacters(welcomeMessage, isGlitching);
  
  // Random glitch effect
  useEffect(() => {
    if (!isComplete) return;
    
    const glitchInterval = setInterval(() => {
      // Randomly decide to glitch (40% chance every 2 seconds)
      if (Math.random() < 0.4) {
        setIsGlitching(true);
        // Glitch for a short time
        setTimeout(() => setIsGlitching(false), 400);
      }
    }, 2000);
    
    return () => clearInterval(glitchInterval);
  }, [isComplete]);
  
  const finalWelcomeText = isComplete ? (isGlitching ? glitchedText : welcomeMessage) : displayText;

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await api.get('/submissions/mine');
        setSubmissions(response.data.submissions);
      } catch (err) {
        setError('Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{finalWelcomeText}</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <TerminalLink 
            to="/submit" 
            className="btn-primary"
            label="+ New Submission"
          />
          <button className="btn-sample" onClick={downloadSample}>
            Sample.md
          </button>
        </div>
      </div>
      

      <div className="dashboard-content">
        <h2>Your Submissions</h2>
        {loading && <p>Loading...</p>}
        {error && <div className="error-message">{error}</div>}
        {!loading && submissions.length === 0 && (
          <p>No submissions yet. <Link to="/submit">Create one!</Link></p>
        )}
        {!loading && submissions.length > 0 && (
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id}>
                  <td>{sub.title}</td>
                  <td>{new Date(sub.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/submission/${sub.id}`} className="btn-small">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
