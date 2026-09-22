from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
import os

class LLMProvider(ABC):
    """Abstract base class for LLM providers."""
    
    @abstractmethod
    async def generate(self, prompt: str, system_prompt: Optional[str] = None, tools: Optional[List[Dict]] = None) -> Any:
        pass
        
    @abstractmethod
    async def embed(self, text: str) -> List[float]:
        pass


class GeminiProvider(LLMProvider):
    """Google Gemini implementation."""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-1.5-pro"):
        self.api_key = api_key or os.environ.get("LLM_API_KEY")
        self.model = model
        # TODO: Initialize LangChain GoogleGenAI client here
        
    async def generate(self, prompt: str, system_prompt: Optional[str] = None, tools: Optional[List[Dict]] = None) -> Any:
        # Mock implementation for now
        return f"Gemini response to: {prompt[:50]}..."
        
    async def embed(self, text: str) -> List[float]:
        # Mock embedding
        return [0.1] * 768


class OpenAIProvider(LLMProvider):
    """OpenAI implementation."""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o"):
        self.api_key = api_key or os.environ.get("LLM_API_KEY")
        self.model = model
        
    async def generate(self, prompt: str, system_prompt: Optional[str] = None, tools: Optional[List[Dict]] = None) -> Any:
        return f"OpenAI response to: {prompt[:50]}..."
        
    async def embed(self, text: str) -> List[float]:
        return [0.1] * 1536


def get_llm_provider() -> LLMProvider:
    provider_name = os.environ.get("LLM_PROVIDER", "gemini").lower()
    
    if provider_name == "openai":
        return OpenAIProvider()
    elif provider_name == "anthropic":
        raise NotImplementedError("Anthropic provider not yet implemented")
    else:
        return GeminiProvider()
