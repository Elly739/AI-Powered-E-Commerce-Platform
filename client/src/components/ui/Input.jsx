/* eslint-disable react/prop-types */

export default function Input({ label, error, hint, className = '', ...props }) {
  return <label className={`field ${className}`}>
    {label && <span>{label}</span>}
    <input {...props} />
    {error && <small className="form-error">{error}</small>}
    {!error && hint && <small className="muted">{hint}</small>}
  </label>
}
