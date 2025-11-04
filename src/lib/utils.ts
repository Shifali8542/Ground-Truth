import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRunDateTime(dateTimeStr: string): string {
  try {
    const formattedStr = dateTimeStr.replace('_', 'T').replace(/-/g, ':').replace(':', '-').replace(':', '-');
    const [datePart, timePart] = dateTimeStr.split('_');
    const [year, month, day] = datePart.split('-');
    const [hour, minute, second] = timePart.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
    if (isNaN(date.getTime())) {
      return dateTimeStr;
    }

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    console.error('Failed to format date time:', e);
    return dateTimeStr;
  }
}
