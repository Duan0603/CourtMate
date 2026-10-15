'use client';

import { useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import styles from './FavoriteButton.module.css';

export function FavoriteButton({ selected, name, pending = false, onToggle, className = '', appearance = 'default' }: {
  selected: boolean;
  name: string;
  pending?: boolean;
  onToggle: () => void | Promise<unknown>;
  className?: string;
  appearance?: 'default' | 'icon' | 'on-image';
}) {
  const busy = useRef(false);
  const [loading, setLoading] = useState(false);

  return <button
    type="button"
    aria-label={`${selected ? 'Bỏ yêu thích' : 'Yêu thích'} ${name}`}
    aria-pressed={selected}
    aria-busy={pending || loading}
    disabled={pending || loading}
    className={`${styles.button} ${appearance === 'icon' ? styles.icon : appearance === 'on-image' ? styles.onImage : ''} ${className}`}
    onClick={async event => {
      event.preventDefault();
      event.stopPropagation();
      if (busy.current || pending) return;
      busy.current = true;
      setLoading(true);
      try { await onToggle(); }
      finally { busy.current = false; setLoading(false); }
    }}
  ><Heart size={18} fill={selected ? 'currentColor' : 'none'} /></button>;
}
