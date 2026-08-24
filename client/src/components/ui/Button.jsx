import { Loader2 } from 'lucide-react'

/* eslint-disable react/prop-types */

export default function Button({ children, variant = 'primary', loading = false, disabled = false, className = '', leadingIcon, trailingIcon, ...props }) {
  const variantClass = variant === 'secondary' ? 'btn-secondary' : variant === 'ghost' ? 'btn-ghost' : 'btn-primary'
  return (
    <button className={`${variantClass} ${className}`} disabled={disabled || loading} {...props}>
      {loading ? <Loader2 size={16} className="icon-spin" aria-hidden="true" /> : leadingIcon}
      <span>{loading ? 'Working...' : children}</span>
      {!loading && trailingIcon}
    </button>
  )
}
