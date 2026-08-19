# E-Commerce Backend API

Node.js + Express backend for the AI-Powered E-Commerce Platform.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL or MongoDB
- npm or yarn

### Installation

```bash
npm install
```

### Environment Setup

Create `.env` file:

```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE_IN=24h
STRIPE_SECRET_KEY=sk_test_...
AI_SERVICE_URL=http://localhost:8000
```

### Development

```bash
npm run dev
```

Server runs on: `http://localhost:5000`

### Production

```bash
npm start
```

## 📁 Project Structure

```
src/
├── config/         # Database and external service configs
├── middleware/     # Express middleware (auth, error handling)
├── routes/         # API endpoints (to be created)
├── controllers/    # Business logic (to be created)
├── models/         # Database models (to be created)
├── services/       # Service layer (to be created)
├── utils/          # Utility functions
└── index.js        # Entry point
```

## 🔌 API Endpoints

### Health Check
```
GET /health
```

### Authentication (Phase 2)
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
```

### Products (Phase 3)
```
GET /api/products
GET /api/products/:id
POST /api/products (admin)
PUT /api/products/:id (admin)
DELETE /api/products/:id (admin)
```

### Cart (Phase 4)
```
GET /api/cart
POST /api/cart/add
PUT /api/cart/:itemId
DELETE /api/cart/:itemId
```

### Orders (Phase 5)
```
GET /api/orders
POST /api/orders
GET /api/orders/:id
PUT /api/orders/:id
```

### Payments (Phase 5)
```
POST /api/payments
POST /api/payments/webhook
```

### Search (Phase 6)
```
GET /api/search?q=query
```

### Recommendations (Phase 7)
```
GET /api/recommendations/products/:id
GET /api/recommendations/personalized
```

### Chat (Phase 8)
```
POST /api/chat
GET /api/chat/history
```

### Reviews (Phase 9)
```
GET /api/products/:id/reviews
POST /api/products/:id/reviews
PUT /api/reviews/:id
DELETE /api/reviews/:id
```

### Admin Dashboard (Phase 10)
```
GET /api/admin/analytics
GET /api/admin/orders
GET /api/admin/products
```

### Coupons (Phase 11)
```
GET /api/coupons
POST /api/coupons (admin)
POST /api/coupons/validate
```

## 🔒 Authentication

JWT-based authentication. Include token in Authorization header:

```
Authorization: Bearer <token>
```

## 📦 Dependencies

- **express** - Web framework
- **cors** - CORS middleware
- **dotenv** - Environment variables
- **morgan** - HTTP logger
- **pg** - PostgreSQL client
- **mongoose** - MongoDB ORM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **axios** - HTTP client
- **joi** - Schema validation

## 🧪 Testing

```bash
npm test
```

## 📊 Database

### PostgreSQL Setup

```sql
CREATE DATABASE ecommerce_db;
CREATE USER ecommerce_user WITH PASSWORD 'ecommerce_password';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;
```

### Database Schema

Tables to be created in Phase 2-11:
- `users`
- `products`
- `categories`
- `cart_items`
- `orders`
- `order_items`
- `payments`
- `reviews`
- `wishlist`
- `coupons`

## 🚀 Deployment

### Render

1. Connect GitHub repository
2. Set environment variables
3. Select Node as runtime
4. Run: `npm start`

### Railway

1. Create project and connect GitHub
2. Set environment variables
3. Deploy

### Heroku

```bash
git push heroku main
```

## 📝 License

MIT

## 🤝 Contributing

1. Create feature branch
2. Commit changes
3. Push to branch
4. Create Pull Request
