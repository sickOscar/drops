export const valueBetweenMinAndMax = (value: number, MIN: number, MAX: number) => {
  if (value > MAX) {
    return MAX
  }

  if (value < MIN) {
    return MIN;
  }

  return value;
}
