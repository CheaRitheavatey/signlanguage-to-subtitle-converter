import React from 'react';

export const SubtitleOverlay = ({
  currentSubtitle,
  settings,
}) => {
  const getPositionClass = () => {
    switch (settings.subtitlePosition) {
      case 'top':
        return 'subtitle-top';
      case 'center':
        return 'subtitle-center';
      case 'bottom':
      default:
        return 'subtitle-bottom';
    }
  };

  const getSizeClass = () => {
    switch (settings.subtitleSize) {
      case 'small':
        return 'subtitle-small';
      case 'large':
        return 'subtitle-large';
      case 'medium':
      default:
        return 'subtitle-medium';
    }
  };

  if (!currentSubtitle) return null;

  return (
    <div className={`subtitle-overlay ${getPositionClass()}`}>
      <div className={`subtitle-text ${getSizeClass()} ${settings.theme === 'dark' ? 'dark' : ''}`}>
        {currentSubtitle}
      </div>
    </div>
  );
};