const longDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

export function formatReleaseDate(value) {
  if (!value) return 'To be announced'
  const [year, month, day] = value.split('-').map(Number)
  return longDate.format(new Date(year, month - 1, day))
}
