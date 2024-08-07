import { useState } from 'react';
export default function useTimer() {
  const [timer, setTimer] = useState({ hundreds: 0, tens: 0, ones: 0 });
  return { timer, setTimer };
}
