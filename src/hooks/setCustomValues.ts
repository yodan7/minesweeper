import { useState } from 'react';
export default function useCustomValues() {
  const [customValues, setCustomValues] = useState<number[]>([30, 30, 120]);
  return { customValues, setCustomValues };
}
