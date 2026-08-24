import { Link } from 'react-router-dom'
import Badge from './Badge'

export default function ProductCard({ product, index = 0 }) {
  const available = product.stockQuantity > 0
  return <Link to={`/products/${product.id}`} className="product-card">
    <div className={`product-image product-image-${index % 3}`}>
      <span>{String(index + 1).padStart(2, '0')}</span>
      <span className="view-label">View piece ↗</span>
    </div>
    <div className="product-meta"><div><span className="product-category">{product.categoryName}</span><h3>{product.name}</h3></div><strong>${product.price}</strong></div>
    <p>{product.description}</p>
    <Badge tone={available ? 'success' : 'danger'}>{available ? 'In stock' : 'Sold out'}</Badge>
  </Link>
}
