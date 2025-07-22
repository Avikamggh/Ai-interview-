import React, { useState, useEffect } from 'react';

const AIAvatar = ({ isActive }) => {
  const [blinkAnimation, setBlinkAnimation] = useState(false);
  const [mouthAnimation, setMouthAnimation] = useState(false);

  useEffect(() => {
    // Blinking animation
    const blinkInterval = setInterval(() => {
      setBlinkAnimation(true);
      setTimeout(() => setBlinkAnimation(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    // Mouth animation when speaking
    if (isActive) {
      const mouthInterval = setInterval(() => {
        setMouthAnimation(prev => !prev);
      }, 200);

      return () => clearInterval(mouthInterval);
    } else {
      setMouthAnimation(false);
    }
  }, [isActive]);

  return (
    <div className={`ai-avatar ${isActive ? 'speaking' : ''}`}>
      <div className="avatar-container">
        <div className="avatar-head">
          {/* Eyes */}
          <div className={`eye left-eye ${blinkAnimation ? 'blink' : ''}`}>
            <div className="pupil"></div>
          </div>
          <div className={`eye right-eye ${blinkAnimation ? 'blink' : ''}`}>
            <div className="pupil"></div>
          </div>
          
          {/* Nose */}
          <div className="nose"></div>
          
          {/* Mouth */}
          <div className={`mouth ${mouthAnimation ? 'talking' : ''}`}>
            <div className="mouth-inner"></div>
          </div>
        </div>
        
        {/* Voice waves when speaking */}
        {isActive && (
          <div className="voice-waves">
            <div className="wave wave1"></div>
            <div className="wave wave2"></div>
            <div className="wave wave3"></div>
          </div>
        )}
      </div>
      
      <div className="avatar-name">
        <h4>AI Interviewer</h4>
        <p>{isActive ? 'Speaking...' : 'Ready'}</p>
      </div>
    </div>
  );
};

export default AIAvatar;