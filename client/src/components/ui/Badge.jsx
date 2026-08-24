/* eslint-disable react/prop-types */

export default function Badge({ children, tone = 'neutral', className = '' }) {
  return <span className={`status-badge status-${tone} ${className}`}>{children}</span>
}
