import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import TerminalLink from '../components/TerminalLink';
import useRandomCharacters from '../hooks/useRandomCharacters';
import useTypingAnimation from '../hooks/useTypingAnimation';
import '../styles/Landing.css';

function Landing() {
  const { displayText: commandText } = useTypingAnimation('$ ctf-collection --init', 80);
  return (
    <div className="landing-container">
      <div className="landing-hero">
        <div className="typing-command">
          <span className="command-symbol">$</span>
          <span className="command-text">{commandText}</span>
          <span className="cursor">_</span>
        </div>
        <div className="ascii-header">
{`
  /$$$$$$  /$$     /$$ /$$$$$$   /$$$$$$   /$$$$$$  /$$      /$$
 /$$__  $$|  $$   /$$//$$__  $$ /$$__  $$ /$$__  $$| $$$    /$$$
| $$  \__/ \  $$ /$$/| $$  \__/| $$  \__/| $$  \ $$| $$$$  /$$$$
| $$        \  $$$$/ |  $$$$$$ | $$      | $$  | $$| $$ $$/$$ $$
| $$         \  $$/   \____  $$| $$      | $$  | $$| $$  $$$| $$
| $$    $$    | $$    /$$  \ $$| $$    $$| $$  | $$| $$\  $ | $$
|  $$$$$$/    | $$   |  $$$$$$/|  $$$$$$/|  $$$$$$/| $$ \/  | $$
 \______/     |__/    \______/  \______/  \______/ |__/     |__/
                                                                                                                       
`}
        </div>
        <div className="terminal-prompt">
          <span className="prompt-symbol">&gt;</span>
          <span className="prompt-text">CTF Submission Platform</span>
        </div>
        <p className="hero-description">
          Platform to submit CTF challenges and writeups efficiently
        </p>
        <div className="hero-buttons">
          <TerminalLink 
            to="/register" 
            className="btn-primary terminal-btn"
            label="[REGISTER]"
          />
          <TerminalLink 
            to="/login" 
            className="btn-secondary terminal-btn"
            label="[LOGIN]"
          />
        </div>
      </div>
      </div>
  );
}

export default Landing;
