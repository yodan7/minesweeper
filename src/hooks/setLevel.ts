import { useState } from 'react';
export default function useLevel() {
  const [level, setLevel] = useState<'lev1' | 'lev2' | 'lev3' | 'custom'>('lev1');
  return { level, setLevel };
}
