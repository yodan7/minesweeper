import { useState } from 'react';
export default function useInputValues() {
  const [inputValues, setInputValues] = useState<number[]>([30, 30, 120]);
  return { inputValues, setInputValues };
}
