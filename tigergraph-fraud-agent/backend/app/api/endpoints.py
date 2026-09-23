from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from app.models.case import CreateCaseRequest, CaseResponse, Case
from app.agents.state import InvestigationState
from app.agents.orchestrator import InvestigationOrchestrator
import uuid
import datetime

router = APIRouter()
orchestrator = InvestigationOrchestrator()

# In-memory storage for prototype
cases_db: Dict[str, Case] = {}

@router.post("/cases", response_model=CaseResponse)
async def create_case(request: CreateCaseRequest):
    case_id = f"CASE-{uuid.uuid4().hex[:6].upper()}"
    new_case = Case(
        case_id=case_id,
        status="OPEN",
        customer_id=request.customer_id,
        transaction_id=request.transaction_id,
        risk_score=request.initial_risk
    )
    cases_db[case_id] = new_case
    return CaseResponse(case=new_case)

@router.post("/cases/{case_id}/investigate", response_model=CaseResponse)
async def investigate_case(case_id: str):
    if case_id not in cases_db:
        raise HTTPException(status_code=404, detail="Case not found")
        
    case = cases_db[case_id]
    
    # Initialize State
    state = InvestigationState(
        case_id=case.case_id,
        trigger_event={"type": "api_request"},
        transaction_id=case.transaction_id,
        customer_id=case.customer_id,
        initial_risk_score=case.risk_score
    )
    
    # Run Orchestrator
    final_state = await orchestrator.investigate(state)
    
    # Update Case
    case.confidence_level = final_state.confidence_level.value
    case.risk_score = final_state.risk_assessment
    case.recommended_action = final_state.recommended_action.value if final_state.recommended_action else None
    case.explanation = final_state.explanation
    case.status = "AWAITING_APPROVAL" if final_state.approval_required else "CLOSED"
    case.updated_at = datetime.datetime.utcnow()
    
    cases_db[case_id] = case
    return CaseResponse(case=case)

@router.get("/cases/{case_id}", response_model=CaseResponse)
async def get_case(case_id: str):
    if case_id not in cases_db:
        raise HTTPException(status_code=404, detail="Case not found")
    return CaseResponse(case=cases_db[case_id])

@router.get("/cases", response_model=Dict[str, List[Case]])
async def get_all_cases():
    return {"cases": list(cases_db.values())}
