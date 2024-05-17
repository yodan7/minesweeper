import { useState } from 'react';
import styles from './index.module.css';

const Home = () => {
  // 旗とか
  const [userInput, setUserInput] = useState<(0 | 1 | 2 | 3)[][]>([
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]);

  let bombCount = 10;
  // ボム
  const [bombMap, setBombMap] = useState([
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]);

  const [samplePos, setSamplePos] = useState(0);
  console.log('sample', samplePos);

  const directions = [
    [-1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, -1],
  ];

  const zeroList: { x: number; y: number }[] = [];

  bombMap.forEach((row, y) =>
    row.forEach((_, x) => {
      if (bombMap[y][x] === 0) {
        zeroList.push({ x, y });
      }
    }),
  );
  console.log(zeroList.length);

  const clickHandler = (x: number, y: number) => {
    console.log(x, y);

    const newMap = structuredClone(bombMap);
    newMap[y][x] = -1;
    // クリックしたマスを開ける

    if (zeroList.length === 81) {
      while (bombCount > 0) {
        console.log('ループ', bombCount);

        const randomIndex: number = Math.floor(Math.random() * 80);
        const bombIndex = zeroList[randomIndex];
        if (newMap[bombIndex.y][bombIndex.x] === 11) {
          console.log('bomb:', bombIndex.y, bombIndex.x);
          console.log('continue');
          continue;
        }
        newMap[bombIndex.y][bombIndex.x] = 11;
        bombCount--;
        // ボムを配置
        console.log('bomb:', bombIndex.y, bombIndex.x);

        directions.forEach((r) => {
          console.log(bombIndex.y + r[0], bombIndex.x + r[1]);
          if (
            newMap[bombIndex.y + r[0]] !== undefined &&
            newMap[bombIndex.y + r[0]][bombIndex.x + r[1]] !== undefined &&
            newMap[bombIndex.y + r[0]][bombIndex.x + r[1]] !== 11
          ) {
            if (newMap[bombIndex.y + r[0]][bombIndex.x + r[1]]) {
              newMap[bombIndex.y + r[0]][bombIndex.x + r[1]] += 1;
            } else {
              newMap[bombIndex.y + r[0]][bombIndex.x + r[1]] = 1;
            }
          }
          // ボムの数を配置
        });
      }
    }
    setBombMap(newMap);
    console.log(newMap);
    console.log(bombMap);
  };

  return (
    <div className={styles.container}>
      <div className={styles.boardStyle}>
        {bombMap.map((row, y) =>
          row.map((color, x) => (
            <div className={styles.cellStyle} key={`${x}-${y}`} onClick={() => clickHandler(x, y)}>
              {color === 0 ? (
                <div className={styles.fillStyle} />
              ) : color === -1 ? (
                <div />
              ) : (
                <div
                  className={styles.sampleStyle}
                  style={{ backgroundPosition: `${-30 * (color - 1)}px 0px` }}
                />
              )}
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
