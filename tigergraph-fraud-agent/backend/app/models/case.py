from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CaseEvidence(BaseModel):
    id: str
    description: str
    source: str
    added_at: datetime = Field(default_factory=datetime.utcnow)

class Case(BaseModel):
    case_id: str
    status: str = "OPEN"
    customer_id: Optional[str] = None
    transaction_id: Optional[str] = None
    
    risk_score: float = 0.0
    confidence_level: str = "INSUFFICIENT_EVIDENCE"
    
    evidence: List[CaseEvidence] = []
    
    recommended_action: Optional[str] = None
    final_decision: Optional[str] = None
    explanation: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CreateCaseRequest(BaseModel):
    trigger_type: str
    transaction_id: Optional[str] = None
    customer_id: Optional[str] = None
    initial_risk: float = 0.0
    
class CaseResponse(BaseModel):
    case: Case
