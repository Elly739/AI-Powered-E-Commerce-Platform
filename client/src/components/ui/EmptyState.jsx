import { Link } from 'react-router-dom'

/* eslint-disable react/prop-types */

export default function EmptyState({ eyebrow = 'Nothing here yet', title, message, actionLabel, actionTo = '/products' }) {
  return <div className="empty-state"><span className="eyebrow">{eyebrow}</span><h3>{title}</h3>{message && <p className="muted">{message}</p>}{actionLabel && <Link to={actionTo} className="text-link">{actionLabel}</Link>}</div>
}
