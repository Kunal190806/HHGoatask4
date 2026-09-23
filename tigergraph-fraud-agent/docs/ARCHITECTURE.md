# Architecture Overview

```mermaid
graph TD
    A[Fraud Signal] --> B(Agent Orchestrator)
    B --> C{GraphRAG Policy DB}
    B --> D[TigerGraph MCP]
    D --> E[(TigerGraph Savanna)]
    B --> F{Uncertainty Engine}
    F -- High Uncertainty --> G[Request Action]
    F -- High Confidence --> H[Generate Case]
    H --> I[Dashboard Frontend]
```

- **Backend**: FastAPI + Python 3.9+ + Pydantic v2
- **Agent Framework**: LangGraph + TigerGraph MCP
- **GraphDB**: TigerGraph (GSQL)
- **Frontend**: Next.js 15 + Tailwind CSS
