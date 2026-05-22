export function pluralPoints(n: number): string {
  const last2 = n % 100
  const last1 = n % 10
  if (last2 >= 11 && last2 <= 19) return `${n} очок`
  if (last1 === 1) return `${n} очко`
  if (last1 >= 2 && last1 <= 4) return `${n} очки`
  return `${n} очок`
}
