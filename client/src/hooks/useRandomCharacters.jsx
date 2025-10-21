import { useState, useEffect } from 'react';

const useRandomCharacters = (originalText, isHovering) => {
  const [displayText, setDisplayText] = useState(originalText);

  useEffect(() => {
    if (!isHovering) {
      setDisplayText(originalText);
      return;
    }

    // Use only alphanumeric + some symbols, all single-width chars
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let currentIndex = 0;
    const originalChars = originalText.split('');
    const displayChars = [...originalChars]; // Start with original chars

    const interval = setInterval(() => {
      // Scramble effect: randomly change each character while hovering
      for (let i = 0; i < originalChars.length; i++) {
        if (Math.random() < 0.3) {
          displayChars[i] = chars[Math.floor(Math.random() * chars.length)];
        } else {
          displayChars[i] = originalChars[i];
        }
      }

      setDisplayText(displayChars.join(''));
      currentIndex++;

      // Stop after a few cycles and return to original
      if (currentIndex > 25) {
        clearInterval(interval);
        setDisplayText(originalText);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isHovering, originalText]);

  return displayText;
};

export default useRandomCharacters;
