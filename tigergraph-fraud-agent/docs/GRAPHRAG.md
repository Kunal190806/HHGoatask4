# GraphRAG System

This prototype utilizes GraphRAG to retrieve unstructured and policy data dynamically during investigation.

## Policies
Policies are extracted via semantic search (simulated via rule engine mapping for prototype stability) over the provided documentation.
- R1: Out of region transactions must be stepped up.
- R6: Cross-tenant device graphs trigger automatic blocks.

## Evidence Grounding
The LLM is constrained to only output claims that map directly back to entities identified by the GraphRAG query and GSQL neighborhood queries.
