import { useEffect, useState } from 'react';
import { listVoices, narrationVoices, onVoicesChanged } from '../lib/narration';

/** The narration voices the browser offers, refreshed when it finishes loading them. */
export default function useVoices() {
  const [voices, setVoices] = useState(() => narrationVoices(listVoices()));

  useEffect(() => {
    const refresh = () => setVoices(narrationVoices(listVoices()));
    refresh();
    return onVoicesChanged(refresh);
  }, []);

  return voices;
}
