import { useState } from 'react';
export default function useUserInput(lenY: number, lenX: number) {
  const [userInput, setUserInput] = useState<(0 | 1 | 2 | 3)[][]>(
    [...Array(lenY)].map(() => [...Array(lenX)].map(() => 0)),
  );
  return { userInput, setUserInput };
}
