# TigerGraph Fraud Agent Demo Script

**Target Time:** 3-5 Minutes

## Scene 1: The Alert (30 seconds)
- **Visual**: Show the Next.js Dashboard "Active Cases" queue.
- **Action**: Click on Case `HHG-017`.
- **Narration**: "An alert comes in from the real-time model with a high risk score. Instead of a human doing the manual lookup, our Agent instantly takes over the investigation."

## Scene 2: TigerGraph Evidence Gathering (1 Minute)
- **Visual**: Show the Agent Trace UI side-by-panel.
- **Action**: Expand the 'Tool Call: get_txn_history' and 'get_device_neighbors'.
- **Narration**: "The LLM isn't guessing. It uses TigerGraph MCP to pull exact graph data. First, it pulls transaction history and sees the 'Card Testing' velocity pattern. Next, it hops from the Transaction to the Device Profile, finding a link to another card AND a confirmed fraud case from August."

## Scene 3: GraphRAG & Policy (45 seconds)
- **Visual**: Show the 'Evidence' table in the UI where Policy R2 and R6 appear.
- **Narration**: "With the graph evidence gathered, the agent uses GraphRAG to pull our internal Fraud Policy. Rule 6 explicitly states that shared device profiles require connected cards to be monitored."

## Scene 4: Uncertainty & Additional Evidence (45 seconds)
- **Visual**: The UI shows "AWAITING_CUSTOMER_VERIFICATION" status.
- **Action**: Simulate the customer clicking 'Deny' on their mobile app (mocked in our backend).
- **Narration**: "Because the probability wasn't 100%, the agent followed Policy R1 and requested a Step-Up Auth. The customer denied the charge. The agent updates its case state in real-time."

## Scene 5: Next Best Action & Case Memory (1 Minute)
- **Visual**: The Dashboard now shows `BLOCK_CARD` with Approval Route `L1`.
- **Narration**: "The agent finalizes the Next Best Action: Block the card. Because the exposure is under $2500, it routes to L1 approval. Finally, it stores this entire investigation back into TigerGraph as a new `ClosedCase` node, instantly making our system smarter for the next alert."
