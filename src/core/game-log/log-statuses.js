export const LOG_STATUSES = {
  COMPLETED: { label: 'Completed', classes: 'border-accent/25 bg-accent/12 text-emerald-400' },
  PLAYING: { label: 'Playing', classes: 'border-info/25 bg-info/12 text-sky-400' },
  BACKLOG: { label: 'Backlog', classes: 'border-slate-400/20 bg-slate-400/10 text-slate-300' },
  WISHLIST: { label: 'Wishlist', classes: 'border-star/25 bg-star/12 text-amber-400' },
  DROPPED: { label: 'Dropped', classes: 'border-danger/25 bg-danger/12 text-red-400' },
}

export const isLogStatus = (value) => Object.hasOwn(LOG_STATUSES, value)
