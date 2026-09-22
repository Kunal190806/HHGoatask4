from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ActionRecommendation(str, Enum):
    ALLOW = "ALLOW"
    BLOCK_TRANSACTION = "BLOCK_TRANSACTION"
    BLOCK_ACCOUNT = "BLOCK_ACCOUNT"
    MONITOR_ACCOUNT = "MONITOR_ACCOUNT"
    WARN_CUSTOMER = "WARN_CUSTOMER"
    REQUEST_CUSTOMER_VERIFICATION = "REQUEST_CUSTOMER_VERIFICATION"
    REQUEST_STEP_UP_AUTH = "REQUEST_STEP_UP_AUTH"
    REQUEST_ADDITIONAL_INFORMATION = "REQUEST_ADDITIONAL_INFORMATION"
    ESCALATE_TO_ANALYST = "ESCALATE_TO_ANALYST"
    FILE_SAR = "FILE_SAR"

class ConfidenceLevel(str, Enum):
    HIGH_CONFIDENCE = "HIGH_CONFIDENCE"
    MEDIUM_CONFIDENCE = "MEDIUM_CONFIDENCE"
    LOW_CONFIDENCE = "LOW_CONFIDENCE"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"

class EvidenceType(str, Enum):
    GRAPH_RELATIONSHIP = "GRAPH_RELATIONSHIP"
    TRANSACTION_HISTORY = "TRANSACTION_HISTORY"
    RISK_SCORE = "RISK_SCORE"
    POLICY_MATCH = "POLICY_MATCH"
    HISTORICAL_CASE = "HISTORICAL_CASE"
    CUSTOMER_INTERACTION = "CUSTOMER_INTERACTION"

class EvidenceItem(BaseModel):
    id: str
    type: EvidenceType
    source: str
    description: str
    relevance_score: float = Field(ge=0.0, le=1.0)
    
class FraudPatternMatch(BaseModel):
    pattern_id: str
    name: str
    confidence: float
    matched_indicators: List[str]

class InvestigationState(BaseModel):
    case_id: str
    trigger_event: Dict[str, Any]
    transaction_id: Optional[str] = None
    customer_id: Optional[str] = None
    
    initial_risk_score: float = 0.0
    
    evidence: List[EvidenceItem] = []
    suspected_patterns: List[FraudPatternMatch] = []
    
    risk_assessment: float = 0.0
    confidence_level: ConfidenceLevel = ConfidenceLevel.INSUFFICIENT_EVIDENCE
    uncertainty_reasons: List[str] = []
    
    requested_evidence: List[str] = []
    candidate_actions: List[ActionRecommendation] = []
    
    recommended_action: Optional[ActionRecommendation] = None
    approval_required: bool = False
    
    investigation_timeline: List[Dict[str, str]] = []
    explanation: Optional[str] = None
