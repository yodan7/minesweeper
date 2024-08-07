import { useState } from 'react';
export default function useBombMap(lenY: number, lenX: number) {
  const [bombMap, setBombMap] = useState<number[][]>(
    [...Array(lenY)].map(() => [...Array(lenX)].map(() => 0)),
  );
  return { bombMap, setBombMap };
}
