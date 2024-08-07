import React from 'react';

interface LevelButtonProps {
  levelName: 'lev1' | 'lev2' | 'lev3' | 'custom';
  currentLevel: string;
  onLevelSelect: (level: 'lev1' | 'lev2' | 'lev3' | 'custom') => void;
}

const LevelButton: React.FC<LevelButtonProps> = ({ levelName, currentLevel, onLevelSelect }) => {
  return (
    <div
      onClick={() => onLevelSelect(levelName)}
      style={{ fontWeight: `${currentLevel === levelName ? 700 : 400}` }}
    >
      {levelName === 'lev1' && '初級'}
      {levelName === 'lev2' && '中級'}
      {levelName === 'lev3' && '上級'}
      {levelName === 'custom' && 'カスタム'}
    </div>
  );
};

export default LevelButton;
