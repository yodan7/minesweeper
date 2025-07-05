// 型定義の追加
type StyleKeys =
  | 'container'
  | 'menueStyle'
  | 'customStyle'
  | 'sampleStyle'
  | 'backboardStyle'
  | 'infoStyle'
  | 'countStyle'
  | 'displayStyle'
  | 'resetStyle'
  | 'timeStyle'
  | 'boardStyle'
  | 'cellStyle'
  | 'fillStyle'
  | 'rightfillStyle';
interface CSSModule extends Record<StyleKeys, string> {
  [key: string]: string;
}
// インポート部分の変更
import React, { useEffect } from 'react';
import stylesModule from './index.module.css';

import useLives from '../hooks/setLives';
import useStartTime from '../hooks/setStartTime';
import useTimer from '../hooks/setTimer';
import useLevel from '../hooks/setLevel';
import useInputValues from '../hooks/setInputValues';
import useCustomValues from '../hooks/setCustomValues';
import useUserInput from '../hooks/setUserInput';

import useBombMap from '../hooks/setBombMap';
import LevelButton from '../components/LevelButton';
import CustomButton from '../components/CustomButton';
const styles = stylesModule as CSSModule;

const Home = () => {
  //残機
  const { lives, setLives } = useLives();

  //タイマーの設定
  const { startTime, setStartTime } = useStartTime();
  //タイマーの値
  const { timer, setTimer } = useTimer();

  //難易度
  const { level, setLevel } = useLevel();
  //難易度の入力欄の更新
  const { inputValues, setInputValues } = useInputValues();
  //入力内容
  const { customValues, setCustomValues } = useCustomValues();

  //サイズと爆弾の数を決定
  const setLenBomb = (level: 'lev1' | 'lev2' | 'lev3' | 'custom'): number[] => {
    if (level === 'lev1') {
      return [9, 9, 10];
    } else if (level === 'lev2') {
      return [16, 16, 40];
    } else if (level === 'lev3') {
      return [16, 30, 99];
    } else if (level === 'custom') {
      // console.log('customValues', customValues);
      return customValues;
    }
    return [9, 9, 10]; // デフォルト値を追加
  };

  //サイズとボムの数を取得
  const [lenY, lenX, bombCount] = setLenBomb(level);

  // 0 -> 未クリック
  // 1 -> クリック
  // 2 -> ？
  // 3 -> 旗
  //クリックの詳細マップ
  const { userInput, setUserInput } = useUserInput(lenY, lenX);
  // 0 -> ボムなし
  // 1 -> ボムあり
  // 2-9 -> 数字セル
  //ボムの詳細マップ
  const { bombMap, setBombMap } = useBombMap(lenY, lenX);

  // -1 -> 石
  // 0 -> 画像無しセル
  // 1-8 -> 数字セル
  // 9 -> 石+はてな
  // 10 -> 石+旗
  // 11 -> ボムセル
  //表示するマップ
  const board = [...Array(lenY)].map(() => [...Array(lenX)].map(() => -1));
  // console.log('board1', board);

  //最初のクリックかどうか
  const isFirst = !bombMap.flat().includes(1);

  //プレイ中かの判定
  const isPlaying = userInput.some((row) => row.some((input) => input !== 0));

  //爆発したボム数
  const numburst = userInput
    .map((row, y) => row.filter((input, x) => input === 1 && bombMap[y][x] === 1))
    .flat()
    .filter((num) => num === 1).length;

  //ライフ数(基本は1)
  const RemainLives = lives - numburst;

  //負けの判定
  const isFailure = isPlaying && !RemainLives;
  // // console.log('lives', lives);
  // console.log('num', numburst);

  //ライフが減ったかどうかの判定
  const isDamage = numburst;

  //クリアの判定
  const isSuccess =
    isPlaying &&
    !isFailure &&
    lenX * lenY > bombCount &&
    userInput.flat().filter((cell) => cell !== 1).length <= bombCount - numburst;

  //8方向
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
    const interval: NodeJS.Timeout | null =
      startTime !== null
        ? setInterval(() => {
            const elapsed = Math.floor((Date.now() - (startTime || 0)) / 1000);
            elapsed + 990;
            const hundreds = Math.floor(elapsed / 100);
            const tens = Math.floor((elapsed % 100) / 10);
            const ones = elapsed % 10;
            // console.log('elapsed', elapsed);

            if (elapsed >= 999) {
              setStartTime(null);
            }

            setTimer({ hundreds, tens, ones });
          }, 1000)
        : null;

    const checkGameState = () => {
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
  }, [startTime, setStartTime, setTimer, isFailure, isSuccess]);

  //メニューを非表示にする
  const noContext = (event: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    // console.log('非表示');

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
    // console.log('右クリック', userInput, board);

    setUserInput(newInput);
  };

  //再帰的に石を開ける関数
  const checkZeroCells = (
    x: number,
    y: number,
    newMap: number[][],
    newInput: (0 | 1 | 2 | 3)[][],
  ): void => {
    // console.log('checkZerolist');
    // console.log('bombMap2', newMap);

    if (x < 0 || x >= lenX || y < 0 || y >= lenY) {
      return;
    }

    if (newInput[y][x] !== 1) {
      newInput[y][x] = 1;
      // console.log('OpenCell');

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

  //左クリックしたときにする関数
  const clickstone = (x: number, y: number) => {
    // console.log(x, y);
    const newInput = structuredClone(userInput);
    const newMap = structuredClone(bombMap);

    if (userInput[y][x] === 3 || isFailure || isSuccess) {
      return;
    }

    //初回のみbombMapにボムや数字を配置
    if (isFirst) {
      setStartTime(Date.now());
      while (newMap.flat().filter((bomb) => bomb === 1).length < bombCount) {
        // console.log('ループ', newMap.flat().filter((bomb) => bomb === 1).length);
        // console.log('newMap', newMap);

        const bombY: number = Math.floor(Math.random() * lenY);
        const bombX: number = Math.floor(Math.random() * lenX);
        //ボム配置ループやり直し
        if (newMap[bombY][bombX] === 1 || (lenX * lenY > bombCount && bombY === y && bombX === x)) {
          // console.log('被り', bombY, bombX);
          // console.log('newMap[bombY][bombX]', newMap[bombY][bombX]);
          continue;
        }
        newMap[bombY][bombX] = 1;

        // console.log('bombの位置:', bombY, bombX);
        //数字を配置
        directions.forEach(([dy, dx]) => {
          const aroundY = bombY + dy;
          const aroundX = bombX + dx;
          // console.log('ボム周辺', aroundY, aroundX);
          if (
            newMap[aroundY] !== undefined &&
            newMap[aroundY][aroundX] !== undefined &&
            newMap[aroundY][aroundX] !== 1
          ) {
            // console.log('aroundNum');
            if (newMap[aroundY][aroundX] >= 2) {
              newMap[aroundY][aroundX]++;
            } else {
              newMap[aroundY][aroundX] = 2;
            }
          }
        });
      }

      setBombMap(newMap);
    }
    //再帰的にセルを開ける
    checkZeroCells(x, y, newMap, newInput);

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
      //残機カスタムのため
      //クリックしたらボムを表示
      if (userInput[y][x] === 1 && bombMap[y][x] === 1) {
        board[y][x] = 11;
      }
      //失敗したら全ボムを表示
      if (isFailure && bombMap[y][x] === 1) {
        board[y][x] = 11;
      }
      //成功時したらボムを旗に変える
      if (isSuccess && bombMap[y][x] === 1) {
        board[y][x] = 10;
      }
    }),
  );

  //ボムの残りの数
  const RemainBomb = bombCount - board.flat().filter((flag) => flag === 10).length;

  //レベル変更・カスタム更新時にボードを作成し直す関数
  const MakeBoard = (lenY: number, lenX: number): void => {
    setStartTime(null);
    setTimer({ hundreds: 0, tens: 0, ones: 0 });

    // console.log('level', level);
    // console.log('lenY, lenX', lenY, lenX);
    setUserInput([...Array(lenY)].map(() => [...Array(lenX)].map(() => 0)));
    setBombMap([...Array(lenY)].map(() => [...Array(lenX)].map(() => 0)));
  };

  //レベルをセットする関数
  const Levelset = (level: 'lev1' | 'lev2' | 'lev3' | 'custom'): void => {
    setLevel(level);
    const [newLenY, newLenX] = setLenBomb(level);

    MakeBoard(newLenY, newLenX);
  };

  //カスタムで入力させる関数
  const handleInputChange =
    (index: number) =>
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const newValues = [...inputValues];
      const value = parseInt(event.target.value, 10);
      newValues[index] = isNaN(value) ? 0 : value;

      // console.log('入力された値:', newValues);

      setInputValues(newValues);
    };

  //入力した値を取得する関数
  const handleSubmit = (): void => {
    if (inputValues[0] * inputValues[1] < inputValues[2]) {
      inputValues[2] = inputValues[0] * inputValues[1];
    }
    setCustomValues(inputValues);
    MakeBoard(inputValues[0], inputValues[1]);
    // console.log('取得した値:', inputValues);
  };

  //残機を設定する関数
  const handleInputLives = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newLives = parseInt(event.target.value, 10);
    if (isNaN(newLives)) {
      setLives(1);
    } else if (newLives > bombCount) {
      setLives(bombCount);
    } else {
      setLives(newLives);
    }
  };
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>): void => {
    event.target.select();
  };

  //ページをリロードする関数
  const Reload = () => {
    Levelset(level);
  };

  return (
    <div className={styles.container}>
      <div className={styles.menueStyle}>
        <LevelButton levelName="lev1" currentLevel={level} onLevelSelect={Levelset} />
        <LevelButton levelName="lev2" currentLevel={level} onLevelSelect={Levelset} />
        <LevelButton levelName="lev3" currentLevel={level} onLevelSelect={Levelset} />
        <LevelButton levelName="custom" currentLevel={level} onLevelSelect={Levelset} />
      </div>

      {level === 'custom' && (
        <CustomButton
          inputValues={inputValues}
          onInputChange={handleInputChange}
          onhandleSubmit={handleSubmit}
        />
      )}

      <div
        className={styles.backboardStyle}
        style={{
          width: `${lenX * 30 + 60}px`,
          height: `${lenY * 31 + 130}px`,
        }}
      >
        {lenX > 3 && (
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
            {lenX > 7 && (
              <div
                className={styles.resetStyle}
                style={{
                  backgroundPosition: `${-40 * (isSuccess ? 12 : isFailure ? 13 : 11)}px 0px`,
                }}
              />
            )}
            {lenX > 5 && (
              <div className={styles.timeStyle}>
                <div
                  id="hundreds"
                  className={`${styles.displayStyle} ${styles[`d${timer.hundreds}`]}`}
                />
                <div id="tens" className={`${styles.displayStyle} ${styles[`d${timer.tens}`]}`} />
                <div id="ones" className={`${styles.displayStyle} ${styles[`d${timer.ones}`]}`} />
              </div>
            )}
          </div>
        )}
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
                onContextMenu={(event) => {
                  // console.log('右クリック');
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
                  <div
                    className={styles.sampleStyle}
                    style={{
                      backgroundPosition: `${-25 * (cell - 1)}px 0px`,
                      backgroundColor:
                        userInput[y][x] === 1 && bombMap[y][x] === 1 ? 'red' : 'inherit',
                    }}
                  />
                )}
              </div>
            )),
          )}
        </div>
      </div>
      {!isPlaying && (
        <div>
          残機：
          <input
            type="text"
            value={lives}
            size={3}
            id="width"
            onChange={handleInputLives}
            onFocus={handleFocus}
          />
        </div>
      )}
      {isPlaying &&
        /* 残機追加カスタム */
        lenX > 3 && (
          <div
            className={styles.lifeStyle}
            onClick={() => Reload()}
            style={{
              width: `${7 * 30 + 10}px`,
            }}
          >
            {lenX > 5 && (
              <div
                className={styles.resetStyle}
                style={{
                  backgroundPosition: `${-40 * (isFailure || isDamage ? 13 : isSuccess ? 12 : 11)}px 0px`,
                }}
              />
            )}
            <div style={{ fontSize: 50, fontWeight: 700 }} className={styles.xStyle}>
              ×
            </div>
            <div className={styles.livesStyle}>
              <div
                className={`${styles.displayStyle} ${styles[`d${Math.floor((RemainLives % 100) / 10)}`]}`}
              />
              <div className={`${styles.displayStyle} ${styles[`d${RemainLives % 10}`]}`} />
            </div>
          </div>
        )}
    </div>
  );
};

export default Home;
