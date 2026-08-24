export default function Button({ children, variant = 'primary', loading = false, disabled = false, className = '', ...props }) {
  const variantClass = variant === 'secondary' ? 'btn-secondary' : 'btn-primary'
  return <button className={`${variantClass} ${className}`} disabled={disabled || loading} {...props}>{loading ? 'Working...' : children}</button>
}
