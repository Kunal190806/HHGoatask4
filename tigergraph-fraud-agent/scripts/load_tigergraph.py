import os
import requests

def create_loading_jobs(host, graph_name):
    print("WARNING: Assuming RESTPP is available at TIGERGRAPH_HOST.")
    # The actual GSQL loading script mapping CSVs to Vertices/Edges
    load_gsql = f"""
    USE GRAPH {graph_name}
    
    CREATE LOADING JOB load_fraud_data FOR GRAPH {graph_name} {{
        DEFINE FILENAME v_cust = "$sys.data_root/v_customer.csv";
        DEFINE FILENAME v_card = "$sys.data_root/v_card.csv";
        DEFINE FILENAME v_txn = "$sys.data_root/v_transaction.csv";
        DEFINE FILENAME v_dev = "$sys.data_root/v_device.csv";
        DEFINE FILENAME v_email = "$sys.data_root/v_email.csv";
        DEFINE FILENAME v_region = "$sys.data_root/v_region.csv";
        DEFINE FILENAME v_case = "$sys.data_root/v_closed_case.csv";
        
        DEFINE FILENAME e_owns = "$sys.data_root/e_owns.csv";
        DEFINE FILENAME e_made_txn = "$sys.data_root/e_made_txn.csv";
        DEFINE FILENAME e_from_dev = "$sys.data_root/e_from_device.csv";
        DEFINE FILENAME e_billed = "$sys.data_root/e_billed_in.csv";
        DEFINE FILENAME e_email = "$sys.data_root/e_used_email.csv";
        DEFINE FILENAME e_case_txn = "$sys.data_root/e_case_involves_txn.csv";
        DEFINE FILENAME e_case_card = "$sys.data_root/e_case_on_card.csv";
        
        LOAD v_cust TO VERTEX Customer VALUES($0) USING header="true", separator=",";
        LOAD v_card TO VERTEX Card VALUES($0, $1, $2) USING header="true", separator=",";
        LOAD v_txn TO VERTEX Transaction VALUES($0, $1, $2, $3, $4, $5) USING header="true", separator=",";
        LOAD v_dev TO VERTEX DeviceProfile VALUES($0) USING header="true", separator=",";
        LOAD v_email TO VERTEX EmailDomain VALUES($0) USING header="true", separator=",";
        LOAD v_region TO VERTEX BillingRegion VALUES($0) USING header="true", separator=",";
        LOAD v_case TO VERTEX ClosedCase VALUES($0, $1, $2, $3) USING header="true", separator=",";
        
        LOAD e_owns TO EDGE OWNS VALUES($0, $1) USING header="true", separator=",";
        LOAD e_made_txn TO EDGE MADE_TXN VALUES($0, $1) USING header="true", separator=",";
        LOAD e_from_dev TO EDGE FROM_DEVICE VALUES($0, $1) USING header="true", separator=",";
        LOAD e_billed TO EDGE BILLED_IN VALUES($0, $1) USING header="true", separator=",";
        LOAD e_email TO EDGE USED_EMAIL VALUES($0, $1) USING header="true", separator=",";
        LOAD e_case_txn TO EDGE CASE_INVOLVES_TXN VALUES($0, $1) USING header="true", separator=",";
        LOAD e_case_card TO EDGE CASE_ON_CARD VALUES($0, $1) USING header="true", separator=",";
    }}
    """
    
    # In a real environment, this would hit the /gsqlserver endpoint or use the pyTigerGraph client
    print("Loading job created in memory. To apply to TigerGraph, run this GSQL block:")
    print(load_gsql)

if __name__ == "__main__":
    host = os.environ.get("TIGERGRAPH_HOST", "http://localhost:9000")
    graph_name = os.environ.get("TIGERGRAPH_GRAPH_NAME", "FraudGraph")
    create_loading_jobs(host, graph_name)
