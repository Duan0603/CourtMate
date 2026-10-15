'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export type DemoReview = { author: string; rating: number; comment: string; coachId: string; bookingId: string };
export type DemoBooking = {
  id: string; coachId: string; title: string; date: string; time: string;
  location: string; total: number; deposit: number; sport: string;
  status: 'paid' | 'completed' | 'reviewed';
};
type DemoState = { favorites: string[]; bookings: DemoBooking[]; reviews: DemoReview[] };
const empty: DemoState = { favorites: [], bookings: [], reviews: [] };


// A single local demo store is shared by the directory and profile routes.
export function useCoachDemo() {
  const { user, toggleCoachFavorite } = useAuth();
  const key = user?.id ? `courtmate-coach-bookings-v1:${user.id}` : null;
  const [state, setState] = useState<DemoState>(empty);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setState(empty);
    setReady(false);
    if (!key) { setReady(true); return; }
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved.favorites) && Array.isArray(saved.bookings) && Array.isArray(saved.reviews)) setState(saved);
      }
    } catch { /* Storage may be disabled; the demo still works in memory. */ }
    setReady(true);
  }, [key]);
  function update(change: (previous: DemoState) => DemoState) {
    if (!key) return;
    setState(previous => {
      const next = change(previous);
      try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* In-memory fallback. */ }
      return next;
    });
  }
  return {
    ...state, ready,
    favorites: user?.bookmarkedCoaches || [],
    toggleFavorite: toggleCoachFavorite,
    addBooking: (booking: DemoBooking) => update(s => ({ ...s, bookings: [booking, ...s.bookings] })),
    complete: (id: string) => update(s => ({ ...s, bookings: s.bookings.map(b => b.id === id && b.status === 'paid' ? { ...b, status: 'completed' } : b) })),
    review: (review: DemoReview) => update(s => {
      if (!s.bookings.some(b => b.id === review.bookingId && b.coachId === review.coachId && b.status === 'completed')) return s;
      return { ...s, reviews: [review, ...s.reviews], bookings: s.bookings.map(b => b.id === review.bookingId ? { ...b, status: 'reviewed' } : b) };
    }),
  };
}
