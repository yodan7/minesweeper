import React, { use, useState } from 'react';
import styles from './index.module.css';

const Home = () => {
  // 0 -> 未クリック
  // 1 -> クリック
  // 2 -> ？
  // 3 -> 旗
  //クリックの詳細マップ
  const [userInput, setUserInput] = useState<(0 | 1 | 2 | 3)[][]>(
    [...Array(9)].map(() => [...Array(9)].map(() => 0)),
  );

  const bombCount = 10;
  // 0 -> ボムあり
  // 1 -> ボムなし
  // 2-9 -> 数字セル
  //ボムの詳細マップ
  const [bombMap, setBombMap] = useState([...Array(9)].map(() => [...Array(9)].map(() => 0)));
  console.log('bombMap1', bombMap);

  // -1 -> 石
  // 0 -> 画像無しセル
  // 1-8 -> 数字セル
  // 9 -> 石+はてな
  // 10 -> 石+旗
  // 11 -> ボムセル
  //表示するマップ
  const [board, setBoard] = useState([...Array(9)].map(() => [...Array(9)].map(() => -1)));
  console.log('board', board);

  const isPlaying = userInput.some((row) => row.some((input) => input !== 0));
  const isFailure = userInput.some((row, y) =>
    row.some((input, x) => input === 1 && bombMap[y][x] === 1),
  );
  const isSuccess = !isFailure && board.flat().length <= bombCount;

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

  // const zeroList: { x: number; y: number }[] = [];

  // bombMap.forEach((row, y) =>
  //   row.forEach((_, x) => {
  //     if (bombMap[y][x] === 0) {
  //       zeroList.push({ x, y });
  //     }
  //   }),
  // );

  // console.log(zeroList);

  const noContext = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  const clickR = (x: number, y: number) => {
    if (isFailure) {
      return;
    }

    console.log('HELLO');
    userInput[y][x] = 2;
    board[y][x] = 9;
    setBoard(board);
    console.log(userInput);
  };

  const checkZeroCells = (x: number, y: number, newMap, newInput) => {
    console.log('checkZerolist');
    console.log('bombMap2', newMap);

    if (x < 0 || x >= 9 || y < 0 || y >= 9 || newMap[y][x] === 1) {
      return;
    }

    if (newMap[y][x] >= 2) {
      board[y][x] = newMap[y][x] - 1;
      return;
    } else if (board[y][x] === -1) {
      board[y][x] = 0;
      console.log('OpenCell');

      directions.forEach(([dy, dx]) => {
        const aroundY = y + dy;
        const aroundX = x + dx;

        checkZeroCells(aroundX, aroundY, newMap, newInput);
      });
    }
  };

  const clickstone = (x: number, y: number) => {
    console.log(x, y);
    const newInput = structuredClone(userInput);
    const newMap = structuredClone(bombMap);

    //初回のみbombMapに爆弾、boardに数字をセット

    if (isFailure) {
      return;
    }

    const isFirst = !bombMap.flat().includes(1);
    if (isFirst) {
      console.log('bombMap3', bombMap);

      // const newMap = structuredClone(bombMap);

      console.log('isFirst2', isFirst, board);
      let p: number = 0;
      while (p < bombCount) {
        console.log('ループ', p);

        const bombY: number = Math.floor(Math.random() * 9);
        const bombX: number = Math.floor(Math.random() * 9);
        if (newMap[bombY][bombX] === 1 || (bombY === y && bombX === x)) {
          //ボム配置ループやり直し
          console.log('被り', bombY, bombX);
          console.log('continue');
          continue;
        }
        newMap[bombY][bombX] = 1;
        // ボムを配置
        console.log('bomb:', bombY, bombX);
        p++;

        directions.forEach(([dy, dx]) => {
          const aroundY = bombY + dy;
          const aroundX = bombX + dx;
          console.log('ボム周辺', aroundY, aroundX);
          if (
            newMap[aroundY] !== undefined &&
            newMap[aroundY][aroundX] !== undefined &&
            newMap[aroundY][aroundX] !== 1
          ) {
            console.log('aroundNum');
            if (newMap[aroundY][aroundX] >= 2) {
              newMap[aroundY][aroundX]++;
            } else {
              newMap[aroundY][aroundX] = 2;
            }
          }
        });
      }

      setBombMap(newMap);
      console.log('bombMap4', newMap);
      console.log('bombMap5', bombMap);
      console.log('board3', board);
    }
    //newInputの左クリック

    newInput[y][x] = 1;
    setUserInput(newInput);
    console.log('newInput', newInput);
    console.log('userInput', userInput);

    checkZeroCells(x, y, newMap, newInput);

    setBoard(board);
  };

  console.log('bombMap6', bombMap);

  console.log('board77', board);

  if (isFailure) {
    bombMap.forEach((row, y) =>
      row.forEach((cell, x) => {
        if (bombMap[y][x] === 1) {
          board[y][x] = 11;
        }
      }),
    );
  }

  // const Reload = (): void => {
  //   window.location.reload();
  // };
  return (
    <div className={styles.container}>
      <div className={styles.backboardStyle}>
        <div className={styles.infoStyle}>
          <div className={styles.countStyle} />
          <div
            className={styles.resetStyle}
            style={{ backgroundPosition: `${-30 * (!isFailure ? 11 : isSuccess ? 12 : 13)}px 0px` }}
          />
          <div className={styles.timeStyle} />
        </div>
        <div className={styles.boardStyle}>
          {board.map((row, y) =>
            row.map((cell, x) => (
              <div
                onContextMenu={() => {
                  console.log('Hello');

                  noContext;
                  clickR(x, y);
                }}
                className={styles.cellStyle}
                key={`${x}-${y}`}
                onClick={() => {
                  clickstone(x, y);
                }}
              >
                {cell === -1 ? (
                  <div className={styles.fillStyle} /> //石
                ) : cell === 0 ? ( //セル無し
                  <div />
                ) : (
                  (console.log('反映', board),
                  (
                    <div
                      className={styles.sampleStyle}
                      style={{ backgroundPosition: `${-30 * (cell - 1)}px 0px` }}
                    />
                  ))
                )}
              </div>
            )),
          )}
          <div>{isFailure && <div>負け</div>}</div>
          <div>{isSuccess && <div>勝ち</div>}</div>
        </div>
        {/* <div
          className={styles.sampleStyle}
          style={{ backgroundPosition: `${-30 * samplePos}px 0px` }}
        />
        <button onClick={() => setSamplePos((p) => (p + 1) % 14)}>sample</button> */}
      </div>
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
