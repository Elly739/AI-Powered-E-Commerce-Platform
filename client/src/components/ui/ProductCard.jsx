import { Link } from 'react-router-dom'
import { ArrowUpRight, Heart, Star } from 'lucide-react'
import Badge from './Badge'

/* eslint-disable react/prop-types */

export default function ProductCard({ product, index = 0 }) {
  const available = product.stockQuantity > 0
  return <Link to={`/products/${product.id}`} className="product-card">
    <div className={`product-image product-image-${index % 3}`}>
      <span>{String(index + 1).padStart(2, '0')}</span>
      <span className="wishlist-dot" aria-label={`Save ${product.name}`} role="button" tabIndex="0"><Heart size={16} /></span>
      <span className="view-label">View <ArrowUpRight size={14} /></span>
    </div>
    <div className="product-meta"><div><span className="product-category">{product.categoryName}</span><h3>{product.name}</h3></div><strong>${product.price}</strong></div>
    <p>{product.description}</p>
    <div className="product-card-footer">
      <Badge tone={available ? 'success' : 'danger'}>{available ? `${product.stockQuantity} in stock` : 'Sold out'}</Badge>
      <span className="rating-pill"><Star size={13} fill="currentColor" /> 4.8</span>
    </div>
  </Link>
}
