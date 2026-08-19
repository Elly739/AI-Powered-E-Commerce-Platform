from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

load_dotenv()

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 AI Service starting...")
    yield
    # Shutdown
    print("👋 AI Service shutting down...")

app = FastAPI(
    title="E-Commerce AI Service",
    description="AI-powered features: Search, Recommendations, Chatbot",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "AI Service is running",
        "version": "1.0.0",
        "features": ["search", "recommendations", "chatbot"]
    }

# Search endpoints (Phase 6)
@app.get("/search")
async def search(q: str):
    return {
        "query": q,
        "results": [],
        "message": "Search implementation - Phase 6"
    }

# Recommendations endpoints (Phase 7)
@app.get("/recommendations/products/{product_id}")
async def similar_products(product_id: int):
    return {
        "product_id": product_id,
        "similar_products": [],
        "message": "Recommendations implementation - Phase 7"
    }

@app.get("/recommendations/personalized")
async def personalized_recommendations(user_id: int):
    return {
        "user_id": user_id,
        "recommendations": [],
        "message": "Personalized recommendations - Phase 7"
    }

# Chat endpoints (Phase 8)
@app.post("/chat")
async def chat(message: str, session_id: str = None):
    return {
        "session_id": session_id,
        "message": message,
        "response": "Chatbot implementation - Phase 8",
        "recommendations": []
    }

@app.get("/chat/history/{session_id}")
async def chat_history(session_id: str):
    return {
        "session_id": session_id,
        "messages": [],
        "message": "Chat history retrieval - Phase 8"
    }

# Embeddings endpoint
@app.post("/embeddings")
async def generate_embeddings(text: str):
    return {
        "text": text,
        "embedding": [],
        "message": "Embeddings generation - Phase 6"
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "service": "E-Commerce AI Service",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "search": "/search",
            "recommendations": "/recommendations/products/{product_id}",
            "chat": "/chat"
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
