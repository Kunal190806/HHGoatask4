import logging
from typing import Dict, Any, List
from app.agents.state import InvestigationState, ConfidenceLevel, ActionRecommendation, EvidenceItem, EvidenceType
from app.agents.llm_provider import get_llm_provider
from app.tools.mcp_client import TigerGraphMCPClient
from app.graphrag.retriever import GraphRAGRetriever
from app.tools.evidence_tools import EvidenceCollectionTools

logger = logging.getLogger(__name__)

class InvestigationOrchestrator:
    """The central state machine orchestrating the fraud investigation loop."""
    
    def __init__(self):
        self.llm = get_llm_provider()
        self.mcp = TigerGraphMCPClient()
        self.rag = GraphRAGRetriever()
        
    async def investigate(self, state: InvestigationState) -> InvestigationState:
        """Runs the main investigation loop."""
        state.investigation_timeline.append({"step": "STARTED", "time": "now", "details": "Investigation loop started."})
        
        # Step 1: Initial Evidence Collection via Graph
        if state.transaction_id:
            logger.info(f"Gathering graph evidence for txn {state.transaction_id}")
            # Mock pulling graph data using MCP tools
            txn_history = await self.mcp.call_tool("get_transaction_history", {"card_id": state.transaction_id})
            state.evidence.append(EvidenceItem(
                id="E1", type=EvidenceType.TRANSACTION_HISTORY, source="graph",
                description=f"Transaction history retrieved: {len(txn_history.get('results', []))} prior transactions found.",
                relevance_score=0.9
            ))
            
            # Find similar cases
            similar_cases = await self.mcp.call_tool("find_similar_cases", {"txn_id": state.transaction_id})
            if similar_cases and not similar_cases.get("error"):
                state.evidence.append(EvidenceItem(
                    id="E2", type=EvidenceType.HISTORICAL_CASE, source="graph",
                    description="Found similar historical cases linked by device/region.",
                    relevance_score=0.85
                ))
                
        # Step 2: Policy Retrieval
        policies = await self.rag.retrieve_policies(f"fraud investigation for risk {state.initial_risk_score}")
        state.evidence.append(EvidenceItem(
            id="E3", type=EvidenceType.POLICY_MATCH, source="document",
            description=f"Retrieved {len(policies)} relevant policies.",
            relevance_score=1.0
        ))
        
        # Step 3: LLM Evaluation (Simulated)
        # In a real LangGraph implementation, we pass the state to the LLM to decide on missing evidence
        prompt = f"Evaluate evidence for case {state.case_id}. Risk score is {state.initial_risk_score}."
        llm_assessment = await self.llm.generate(prompt)
        
        # Step 4: Deterministic Uncertainty & Action Engine
        if state.initial_risk_score > 0.8:
            state.confidence_level = ConfidenceLevel.MEDIUM_CONFIDENCE
            state.risk_assessment = 0.85
            state.recommended_action = ActionRecommendation.BLOCK_TRANSACTION
            state.approval_required = True
            state.candidate_actions = [ActionRecommendation.BLOCK_TRANSACTION, ActionRecommendation.MONITOR_ACCOUNT]
            state.explanation = "High risk score combined with historical graph matches indicates probable fraud."
        elif state.initial_risk_score > 0.5:
            state.confidence_level = ConfidenceLevel.INSUFFICIENT_EVIDENCE
            state.risk_assessment = 0.60
            state.recommended_action = ActionRecommendation.REQUEST_CUSTOMER_VERIFICATION
            state.candidate_actions = [ActionRecommendation.REQUEST_CUSTOMER_VERIFICATION, ActionRecommendation.STEP_UP_AUTH]
            state.explanation = "Medium risk score. Evidence is insufficient; customer verification is required per Policy R1."
            
            # Step 5: Simulate additional evidence gathering if required
            verify_result = await EvidenceCollectionTools.request_customer_verification(state.customer_id)
            state.evidence.append(EvidenceItem(
                id="E4", type=EvidenceType.CUSTOMER_INTERACTION, source="customer",
                description=verify_result["message"],
                relevance_score=1.0
            ))
            
            # Reassess after evidence
            if verify_result["result"] == "VERIFICATION_FAILED":
                state.confidence_level = ConfidenceLevel.HIGH_CONFIDENCE
                state.risk_assessment = 0.95
                state.recommended_action = ActionRecommendation.BLOCK_ACCOUNT
                state.approval_required = True
                state.explanation = "Customer failed verification. Elevating action to account block per Policy R2."
        else:
            state.confidence_level = ConfidenceLevel.HIGH_CONFIDENCE
            state.risk_assessment = 0.10
            state.recommended_action = ActionRecommendation.ALLOW
            state.explanation = "Low risk score and no significant graph anomalies detected."
            
        state.investigation_timeline.append({"step": "COMPLETED", "time": "now", "details": "Investigation loop completed."})
        return state
