import { useState } from 'react';

export default function useLives() {
  const [lives, setLives] = useState(1);

  return { lives, setLives };
}
