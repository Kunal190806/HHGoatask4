# Evaluation Metrics

## Benchmark Metrics
The system is evaluated automatically using `scripts/run_benchmark.py` against the 20 cases in `case_pack.csv`.

**Core Metrics Tracked**:
1. **Decision Accuracy**: Percentage of cases where the agent's final action (Block vs. Allow) matched the ground truth expectations based on Graph evidence.
2. **Policy Compliance**: Percentage of cases where the Next Best Action accurately adhered to Policy R1-R10 (e.g. not recommending `BLOCK_ALL_CARDS` incorrectly).
3. **Graph Retrieval Effectiveness**: Did the agent correctly invoke `get_device_neighbors` when a shared device pattern was present in the data?
4. **Uncertainty Handling**: How many times did the agent correctly pause to request Step-Up Auth when the evidence probability was under 0.70?

## System Performance
- **Average Investigation Steps**: Typically 4-6 state machine transitions per case.
- **TigerGraph Latency**: GSQL queries usually complete in < 50ms locally.
- **LLM Latency**: Depending on the provider, reasoning steps take 1-3 seconds.
- **Overall Case Resolution Time**: 5-10 seconds per automated case.

## Future Evaluation Additions
- **SAR Quality Score**: Semantic evaluation (using an LLM-as-a-judge) to check if the generated Suspicious Activity Report contains the 5 Ws (Who, What, Where, When, Why) per FinCEN guidelines.
