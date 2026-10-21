'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCw } from 'lucide-react';
import styles from './ComparisonDeck.module.css';

interface ComparisonItem {
  id: string;
  title: string;
  before: string;
  solution: string;
  tagBefore: string;
  tagAfter: string;
}

export function ComparisonDeck({ items }: { items: ComparisonItem[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [drag, setDrag] = useState(0);
  const [exit, setExit] = useState(0);
  const gesture = useRef<{ x: number; y: number; time: number; horizontal: boolean } | null>(null);
  const suppressClick = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const next = (direction = -1) => {
    if (index >= items.length || exit) return;
    setExit(direction);
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
    timer.current = setTimeout(() => {
      setIndex(value => Math.min(value + 1, items.length));
      setDrag(0);
      setExit(0);
    }, duration);
  };
  const previous = () => {
    if (exit) return;
    setDrag(0);
    setIndex(value => Math.max(0, value - 1));
  };

  return (
    <div className={styles.deck} role="region" aria-label="Thẻ thực trạng và giải pháp CourtMate" aria-roledescription="carousel"
      onKeyDown={event => {
        if (event.key === 'ArrowRight') { event.preventDefault(); next(); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); previous(); }
      }}>
      <div className={styles.stage}>
        {index === items.length && (
          <div className={styles.complete}>
            <CheckCircle2 size={44} aria-hidden="true" />
            <h3>Bạn đã xem hết các thẻ.</h3>
            <p>Quay lại để xem thêm một lần nữa.</p>
            <button type="button" className={styles.restart} onClick={() => setIndex(0)}><RotateCw size={17} /> Xem lại từ đầu</button>
          </div>
        )}
        {items.slice(index, index + 3).map((item, depth) => {
          const active = depth === 0;
          const isFlipped = !!flipped[item.id];
          return (
            <div key={item.id} className={styles.card} data-depth={depth} data-active={active} data-dragging={active && drag !== 0 && !exit}
              style={{ zIndex: items.length - depth, transform: active ? `translateX(${exit ? exit * 560 : drag}px) rotate(${exit ? exit * 20 : drag / 22}deg)` : undefined, opacity: active && exit ? 0 : 1 }}>
              <button type="button" className={styles.flipButton} tabIndex={active ? 0 : -1} aria-hidden={!active}
                aria-label={`${item.title}: ${isFlipped ? 'xem lại thực trạng' : 'lật xem giải pháp'}`} aria-pressed={isFlipped}
                onPointerDown={event => {
                  if (!active || exit || event.button !== 0) return;
                  suppressClick.current = false;
                  gesture.current = { x: event.clientX, y: event.clientY, time: performance.now(), horizontal: false };
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={event => {
                  const start = gesture.current;
                  if (!start || !active) return;
                  const dx = event.clientX - start.x;
                  if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(event.clientY - start.y)) start.horizontal = true;
                  if (start.horizontal) { suppressClick.current = true; setDrag(dx); }
                }}
                onPointerUp={event => {
                  const start = gesture.current;
                  gesture.current = null;
                  if (!start || !active) return;
                  const dx = event.clientX - start.x;
                  const speed = Math.abs(dx) / Math.max(1, performance.now() - start.time);
                  if (start.horizontal && (Math.abs(dx) > 80 || (Math.abs(dx) > 30 && speed > .55))) next(dx > 0 ? 1 : -1);
                  else setDrag(0);
                }}
                onPointerCancel={() => { gesture.current = null; setDrag(0); suppressClick.current = true; }}
                onLostPointerCapture={() => { gesture.current = null; }}
                onClick={() => {
                  if (suppressClick.current) { suppressClick.current = false; return; }
                  if (active && !exit) setFlipped(value => ({ ...value, [item.id]: !value[item.id] }));
                }}>
                <span className={styles.rotator} data-flipped={isFlipped}>
                  <span className={styles.face} aria-hidden={isFlipped}>
                    <span className={styles.cardHeader}><span className={styles.tag}><span />{item.tagBefore}</span><span>{String(index + depth + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span></span>
                    <span className={styles.content}><span className={styles.title}>{item.title}</span><span className={styles.description}>“{item.before}”</span></span>
                    <span className={styles.cardFooter}><span>Vấn đề người chơi gặp phải</span><span>Xem giải pháp <ArrowRight size={16} /></span></span>
                  </span>
                  <span className={`${styles.face} ${styles.back}`} aria-hidden={!isFlipped}>
                    <span className={styles.cardHeader}><span className={styles.tag}><CheckCircle2 size={15} />{item.tagAfter}</span><span>{String(index + depth + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span></span>
                    <span className={styles.content}><span className={styles.title}>{item.title}</span><span className={styles.description}>{item.solution}</span></span>
                    <span className={styles.cardFooter}><span>Đã có trên CourtMate</span><span>Xem thực trạng <RotateCw size={16} /></span></span>
                  </span>
                </span>
              </button>
            </div>
          );
        })}
      </div>
      <div className={styles.controls}>
        <div className={styles.controlSlot}>{index > 0 && <button type="button" onClick={previous} disabled={!!exit} aria-label="Quay lại thẻ trước" className={styles.arrow}><ArrowLeft size={20} /></button>}</div>
        <p aria-live="polite" aria-atomic="true">{index < items.length ? `Thẻ ${index + 1} / ${items.length} · Kéo sang bên để tiếp tục` : `Đã xem ${items.length} / ${items.length} thẻ`}</p>
        <div className={styles.controlSlot}>{index < items.length && <button type="button" onClick={() => next()} disabled={!!exit} aria-label="Xem thẻ tiếp theo" className={styles.arrow}><ArrowRight size={20} /></button>}</div>
      </div>
    </div>
  );
}
