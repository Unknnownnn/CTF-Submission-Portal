import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TerminalLink from './TerminalLink';
import TerminalButton from './TerminalButton';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <span className="terminal-prompt">
            <span className="prompt-symbol">&gt;</span>
            <Link to="/">CYSCOM_CTFs</Link>
          </span>
        </div>
        <div className="navbar-links">
          {user ? (
            <>
              <TerminalLink 
                to="/dashboard" 
                className="nav-link"
                label="[DASHBOARD]"
              />
              {user.is_admin && (
                <TerminalLink 
                  to="/admin" 
                  className="nav-link"
                  label="[ADMIN]"
                />
              )}
              <span className="user-info">{user.email}</span>
              <TerminalButton 
                onClick={handleLogout} 
                className="btn-logout"
                label="[LOGOUT]"
              />
            </>
          ) : (
            <>
              <TerminalLink 
                to="/login" 
                className="nav-link"
                label="[LOGIN]"
              />
              <TerminalLink 
                to="/register" 
                className="nav-link"
                label="[REGISTER]"
              />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
