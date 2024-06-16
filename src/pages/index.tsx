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

  let bombCount = 10;
  // 0 -> ボムなし
  // 1 -> ボムあり
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
  const board = [...Array(9)].map(() => [...Array(9)].map(() => -1));
  console.log('board', board);

  const isFirst = !bombMap.flat().includes(1);
  const isPlaying = userInput.some((row) => row.some((input) => input !== 0));
  const isFailure = userInput.some((row, y) =>
    row.some((input, x) => input === 1 && bombMap[y][x] === 1),
  );
  const isSuccess =
    !isFailure &&
    userInput.flat().filter((cell) => cell !== 1).length <=
      bombMap.flat().filter((cell) => cell === 1).length;

  // const [samplePos, setSamplePos] = useState(0);
  // console.log('sample', samplePos);

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

  //メニューを非表示にする
  const noContext = (event: React.MouseEvent) => {
    console.log('非表示');

    event.preventDefault();
  };

  //右クリックに関する関数
  const clickR = (x: number, y: number) => {
    if (isFailure || isFirst) {
      return;
    }
    const newInput = structuredClone(userInput);

    if (newInput[y][x] >= 2) {
      if (newInput[y][x] === 3) {
        newInput[y][x] = 0;
      } else {
        newInput[y][x] = 3;
      }
    } else if (newInput[y][x] === 0) {
      newInput[y][x] = 2;
    }
    console.log('右クリック', userInput, board);

    setUserInput(newInput);
  };

  //再帰的に石を開ける関数
  const checkZeroCells = (x: number, y: number, newMap, newInput) => {
    console.log('checkZerolist');
    console.log('bombMap2', newMap);

    if (x < 0 || x >= 9 || y < 0 || y >= 9) {
      return;
    }

    if (newInput[y][x] !== 1) {
      newInput[y][x] = 1;
      console.log('OpenCell');

      if (newMap[y][x] >= 1) {
        return;
      }

      directions.forEach(([dy, dx]) => {
        const aroundY = y + dy;
        const aroundX = x + dx;

        checkZeroCells(aroundX, aroundY, newMap, newInput);
      });
    }
  };

  //クリックしたときにボムや数字を配置する関数
  const clickstone = (x: number, y: number) => {
    console.log(x, y);
    const newInput = structuredClone(userInput);
    const newMap = structuredClone(bombMap);

    if (isFailure) {
      return;
    }
    //初回のみbombMapに爆弾、boardに数字をセット

    if (isFirst) {
      console.log('bombMap3', bombMap);
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

    // // newInput[y][x] = 1;
    // setUserInput(newInput);
    console.log('newInput', newInput);
    console.log('userInput', userInput);

    checkZeroCells(x, y, newMap, newInput);

    // setBoard(board);
    setUserInput(newInput);
  };

  console.log('bombMap6', bombMap);

  console.log('board77', board);

  //userInputとbombMapをもとにboard作成
  board.forEach((row, y) =>
    row.forEach((_, x) => {
      if (userInput[y][x] === 1) {
        if (bombMap[y][x] >= 2) {
          board[y][x] = bombMap[y][x] - 1;
        } else {
          board[y][x] = 0;
        }
      }
      //はてな
      if (userInput[y][x] === 2) {
        board[y][x] = 9;
      }
      //旗
      if (userInput[y][x] === 3) {
        board[y][x] = 10;
        if (bombCount > 0) {
          bombCount--;
        }
      }
      //失敗したらボムを表示
      if (isFailure && bombMap[y][x] === 1) {
        board[y][x] = 11;
      }
      //成功時したらボムを旗に変える
      if (isSuccess && bombMap[y][x] === 1) {
        board[y][x] = 10;
      }
    }),
  );

  //ページをリロードする関数
  const Reload = () => {
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <div className={styles.backboardStyle}>
        <div className={styles.infoStyle} onClick={Reload}>
          <div className={styles.countStyle}>
            <div className={`${styles.display} ${styles[`d${Math.floor(bombCount / 100)}`]}`} />
            <div
              className={`${styles.display} ${styles[`d${Math.floor((bombCount % 100) / 10)}`]}`}
            />
            <div className={`${styles.display} ${styles[`d${bombCount % 10}`]}`} />
          </div>
          <div
            className={styles.resetStyle}
            style={{ backgroundPosition: `${-40 * (isSuccess ? 12 : isFailure ? 13 : 11)}px 0px` }}
          />
          <div className={styles.timeStyle} />
        </div>
        <div className={styles.boardStyle}>
          {board.map((row, y) =>
            row.map((cell, x) => (
              <div
                onContextMenu={() => {
                  console.log('右クリック');
                  noContext(event);
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
                ) : cell === 9 || cell === 10 ? (
                  <div
                    className={styles.rightfillStyle}
                    style={{
                      backgroundPosition: `${-22 * (cell - 1)}px 0px`,
                      backgroundColor:
                        isFailure && userInput[y][x] === 3 && bombMap[y][x] !== 1
                          ? '#FF82B2'
                          : 'inherit',
                    }}
                  />
                ) : (
                  (console.log('反映', board, isSuccess),
                  (
                    <div
                      className={styles.sampleStyle}
                      style={{
                        backgroundPosition: `${-25 * (cell - 1)}px 0px`,
                        backgroundColor:
                          userInput[y][x] === 1 && bombMap[y][x] === 1 ? 'red' : 'inherit',
                      }}
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
