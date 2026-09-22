from typing import Dict, Any, List, Optional
import httpx
import os
import json

class TigerGraphAdapter:
    """Core adapter for interacting with TigerGraph's RESTPP endpoints and GSQL."""
    
    def __init__(self, host: Optional[str] = None, graph_name: Optional[str] = None):
        self.host = host or os.environ.get("TIGERGRAPH_HOST", "http://localhost:9000")
        self.graph_name = graph_name or os.environ.get("TIGERGRAPH_GRAPH_NAME", "FraudGraph")
        self.username = os.environ.get("TIGERGRAPH_USERNAME", "tigergraph")
        self.password = os.environ.get("TIGERGRAPH_PASSWORD", "tigergraph")
        self.auth_token = None # In a real implementation, fetch this from /requesttoken
        
    async def run_query(self, query_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Runs a GSQL query."""
        url = f"{self.host}/query/{self.graph_name}/{query_name}"
        headers = {"Authorization": f"Bearer {self.auth_token}"} if self.auth_token else {}
        
        # In a real environment we would make this HTTP call:
        # async with httpx.AsyncClient() as client:
        #     response = await client.get(url, params=params, headers=headers)
        #     return response.json()
            
        # For prototype execution without a live DB, we return a mock response matching the expected schema.
        return self._mock_query_response(query_name, params)
        
    def _mock_query_response(self, query_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Provides mock data for the prototype since TigerGraph is not locally running."""
        if query_name == "get_txn_history":
            return {
                "error": False,
                "results": [
                    {"Transactions": [
                        {"v_id": "3514030", "attributes": {"amount": 77.07, "ts": "2016-12-05 01:55:28", "channel": "online"}},
                        {"v_id": "3514029", "attributes": {"amount": 2.10, "ts": "2016-12-05 01:40:10", "channel": "online"}},
                        {"v_id": "3514028", "attributes": {"amount": 1.50, "ts": "2016-12-05 01:38:00", "channel": "online"}}
                    ]}
                ]
            }
        elif query_name == "get_device_neighbors":
            return {
                "error": False,
                "results": [
                    {"Cards": [{"v_id": "C12382-K1"}, {"v_id": "C99999-K1"}]},
                    {"Cases": [{"v_id": "CC-0141", "attributes": {"outcome": "confirmed_fraud"}}]},
                    {"@@compromised_cards": ["C99999-K1"]}
                ]
            }
        elif query_name == "get_region_neighbors":
            return {
                "error": False,
                "results": [
                    {"Cards": [{"v_id": "C12382-K1"}]},
                    {"Cases": []}
                ]
            }
        elif query_name == "find_similar_cases":
            return {
                "error": False,
                "results": [
                    {"SimilarCases": [{"v_id": "CC-0200", "attributes": {"@similarity_score": 3}}]}
                ]
            }
        return {"error": True, "message": "Query not found"}

    async def get_transaction_history(self, card_id: str) -> Dict[str, Any]:
        return await self.run_query("get_txn_history", {"input_card_id": card_id})
        
    async def get_device_connections(self, device_id: str) -> Dict[str, Any]:
        return await self.run_query("get_device_neighbors", {"input_device_id": device_id})
        
    async def get_region_connections(self, region_id: str) -> Dict[str, Any]:
        return await self.run_query("get_region_neighbors", {"input_region_id": region_id})
        
    async def find_similar_cases(self, txn_id: str) -> Dict[str, Any]:
        return await self.run_query("find_similar_cases", {"input_txn_id": txn_id})
