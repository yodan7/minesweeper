import { useState } from 'react';
import styles from './index.module.css';

const Home = () => {
  const [boardMap, setboardMap] = useState([
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]);

  const [userInput, setUserInput] = useState([0, 1, 2, 3]);
  const [samplePos, setSamplePos] = useState(0);
  console.log('sample', samplePos);

  return (
    <div className={styles.container}>
      <div className={styles.boardStyle}>
        {boardMap.map((row, y) =>
          row.map((color, x) => (
            <div className={styles.cellStyle} key={`${x}-${y}`}>
              {color === 0 && <div className={styles.fillStyle} />}
            </div>
          )),
        )}
      </div>
      <div
        className={styles.sampleStyle}
        style={{ backgroundPosition: `${-30 * samplePos}px 0px` }}
      />
      <button onClick={() => setSamplePos((p) => (p + 1) % 14)}>sample</button>
    </div>
  );
};

export default Home;
// 初回後にボムセット
// クリックするたびに旗など変更
// setで画面変わるのがuseStatusの主作用
// useEffectは副作用の隔離・クリーンナップ：時計
// 機能全部・見た目・useState減らす・初級～上級・スマホ対応・爆弾サイズカスタム
