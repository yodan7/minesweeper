import React, { useEffect, useState } from 'react';
import styles from './index.module.css';

const Home = () => {
  //タイマー
  const [startTime, setStartTime] = useState<number | null>(null);

  //難易度
  const [level, setLevel] = useState<'lev1' | 'lev2' | 'lev3' | 'custom'>('lev1');

  const [InputValue, setInputValue] = useState([30, 30, 10]);

  const setLenBomb = (level) => {
    if (level === 'lev1') {
      return [9, 9, 10];
    } else if (level === 'lev2') {
      return [16, 16, 40];
    } else if (level === 'lev3') {
      return [16, 30, 99];
    } else if (level === 'custom') {
      return InputValue;
    }
  };
  const lenY = setLenBomb(level)[0];
  const lenX = setLenBomb(level)[1];

  // 0 -> 未クリック
  // 1 -> クリック
  // 2 -> ？
  // 3 -> 旗
  //クリックの詳細マップ
  const [userInput, setUserInput] = useState<(0 | 1 | 2 | 3)[][]>(
    [...Array(lenY)].map(() => [...Array(lenX)].map(() => 0)),
  );

  const bombCount = setLenBomb(level)[2];

  // 0 -> ボムなし
  // 1 -> ボムあり
  // 2-9 -> 数字セル
  //ボムの詳細マップ
  const [bombMap, setBombMap] = useState([...Array(lenY)].map(() => [...Array(lenX)].map(() => 0)));
  console.log('bombMap1', bombMap);

  // -1 -> 石
  // 0 -> 画像無しセル
  // 1-8 -> 数字セル
  // 9 -> 石+はてな
  // 10 -> 石+旗
  // 11 -> ボムセル
  //表示するマップ
  const board = [...Array(lenY)].map(() => [...Array(lenX)].map(() => -1));
  console.log('board', board);

  const isFirst = !bombMap.flat().includes(1);
  // const isPlaying = userInput.some((row) => row.some((input) => input !== 0));
  const isFailure = userInput.some((row, y) =>
    row.some((input, x) => input === 1 && bombMap[y][x] === 1),
  );
  const isSuccess =
    !isFailure &&
    userInput.flat().filter((cell) => cell !== 1).length <=
      bombMap.flat().filter((cell) => cell === 1).length;

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

  //タイマー
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (startTime !== null) {
      interval = setInterval(() => {
        const elapsed = startTime === null ? 0 : Math.floor((Date.now() - startTime) / 1000);
        const hundreds = Math.floor(elapsed / 100);
        const tens = Math.floor((elapsed % 100) / 10);
        const ones = elapsed % 10;

        const hundredsElement = document.getElementById('hundreds');
        const tensElement = document.getElementById('tens');
        const onesElement = document.getElementById('ones');

        if (hundredsElement) {
          hundredsElement.className = `${styles.displayStyle} ${styles[`d${hundreds}`]}`;
        }
        if (tensElement) {
          tensElement.className = `${styles.displayStyle} ${styles[`d${tens}`]}`;
        }
        if (onesElement) {
          onesElement.className = `${styles.displayStyle} ${styles[`d${ones}`]}`;
        }
      }, 1000);
    }

    const checkGameState = () => {
      const isFailure = userInput.some((row, y) =>
        row.some((input, x) => input === 1 && bombMap[y][x] === 1),
      );
      const isSuccess =
        !isFailure &&
        userInput.flat().filter((cell) => cell !== 1).length <=
          bombMap.flat().filter((cell) => cell === 1).length;

      if (isFailure || isSuccess) {
        setStartTime(null);
      }
    };

    checkGameState();

    return () => {
      if (interval !== null) {
        clearInterval(interval);
      }
    };
  }, [startTime, userInput, bombMap]);

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
  const checkZeroCells = (x: number, y: number, newMap: any, newInput: any) => {
    console.log('checkZerolist');
    console.log('bombMap2', newMap);

    if (x < 0 || x >= lenX || y < 0 || y >= lenY) {
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
      setStartTime(Date.now());

      console.log('bombMap3', bombMap);
      console.log('isFirst2', isFirst, board);
      let p: number = 0;
      while (p < bombCount) {
        console.log('ループ', p);

        const bombY: number = Math.floor(Math.random() * lenY);
        const bombX: number = Math.floor(Math.random() * lenX);
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
    console.log('newInput', newInput);
    console.log('userInput', userInput);

    checkZeroCells(x, y, newMap, newInput);

    // setBoard(board);
    setUserInput(newInput);
  };

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

  const RemainBomb = bombCount - board.flat().filter((flag) => flag === 10).length;

  //ページをリロードする関数
  const Reload = () => {
    window.location.reload();
  };

  //ボードを作成する関数
  const MakeBoard = (lenY, lenX) => {
    setStartTime(null);

    console.log('level', level);
    console.log('lenY, lenX', lenY, lenX);
    setUserInput([...Array(lenY)].map(() => [...Array(lenX)].map(() => 0)));
    setBombMap([...Array(lenY)].map(() => [...Array(lenX)].map(() => 0)));
  };

  //レベルをセットする関数
  const Levelset = (level) => {
    setLevel(level);
    let lenY = 9;
    let lenX = 9;

    if (level === 'lev1') {
      lenY = 9;
      lenX = 9;
    } else if (level === 'lev2') {
      lenY = 16;
      lenX = 16;
    } else if (level === 'lev3') {
      lenY = 16;
      lenX = 30;
    } else if (level === 'custom') {
      lenY = 30;
      lenX = 30;
    }
    MakeBoard(lenY, lenX);
  };

  //カスタムの入力値を取得する関数

  return (
    <div className={styles.container}>
      <div className={styles.menueStyle}>
        <div className={styles.levelStyle} onClick={() => Levelset('lev1')}>
          初級
        </div>
        <div className={styles.levelStyle} onClick={() => Levelset('lev2')}>
          中級
        </div>
        <div className={styles.levelStyle} onClick={() => Levelset('lev3')}>
          上級
        </div>
        <div className={styles.levelStyle} onClick={() => Levelset('custom')}>
          カスタム
        </div>
      </div>
      <div className={styles.customStyle}>
        <div className={styles.customStyle}>
          幅：
          <input type="text" value={30} size={3} id="width" />
          高さ：
          <input type="text" value={30} size={3} id="height" />
          爆弾数：
          <input type="text" value={30} size={3} id="bombCount" />
          <button type="button" />
        </div>
      </div>
      <div
        className={styles.backboardStyle}
        style={{
          width: `${lenX * 30 + 60}px`,
          height: `${lenY * 31 + 130}px`,
        }}
      >
        <div
          className={styles.infoStyle}
          onClick={() => Reload()}
          style={{
            width: `${lenX * 30 + 10}px`,
          }}
        >
          <div className={styles.countStyle}>
            <div
              className={`${styles.displayStyle} ${styles[`d${Math.floor(RemainBomb / 100)}`]}`}
            />
            <div
              className={`${styles.displayStyle} ${styles[`d${Math.floor((RemainBomb % 100) / 10)}`]}`}
            />
            <div className={`${styles.displayStyle} ${styles[`d${RemainBomb % 10}`]}`} />
          </div>
          <div
            className={styles.resetStyle}
            style={{ backgroundPosition: `${-40 * (isSuccess ? 12 : isFailure ? 13 : 11)}px 0px` }}
          />
          <div className={styles.timeStyle}>
            <div id="hundreds" className={`${styles.displayStyle} ${styles.d0}`} />
            <div id="tens" className={`${styles.displayStyle} ${styles.d0}`} />
            <div id="ones" className={`${styles.displayStyle} ${styles.d0}`} />
          </div>
        </div>
        <div
          className={styles.boardStyle}
          style={{
            width: `${lenX * 30 + 10}px`,
            height: `${lenY * 30 + 10}px`,
          }}
        >
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
        </div>
      </div>
    </div>
  );
};

export default Home;
