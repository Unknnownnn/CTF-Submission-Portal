import React, { useState } from 'react';
import useRandomCharacters from '../hooks/useRandomCharacters';

function TerminalButton({ label, className, ...props }) {
  const [isHovering, setIsHovering] = useState(false);
  const displayText = useRandomCharacters(label, isHovering);

  return (
    <button
      className={className}
      {...props}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {displayText}
    </button>
  );
}

export default TerminalButton;
