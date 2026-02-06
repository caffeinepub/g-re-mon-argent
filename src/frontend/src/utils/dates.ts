import type { Time } from '../backend';

export function isToday(timestamp: Time): boolean {
  const date = new Date(Number(timestamp) / 1_000_000);
  const today = new Date();
  
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function isInMonth(timestamp: Time, year: number, month: number): boolean {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.getFullYear() === year && date.getMonth() + 1 === month;
}
