import { useState } from 'react';
export default function useStartTime() {
  const [startTime, setStartTime] = useState<number | null>(null);
  return { startTime, setStartTime };
}
