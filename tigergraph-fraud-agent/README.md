# TigerGraph Agentic Fraud Investigation Prototype

An AI Agent built for the Hacker House Goa 2026 challenge. This system uses TigerGraph as the core evidence platform for an agentic fraud investigation loop, including Next-Best Action recommendations and GraphRAG.

## Architecture
- **Agent Orchestrator**: LangGraph / Custom State Machine inside FastAPI.
- **Evidence Engine**: TigerGraph GSQL queries exposed as Agent Tools via MCP.
- **GraphRAG**: Vector retrieval of Fraud Policies (R1-R10) and Case Memory.
- **UI**: Next.js Dashboard.

## Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (Optional for local TigerGraph)
- TigerGraph Savanna (Recommended) or Community Edition

## Installation

### 1. Environment Setup
```bash
cp .env.example .env
```
Fill in your `LLM_API_KEY` and TigerGraph connection details.

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Graph Ingestion & Loading
Place the `HHGOA_IEEE` dataset folder at the project root.
```bash
cd scripts
python ingest_dataset.py --data-dir ../HHGOA_IEEE --output-dir ../data/processed
# Then execute the load job in scripts/load_tigergraph.py against your DB
```

## Running the Benchmark
The benchmark evaluator processes the 20 official cases in `case_pack.csv`:
```bash
cd scripts
python run_benchmark.py
```
Output JSONs will be generated in the `benchmark/` folder.

## Limitations & Future Work
- LLM Provider integration uses standard endpoints; latency could be improved with streaming.
- Needs more sophisticated vector chunking for dense policy documents.
