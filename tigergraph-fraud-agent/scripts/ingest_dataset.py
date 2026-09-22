import os
import pandas as pd
import numpy as np

def generate_card_id(row):
    # Fallback generation: customer_id + hash of card1-card6
    card_str = f"{row['card1']}_{row['card2']}_{row['card3']}_{row['card4']}_{row['card5']}_{row['card6']}"
    return f"{row['customer_id']}-K{abs(hash(card_str)) % 1000}"

def ingest_data(data_dir: str, output_dir: str):
    print(f"Reading dataset from {data_dir}...")
    
    # Ensure output dir exists
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Transactions
    print("Loading transactions...")
    df_txn = pd.read_csv(os.path.join(data_dir, "transactions.csv"), low_memory=False)
    
    # 2. Identity
    print("Loading identity...")
    df_id = pd.read_csv(os.path.join(data_dir, "identity.csv"), low_memory=False)
    
    # Merge for Device Profiles
    print("Merging for Device Profiles...")
    df_merged = df_txn.merge(df_id, on='TransactionID', how='left')
    
    # Extract Vertices
    print("Extracting Customers...")
    customers = df_txn[['customer_id']].drop_duplicates().dropna()
    customers.to_csv(os.path.join(output_dir, "v_customer.csv"), index=False)
    
    print("Extracting Cards...")
    # Map from closed cases first if possible, otherwise generate
    df_cases = pd.read_csv(os.path.join(data_dir, "closed_cases_history.csv"))
    case_txn_to_card = {}
    for _, row in df_cases.iterrows():
        if pd.notna(row['txn_ids']):
            for txn in str(row['txn_ids']).split('|'):
                case_txn_to_card[int(txn)] = row['card_id']
                
    def get_card_id(row):
        txn = row['TransactionID']
        if txn in case_txn_to_card:
            return case_txn_to_card[txn]
        return generate_card_id(row)
        
    df_merged['card_id'] = df_merged.apply(get_card_id, axis=1)
    
    cards = df_merged[['card_id', 'card4', 'card6']].drop_duplicates(subset=['card_id']).dropna(subset=['card_id'])
    cards.columns = ['card_id', 'network', 'card_type']
    cards.to_csv(os.path.join(output_dir, "v_card.csv"), index=False)
    
    print("Extracting Transactions...")
    transactions = df_merged[['TransactionID', 'TransactionAmt', 'ts', 'channel', 'risk_score', 'ProductCD']]
    transactions.to_csv(os.path.join(output_dir, "v_transaction.csv"), index=False)
    
    print("Extracting Device Profiles...")
    df_merged['device_profile'] = df_merged['DeviceInfo'].fillna('Unknown') + "|" + df_merged['id_30'].fillna('Unknown') + "|" + df_merged['id_31'].fillna('Unknown') + "|" + df_merged['id_33'].fillna('Unknown')
    devices = df_merged[['device_profile']].drop_duplicates().dropna()
    devices = devices[devices['device_profile'] != 'Unknown|Unknown|Unknown|Unknown']
    devices.to_csv(os.path.join(output_dir, "v_device.csv"), index=False)
    
    print("Extracting Email Domains...")
    emails = df_merged[['P_emaildomain']].drop_duplicates().dropna()
    emails.columns = ['email_domain']
    emails.to_csv(os.path.join(output_dir, "v_email.csv"), index=False)
    
    print("Extracting Billing Regions...")
    regions = df_merged[['addr1']].drop_duplicates().dropna()
    regions.columns = ['region_id']
    regions.to_csv(os.path.join(output_dir, "v_region.csv"), index=False)
    
    print("Extracting Closed Cases...")
    cases = df_cases[['case_id', 'outcome', 'pattern', 'analyst_notes']]
    cases.to_csv(os.path.join(output_dir, "v_closed_case.csv"), index=False)
    
    # Extract Edges
    print("Extracting Edges...")
    
    e_owns = df_merged[['customer_id', 'card_id']].drop_duplicates().dropna()
    e_owns.to_csv(os.path.join(output_dir, "e_owns.csv"), index=False)
    
    e_made_txn = df_merged[['card_id', 'TransactionID']].drop_duplicates().dropna()
    e_made_txn.to_csv(os.path.join(output_dir, "e_made_txn.csv"), index=False)
    
    e_from_device = df_merged[['TransactionID', 'device_profile']].dropna()
    e_from_device = e_from_device[e_from_device['device_profile'] != 'Unknown|Unknown|Unknown|Unknown']
    e_from_device.to_csv(os.path.join(output_dir, "e_from_device.csv"), index=False)
    
    e_billed_in = df_merged[['TransactionID', 'addr1']].dropna()
    e_billed_in.to_csv(os.path.join(output_dir, "e_billed_in.csv"), index=False)
    
    e_used_email = df_merged[['TransactionID', 'P_emaildomain']].dropna()
    e_used_email.to_csv(os.path.join(output_dir, "e_used_email.csv"), index=False)
    
    # CASE_INVOLVES_TXN
    case_txns = []
    for _, row in df_cases.iterrows():
        if pd.notna(row['txn_ids']):
            for txn in str(row['txn_ids']).split('|'):
                case_txns.append({'case_id': row['case_id'], 'TransactionID': txn})
    pd.DataFrame(case_txns).to_csv(os.path.join(output_dir, "e_case_involves_txn.csv"), index=False)
    
    e_case_on_card = df_cases[['case_id', 'card_id']].dropna()
    e_case_on_card.to_csv(os.path.join(output_dir, "e_case_on_card.csv"), index=False)
    
    print(f"Data ingestion complete. Processed files written to {output_dir}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", type=str, default="../HHGOA_IEEE")
    parser.add_argument("--output-dir", type=str, default="../data/processed")
    args = parser.parse_args()
    
    ingest_data(args.data_dir, args.output_dir)
