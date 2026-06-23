import { format, formatDistanceToNow } from 'date-fns'

export function fmtDate(d?: Date): string {
  return d ? format(d, 'd MMM yyyy, HH:mm') : '—'
}

export function fmtRelative(d?: Date): string {
  return d ? formatDistanceToNow(d, { addSuffix: true }) : '—'
}

export function fmtNumber(n?: number): string {
  return (n ?? 0).toLocaleString('en-US')
}

export function titleCase(s: string): string {
  return s.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
