import React from 'react';
import styles from '../pages/index.module.css';

interface CustomButtonProps {
  inputValues: number[];
  onInputChange: (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onhandleSubmit: () => void;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  inputValues,
  onInputChange,
  onhandleSubmit,
}) => {
  return (
    <div className={styles.customStyle}>
      <div>
        幅：
        <input
          type="text"
          value={inputValues[1]}
          size={3}
          id="width"
          onChange={() => onInputChange(1)}
        />
      </div>
      <div>
        高さ：
        <input
          type="text"
          value={inputValues[0]}
          size={3}
          id="height"
          onChange={() => onInputChange(0)}
        />
      </div>
      <div>
        爆弾数：
        <input
          type="text"
          value={inputValues[2]}
          size={3}
          id="bombCount"
          onChange={() => onInputChange(2)}
        />
      </div>
      <button type="button" onClick={() => onhandleSubmit()}>
        更新
      </button>
    </div>
  );
};

export default CustomButton;
