import React, { useState } from 'react';
import { isSoundEnabled, setSoundEnabled, playClick } from '../../utils/soundManager';
import './SoundToggle.css';

const SoundToggle: React.FC = () => {
  const [enabled, setEnabled] = useState(isSoundEnabled);

  const toggle = () => {
    const next = !enabled;
    setSoundEnabled(next);
    setEnabled(next);
    if (next) playClick(); // Give feedback when turning on
  };

  return (
    <button
      className="sound-toggle"
      onClick={toggle}
      aria-label={enabled ? 'Mute sounds' : 'Unmute sounds'}
      aria-pressed={enabled}
      title={enabled ? 'Sound on' : 'Sound off'}
    >
      <span className="sound-toggle__icon" aria-hidden="true">
        {enabled ? '\u266B' : '\u2716'}
      </span>
      <span className="sound-toggle__label">{enabled ? 'Sound' : 'Muted'}</span>
    </button>
  );
};

export default SoundToggle;
