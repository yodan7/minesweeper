import { use, useState } from 'react';
import styles from './index.module.css';

const Home = () => {
  // 0 -> 未クリック
  // 1 -> クリック
  // 2 -> ？
  // 3 -> 旗
  //クリックの詳細マップ
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

  const bombCount = 10;
  // 0 -> ボムあり
  // 1 -> ボムなし
  //ボムの詳細マップ
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

  const isFirst = !bombMap.flat().includes(1);

  const isPlaying = userInput.some((row) => row.some((input) => input !== 0));
  const isFailure = userInput.some((row, y) =>
    row.some((input, x) => input === 1 && bombMap[y][x] === 1),
  );

  // -1 -> 石
  // 0 -> 画像無しセル
  // 1-8 -> 数字セル
  // 9 -> 石+はてな
  // 10 -> 石+旗
  // 11 -> ボムセル
  //表示するマップ
  const board: number[][] = [...Array(9)].map(() => [...Array(9)].map(() => -1));

  //boardはクリック関係なくuserInputを参照だけしてマップを作ればよい
  console.log('board', board);

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

  const clickstone = (x: number, y: number) => {
    console.log(x, y);

    //初回のみbombMapに爆弾、boardに数字をセット
    if (isFirst) {
      let p: number = 0;
      while (p < bombCount) {
        console.log('ループ', p);

        const randomIndex: number = Math.floor(Math.random() * 80);
        const bombIndex = zeroList[randomIndex];
        if (bombMap[bombIndex.y][bombIndex.x] === 1 || (bombIndex.y === y && bombIndex.x === x)) {
          //ボム配置ループやり直し
          console.log('bomb:', bombIndex.y, bombIndex.x);
          console.log('continue');
          continue;
        }
        bombMap[bombIndex.y][bombIndex.x] = 1;
        // ボムを配置
        console.log('bomb:', bombIndex.y, bombIndex.x);
        p++;
      }
      setBombMap(bombMap);
      console.log('bombMap', bombMap);
      console.log('board3', board);
    }

    //userInputの左クリック
    const newMap = structuredClone(userInput);
    newMap[y][x] = 1;
    setUserInput(newMap);
  };

  console.log('board2', board);

  //boardを変更
  userInput.forEach((row, y) =>
    userInput.forEach((_, x) => {
      if (userInput[y][x] === 1) {
        board[y][x] = 0;
      }
    }),
  );
  //ボードの数字セルを設定
  bombMap.forEach((row, y) =>
    bombMap.forEach((_, x) => {
      if (board[y][x] === 0) {
        directions.forEach((r) => {
          const aroundY = y + r[0];
          const aroundX = x + r[1];
          console.log('ボム周辺', aroundY, aroundX);
          if (
            bombMap[aroundY] !== undefined &&
            bombMap[aroundY][aroundX] !== undefined &&
            bombMap[aroundY][aroundX] === 1
          ) {
            console.log('aroundNum');
            if (board[y][x] !== 0) {
              board[y][x] += 1;
            } else {
              board[y][x] = 1;
            }
          }
        });
      }
    }),
  );

  return (
    <div className={styles.container}>
      <div className={styles.boardStyle}>
        {userInput.map((row, y) =>
          row.map((_, x) => (
            <div className={styles.cellStyle} key={`${x}-${y}`} onClick={() => clickstone(x, y)}>
              {board[y][x] === -1 ? (
                <div className={styles.fillStyle} /> //石
              ) : board[y][x] === 0 ? ( //セル無し
                <div />
              ) : (
                <div
                  className={styles.sampleStyle}
                  style={{ backgroundPosition: `${-30 * board[y][x] - 1}px 0px` }}
                />
              )}
            </div>
          )),
        )}
        <div>{isFailure && <div>負け</div>}</div>
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
//map(function(){})がmap(()=>{})となってる、すべてコードを関数で書かなきゃだからかも
