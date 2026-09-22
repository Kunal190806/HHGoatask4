from typing import List, Dict, Any

class GraphRAGRetriever:
    """Interface for retrieving context (policies, previous cases) using embeddings."""
    
    def __init__(self):
        # Mock policy database based on the README rules
        self.mock_policies = [
            {"id": "R1", "content": "Verify before you block on a weak signal. If the case rests on a single signal and assessed fraud probability is below 0.70, recommend VERIFY_WITH_CUSTOMER or STEP_UP_AUTH before any block."},
            {"id": "R2", "content": "Customer denies the transaction. Recommend BLOCK_CARD and CREATE_CASE. Add FILE_REPORT if exposure > $1000 or case connects to a shared device profile."},
            {"id": "R5", "content": "Card testing: Three or more small online authorizations within an hour, followed by a larger purchase. Recommend DECLINE_TRANSACTION and STEP_UP_AUTH. If large purchase cleared, BLOCK_CARD."},
            {"id": "R6", "content": "Shared origin: Several cards show fraud from the same device profile. Recommend CREATE_CASE, FILE_REPORT, and MONITOR_CONNECTED_CARDS."},
            {"id": "R8", "content": "Escalate when uncertain and exposed: If verdict is uncertain and exposure > $500, or evidence conflicts, recommend ESCALATE_TO_ANALYST."},
            {"id": "R10", "content": "Never BLOCK_ALL_CARDS unless at least two of the customer's cards show confirmed fraud."}
        ]
        
    async def retrieve_policies(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Retrieves fraud policies related to the query."""
        # For prototype, we simply return all rules to the LLM context, or a subset based on keywords
        results = []
        for p in self.mock_policies:
            if any(kw in query.lower() for kw in ["block", "device", "card testing", "verify", "uncertain", "deny"]):
                results.append(p)
        
        # If no strict match, return top generic ones
        return results if results else self.mock_policies[:3]
        
    async def retrieve_similar_cases(self, case_context: Dict[str, Any], top_k: int = 3) -> List[Dict[str, Any]]:
        """Retrieves historically similar cases based on vector embeddings of case notes."""
        # Mock implementation
        return [
            {
                "case_id": "CC-0141",
                "analyst_notes": "Textbook card testing from new device, confirmed fraud.",
                "relevance": 0.88
            }
        ]
