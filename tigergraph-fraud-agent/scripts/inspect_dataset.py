import os
import pandas as pd

def inspect_data(path: str):
    if not os.path.exists(path):
        print(f"Dataset path {path} not found.")
        return
        
    print(f"--- Dataset Inspection: {path} ---")
    files = [f for f in os.listdir(path) if f.endswith('.csv')]
    
    for file in files:
        file_path = os.path.join(path, file)
        try:
            df = pd.read_csv(file_path, nrows=5)
            print(f"\n[FILE] {file}")
            print(f"Columns: {', '.join(df.columns)}")
            print(f"Shape approx: {len(df)} rows loaded for preview")
        except Exception as e:
            print(f"Failed to read {file}: {e}")

if __name__ == "__main__":
    inspect_data("../HHGOA_IEEE")
