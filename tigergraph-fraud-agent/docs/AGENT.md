# Agent Orchestrator

The system relies on a deterministic state machine wrapping an LLM (Simulated in this prototype to ensure predictable execution).

## State Machine Loop
1. **Trigger**: High risk score or API request creates a Case.
2. **Investigation**: `orchestrator.py` fires off Graph queries (via `TigerGraphAdapter`).
3. **GraphRAG**: Retrieves internal policy constraints (e.g. R1: Verify before block).
4. **Uncertainty Check**: If evidence probability is < 0.70, it halts and requests simulated `Step-Up Auth`.
5. **Re-Assessment**: Applies new evidence.
6. **NBA**: Emits Next Best Action (Allow, Block, Monitor, Report) with an Approval Route.
