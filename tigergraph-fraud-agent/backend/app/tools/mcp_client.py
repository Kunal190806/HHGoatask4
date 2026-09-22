from typing import Dict, Any, List, Optional
from app.graph.tigergraph_adapter import TigerGraphAdapter

class TigerGraphMCPClient:
    """Client to connect to TigerGraph MCP Server.
    Exposes graph capabilities as tools for the LLM Agent.
    """
    
    def __init__(self, mcp_url: Optional[str] = None):
        self.mcp_url = mcp_url
        self.adapter = TigerGraphAdapter()
        
    async def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Call a specific MCP tool."""
        if tool_name == "get_transaction_history":
            return await self.adapter.get_transaction_history(arguments.get("card_id"))
        elif tool_name == "get_device_connections":
            return await self.adapter.get_device_connections(arguments.get("device_id"))
        elif tool_name == "get_region_connections":
            return await self.adapter.get_region_connections(arguments.get("region_id"))
        elif tool_name == "find_similar_cases":
            return await self.adapter.find_similar_cases(arguments.get("txn_id"))
        else:
            return {"error": f"Tool {tool_name} not found"}
        
    def get_available_tools(self) -> List[Dict[str, Any]]:
        """Return schema of available MCP tools for the agent."""
        return [
            {
                "name": "get_transaction_history",
                "description": "Retrieves the transaction history for a given card to check for velocity or card testing.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "card_id": {"type": "string"}
                    },
                    "required": ["card_id"]
                }
            },
            {
                "name": "get_device_connections",
                "description": "Finds other cards and historical cases connected to the same device profile.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "device_id": {"type": "string"}
                    },
                    "required": ["device_id"]
                }
            },
            {
                "name": "get_region_connections",
                "description": "Finds other cards and historical cases connected to the same billing region.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "region_id": {"type": "string"}
                    },
                    "required": ["region_id"]
                }
            },
            {
                "name": "find_similar_cases",
                "description": "Retrieves historically similar closed cases based on shared attributes with a transaction.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "txn_id": {"type": "string"}
                    },
                    "required": ["txn_id"]
                }
            }
        ]
