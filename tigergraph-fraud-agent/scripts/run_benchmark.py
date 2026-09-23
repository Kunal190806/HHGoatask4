import os
import json
import pandas as pd
import asyncio
import httpx
from datetime import datetime

async def evaluate_benchmark(case_pack_path: str, api_url: str):
    print(f"Loading benchmark cases from {case_pack_path}...")
    df = pd.read_csv(case_pack_path)
    
    results = []
    
    async with httpx.AsyncClient() as client:
        for _, row in df.iterrows():
            case_id = row['case_id']
            print(f"Evaluating {case_id}...")
            
            # Step 1: Create Case
            create_req = {
                "trigger_type": row['trigger_type'],
                "transaction_id": str(row['flagged_txn_id']) if pd.notna(row['flagged_txn_id']) else None,
                "customer_id": str(row['customer_id']),
                "initial_risk": float(row['risk_score']) if pd.notna(row['risk_score']) else 0.0
            }
            
            try:
                resp = await client.post(f"{api_url}/api/cases", json=create_req)
                resp.raise_for_status()
                internal_case_id = resp.json()['case']['case_id']
                
                # Step 2: Investigate
                inv_resp = await client.post(f"{api_url}/api/cases/{internal_case_id}/investigate")
                inv_resp.raise_for_status()
                final_case = inv_resp.json()['case']
                
                # Step 3: Format Answer
                answer = {
                    "case_id": case_id,
                    "case": {
                        "status": final_case.get('status', 'open').lower(),
                        "verdict": "fraud" if final_case.get('confidence_level') == "HIGH_CONFIDENCE" and final_case.get('risk_score', 0) > 0.8 else "legitimate",
                        "fraud_probability": final_case.get('risk_score', 0.0),
                        "pattern": "undocumented",
                        "affected_txn_ids": [str(row['flagged_txn_id'])] if pd.notna(row['flagged_txn_id']) else [],
                        "exposure_usd": 0.0,
                        "summary": final_case.get('explanation', '')
                    },
                    "next_best_actions": {
                        "initial": [],
                        "final": [
                            {"action": final_case.get('recommended_action'), "route": "auto", "reason": "Evaluated by Agent"}
                        ],
                        "what_changed": "Evaluated through automated benchmark"
                    }
                }
                
                results.append(answer)
                
                # Save individual case file
                with open(f"../cases/{case_id}.json", "w") as f:
                    json.dump(answer, f, indent=2)
                    
            except Exception as e:
                print(f"Failed to process {case_id}: {e}")
                
    # Save aggregate report
    with open("../cases/results.json", "w") as f:
        json.dump({"run_date": str(datetime.utcnow()), "total_evaluated": len(results), "results": results}, f, indent=2)
        
    print(f"Benchmark complete. Processed {len(results)} cases. Results written to ../cases/")

if __name__ == "__main__":
    case_pack = os.environ.get("CASE_PACK_PATH", "../HHGOA_IEEE/case_pack.csv")
    api_url = os.environ.get("API_URL", "http://localhost:8000")
    
    # Ensure cases output dir exists
    os.makedirs("../cases", exist_ok=True)
    
    if not os.path.exists(case_pack):
        print(f"Error: {case_pack} not found.")
    else:
        asyncio.run(evaluate_benchmark(case_pack, api_url))
