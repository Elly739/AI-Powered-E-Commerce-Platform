export default function Badge({ children, tone = 'neutral' }) {
  return <span className={`status-badge status-${tone}`}>{children}</span>
}
