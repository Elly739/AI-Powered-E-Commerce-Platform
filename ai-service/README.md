# E-Commerce AI Service

Python + FastAPI AI service for the E-Commerce Platform.

Features:
- 🔍 AI-Powered Semantic Search (Phase 6)
- 🧠 Intelligent Recommendations Engine (Phase 7)
- 🤖 AI Shopping Assistant Chatbot (Phase 8)

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip or poetry

### Installation

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Environment Setup

Create `.env` file:

```
FASTAPI_ENV=development
PORT=8000
DATABASE_URL=postgresql://ecommerce_user:ecommerce_password@localhost:5432/ecommerce_db
LLM_API_KEY=your_llm_api_key
LLM_PROVIDER=openai
LLM_MODEL=gpt-3.5-turbo
BACKEND_URL=http://localhost:5000
```

### Development

```bash
python main.py
# or
uvicorn main:app --reload
```

Service runs on: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

## 📁 Project Structure

```
ai-service/
├── services/              # AI service modules
│   ├── search_service.py       # Search implementation
│   ├── recommendation_service.py # Recommendations
│   └── chatbot_service.py      # Chatbot
├── models/               # Data models (Phase 2+)
├── utils/                # Utility functions
├── config.py             # Configuration
├── main.py              # Entry point
└── requirements.txt     # Dependencies
```

## 🔌 API Endpoints

### Health Check
```
GET /health
```

### Search (Phase 6)
```
GET /search?q=<query>
```

### Embeddings
```
POST /embeddings
Body: {"text": "product query"}
```

### Recommendations (Phase 7)
```
GET /recommendations/products/{product_id}
GET /recommendations/personalized?user_id=<id>
```

### Chat (Phase 8)
```
POST /chat
Body: {"message": "...", "session_id": "..."}

GET /chat/history/{session_id}
```

### API Documentation
```
GET /docs         # Swagger UI
GET /redoc        # ReDoc documentation
```

## 🧠 AI Features (To be implemented)

### Phase 6: AI-Powered Search
- Natural language query understanding
- Intent extraction
- Semantic search with embeddings
- Filter generation from queries
- Result ranking and relevance

### Phase 7: Recommendations Engine
- Collaborative filtering
- Content-based filtering
- Hybrid recommendations
- Product similarity scoring
- Trending product detection

### Phase 8: Shopping Assistant Chatbot
- Product Q&A
- Recommendation from chat
- Comparison queries
- Shopping guidance
- Order tracking assistance

## 🔧 Dependencies

- **fastapi** - Web framework
- **uvicorn** - ASGI server
- **pydantic** - Data validation
- **numpy** - Numerical computing
- **scikit-learn** - ML algorithms
- **pandas** - Data processing
- **httpx** - Async HTTP client
- **sqlalchemy** - ORM
- **asyncpg** - Async PostgreSQL

## 🧪 Testing

```bash
pytest
```

## 📦 Modules to Implement

- [ ] Search Service (Phase 6)
- [ ] Recommendation Service (Phase 7)
- [ ] Chatbot Service (Phase 8)
- [ ] Embedding Generator
- [ ] Product Knowledge Base
- [ ] User Preference Tracker
- [ ] Search Analytics
- [ ] Recommendation Evaluator

## 🚀 Deployment

### Render

```bash
# Specify in Procfile or render.yaml
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Railway / Heroku

```bash
pip install -r requirements.txt
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

## 📚 Learn More

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Pydantic Documentation](https://docs.pydantic.dev)
- [scikit-learn Documentation](https://scikit-learn.org)

## 📝 License

MIT
