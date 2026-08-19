# AI-Powered E-Commerce Platform

A full-stack e-commerce application enhanced with AI-powered recommendations, intelligent search, and an AI shopping assistant.

## 🎯 Features

- 👤 User Authentication (Register, Login, Profile)
- 🛍️ Product Browsing & Management
- 🔍 AI-Powered Semantic Search
- 🧠 Intelligent Recommendations Engine
- 🛒 Shopping Cart & Wishlist
- 💳 Secure Payment Processing (Stripe/Razorpay)
- 📦 Order Tracking & Management
- 🤖 AI Shopping Assistant Chatbot
- ⭐ Reviews & Ratings System
- 📊 Admin Dashboard & Analytics
- 🎁 Coupons & Discounts
- 📱 Responsive Design

## 🏗️ Project Structure

```
ai-ecommerce/
├── client/              # React + Vite frontend
├── server/              # Node.js + Express backend
├── ai-service/          # Python + FastAPI AI service
├── docker-compose.yml   # Local development setup
└── README.md
```

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React, Vite, Tailwind CSS, Axios |
| **Backend** | Node.js, Express.js, JWT, bcrypt |
| **Database** | PostgreSQL / MongoDB |
| **AI/ML** | Python, FastAPI, scikit-learn, numpy |
| **Payments** | Stripe / Razorpay |
| **Deployment** | Docker, Vercel, Render/Railway |

## 📋 Prerequisites

- **Node.js** (v18+) and npm/yarn
- **Python** (v3.8+)
- **PostgreSQL** or **MongoDB**
- **Git**
- **Docker** (optional, for containerized development)

## 🚀 Quick Start

### 1. Clone & Setup

```bash
cd ai-ecommerce
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

### 3. Backend Setup

```bash
cd server
npm install
npm run dev
```

Backend runs on: `http://localhost:5000`

### 4. AI Service Setup

```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

AI Service runs on: `http://localhost:8000`

## 📁 Environment Variables

Create `.env` files in each service:

### Frontend (`client/.env`)
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_AI_SERVICE_URL=http://localhost:8000
```

### Backend (`server/.env`)
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_key
AI_SERVICE_URL=http://localhost:8000
NODE_ENV=development
```

### AI Service (`ai-service/.env`)
```
FASTAPI_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
LLM_API_KEY=your_llm_api_key
PORT=8000
```

## 🐳 Docker Setup (Optional)

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database (port 5432)
- Backend (port 5000)
- Frontend (port 5173)
- AI Service (port 8000)

## 📖 Development Phases

See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for the complete 12-week development roadmap.

### Phase 1: Setup ✅
- Project structure
- Environment configuration
- Dependencies installation

### Phase 2-12: Feature Implementation
- Authentication
- Product Management
- Shopping Cart & Wishlist
- Payments & Orders
- AI Search
- Recommendations
- Chatbot
- Reviews
- Admin Dashboard
- Coupons
- Testing & Deployment

## 🔗 API Documentation

### Backend API
- Base URL: `http://localhost:5000/api`
- Endpoints: `/auth`, `/products`, `/cart`, `/orders`, `/chat`, etc.
- Full documentation: See `server/README.md`

### AI Service API
- Base URL: `http://localhost:8000`
- Endpoints: `/search`, `/recommendations`, `/chat`, etc.
- API Docs: `http://localhost:8000/docs`

## 🧪 Testing

```bash
# Backend
cd server
npm test

# Frontend
cd client
npm test

# AI Service
cd ai-service
pytest
```

## 📦 Deployment

### Frontend
```bash
cd client
npm run build
# Deploy dist/ to Vercel or Netlify
```

### Backend
```bash
# Deploy to Render, Railway, or Heroku
npm run build
npm start
```

### AI Service
```bash
# Deploy to Render, Railway, or AWS
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Environment variables for secrets
- CORS configured
- Input validation & sanitization
- SQL injection prevention
- XSS protection

## 📊 Database Schema

See database documentation:
- [Backend DB Schema](./server/docs/database-schema.md)
- [AI Service DB Schema](./ai-service/docs/database-schema.md)

## 📝 License

MIT License - See LICENSE file

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add feature'`
3. Push: `git push origin feature/your-feature`
4. Create a Pull Request

## 📞 Support

For questions or issues, please open an issue on GitHub or contact the team.

## 🚀 Roadmap

- [ ] Phase 1: Foundation (Week 1-2)
- [ ] Phase 2: Authentication (Week 2-3)
- [ ] Phase 3: Products (Week 3-4)
- [ ] Phase 4: Cart & Wishlist (Week 4)
- [ ] Phase 5: Payments (Week 5)
- [ ] Phase 6: AI Search (Week 6)
- [ ] Phase 7: Recommendations (Week 7)
- [ ] Phase 8: Chatbot (Week 8)
- [ ] Phase 9: Reviews (Week 9)
- [ ] Phase 10: Admin Dashboard (Week 10)
- [ ] Phase 11: Coupons (Week 11)
- [ ] Phase 12: Testing & Deployment (Week 12)

---

**Build. Ship. Innovate.** 🚀
