export const valueBetweenMinAndMax = (value: number, MIN: number, MAX: number) => {
  if (value > MAX) {
    return MAX
  }

  if (value < MIN) {
    return MIN;
  }

  return value;
}

export const formatNextMatchInSeconds = (milliseconds: number): string => {
  return (
    `${new Date(milliseconds).toISOString().slice(14, 19)}`
  )
}
