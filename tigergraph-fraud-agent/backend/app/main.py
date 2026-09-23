from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_env: str = "development"
    tigergraph_host: str = "http://localhost:9000"
    tigergraph_username: str = "tigergraph"
    tigergraph_password: str = "tigergraph"
    tigergraph_graph_name: str = "FraudGraph"
    
    class Config:
        env_file = "../.env"
        extra = "ignore"

settings = Settings()

from app.api.endpoints import router as cases_router

app = FastAPI(
    title="TigerGraph Fraud Agent API",
    description="API for the Agentic Fraud Investigation System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cases_router, prefix="/api")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "environment": settings.app_env}

@app.get("/api/config")
async def get_config():
    return {
        "environment": settings.app_env,
        "graph_name": settings.tigergraph_graph_name
    }
