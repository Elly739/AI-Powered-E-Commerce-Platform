from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # FastAPI
    app_name: str = "E-Commerce AI Service"
    debug: bool = False
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Database
    database_url: str = "postgresql://ecommerce_user:ecommerce_password@localhost:5432/ecommerce_db"
    
    # LLM Configuration
    llm_api_key: str = ""
    llm_model: str = "gpt-3.5-turbo"
    llm_provider: str = "openai"  # openai, anthropic, local
    
    # Backend Service
    backend_url: str = "http://localhost:5000"
    
    # AI Features
    enable_search: bool = True
    enable_recommendations: bool = True
    enable_chatbot: bool = True
    
    # Embedding Model
    embedding_model: str = "all-MiniLM-L6-v2"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings():
    return Settings()
