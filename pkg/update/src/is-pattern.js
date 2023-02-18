// Detects if the input name is a wildcard pattern or not.
export default function isPattern(pattern) {
  return pattern.includes('*') || pattern.includes('?')
}
