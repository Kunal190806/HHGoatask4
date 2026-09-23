import pytest
from app.agents.state import InvestigationState, ConfidenceLevel, ActionRecommendation
from app.agents.orchestrator import InvestigationOrchestrator

@pytest.mark.asyncio
async def test_orchestrator_high_risk():
    orchestrator = InvestigationOrchestrator()
    state = InvestigationState(
        case_id="TEST-01",
        transaction_id="3000332",
        customer_id="C06403",
        initial_risk_score=0.92
    )
    
    result = await orchestrator.investigate(state)
    
    # Assertions
    assert result.confidence_level == ConfidenceLevel.MEDIUM_CONFIDENCE
    assert result.recommended_action == ActionRecommendation.BLOCK_TRANSACTION
    assert result.approval_required is True
    assert len(result.evidence) >= 2

@pytest.mark.asyncio
async def test_orchestrator_insufficient_evidence():
    orchestrator = InvestigationOrchestrator()
    state = InvestigationState(
        case_id="TEST-02",
        transaction_id="3000906",
        customer_id="C13440",
        initial_risk_score=0.60
    )
    
    result = await orchestrator.investigate(state)
    
    # Assertions for uncertainty handling
    assert result.confidence_level == ConfidenceLevel.HIGH_CONFIDENCE # After step-up failure
    assert result.recommended_action == ActionRecommendation.BLOCK_ACCOUNT
    assert result.approval_required is True
