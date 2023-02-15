export default function isPattern(pattern) {
  return pattern.includes('*') || pattern.includes('?')
}
