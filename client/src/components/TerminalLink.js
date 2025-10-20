import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useRandomCharacters from '../hooks/useRandomCharacters';

function TerminalLink({ label, to, className, ...props }) {
  const [isHovering, setIsHovering] = useState(false);
  const displayText = useRandomCharacters(label, isHovering);

  return (
    <Link
      to={to}
      className={className}
      {...props}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {displayText}
    </Link>
  );
}

export default TerminalLink;
