# Dataset Analysis: HHGOA_IEEE

## Files Discovered
1. **README.md**: Contains task description, policies, regulatory guidance, and column descriptions.
2. **transactions.csv** (708MB): Core transaction data.
3. **identity.csv** (26MB): Additional device/network information for online transactions.
4. **closed_cases_history.csv** (2.7MB): 5,565 historical investigations (the "case memory").
5. **case_pack.csv** (3.5KB): The 20 benchmark cases to be solved.

## Core Entities & Important Columns

### 1. Transactions (`transactions.csv`)
- **Identifiers**: `TransactionID`
- **Keys to other entities**: `customer_id`, `card1`-`card6`, `addr1`, `addr2`, `P_emaildomain`, `R_emaildomain`
- **Important Features**:
  - `TransactionAmt`: USD amount
  - `ProductCD`: W, C, H, R, S. (W = in_person, others = online)
  - `ts`: Real timestamp `YYYY-MM-DD HH:MM:SS`
  - `channel`: `in_person` or `online`
  - `risk_score`: 0.0 to 1.0 (Flagging mechanism, not ground truth)
  - `C`, `D`, `M`, `V` columns: Vesta engineered features.

### 2. Identity / Device (`identity.csv`)
- **Identifiers**: Joins 1:1 on `TransactionID`
- **Important Features**:
  - `id_30`: Operating System
  - `id_31`: Browser
  - `id_33`: Screen Resolution
  - `DeviceType`: `mobile` or `desktop`
  - `DeviceInfo`: String descriptor (e.g. `SAMSUNG SM-G892A Build/NRD90M`)
  - *Note*: Device Profile = `DeviceInfo` + `id_30` + `id_31` + `id_33`

### 3. Case History (`closed_cases_history.csv`)
- **Identifiers**: `case_id`
- **Important Features**:
  - `outcome`: `confirmed_fraud` or `cleared`
  - `pattern`: One of the 5 known patterns, `none`, or `undocumented`
  - `exposure_usd`: Financial impact
  - `txn_ids`: Pipe-separated list of affected transactions
  - `connected_card_ids`: Pipe-separated list of connected cards
  - `analyst_notes`: Natural language summary (vital for GraphRAG)

### 4. Benchmark Cases (`case_pack.csv`)
- **Identifiers**: `case_id`
- **Important Features**:
  - `trigger_type`: `risk_score`, `customer_report`, `analyst_request`
  - `flagged_txn_id`: The transaction that caused the alert
  - `card_id`, `customer_id`, `risk_score`

## Proposed TigerGraph Schema

Based on the README and data inspection, the strict TigerGraph schema will be:

**Vertices:**
1. `Customer` (id: string - `customer_id`)
2. `Card` (id: string - `card_id` constructed from `customer_id` and card sequence)
3. `Transaction` (id: int - `TransactionID`)
    - Attributes: `amount` (float), `ts` (datetime), `channel` (string), `risk_score` (float), `product` (string)
4. `DeviceProfile` (id: string - composite of OS, Browser, Screen, DeviceInfo)
5. `EmailDomain` (id: string)
6. `BillingRegion` (id: string - `addr1`)
7. `ClosedCase` (id: string - `case_id`)
    - Attributes: `outcome` (string), `pattern` (string), `analyst_notes` (string)

**Edges:**
1. `OWNS`: `Customer` -> `Card`
2. `MADE_TXN`: `Card` -> `Transaction`
3. `FROM_DEVICE`: `Transaction` -> `DeviceProfile`
4. `BILLED_IN`: `Transaction` -> `BillingRegion`
5. `USED_EMAIL`: `Transaction` -> `EmailDomain`
6. `NEXT_TXN`: `Transaction` -> `Transaction` (Directed, time-ordered per card)
7. `CASE_INVOLVES_TXN`: `ClosedCase` -> `Transaction`
8. `CASE_ON_CARD`: `ClosedCase` -> `Card`

## Key TigerGraph Queries (GSQL)

To satisfy the Agent's investigation needs, we will implement these GSQL queries:
1. **`get_txn_history`**: Given a `TransactionID` or `Card`, traverse `NEXT_TXN` to get the sequence of purchases (vital for Pattern 1: Card Testing).
2. **`get_device_neighbors`**: Given a `DeviceProfile`, find all other `Transaction` -> `Card` -> `Customer` connected to it. Flag if any connected Cards are linked to a `ClosedCase` where `outcome = confirmed_fraud` (vital for connecting risk).
3. **`get_region_neighbors`**: Same as device, but for `BillingRegion` (vital for Pattern 4: Out-of-region use).
4. **`find_similar_cases`**: Traverse from flagged `Transaction` -> `DeviceProfile` or `BillingRegion` -> `Transaction` -> `ClosedCase` to find historically related fraud rings.
