from app.database.db import blacklist_collection,transactions_collection

def calculate_risk(transaction_data):
    risk_score = 0
    reasons = []

    amount = transaction_data.get("amount", 0)
    sender_id = transaction_data.get("senderId")
    receiver_id = transaction_data.get("receiverId")
    device_id = transaction_data.get("deviceId")

    if sender_id and is_blacklisted("user", sender_id):
        risk_score += 40
        reasons.append("Sender is blacklisted")
    
    if receiver_id and is_blacklisted("user", receiver_id):
        risk_score += 40
        reasons.append("Receiver is blacklisted")

    if device_id and is_blacklisted("device", device_id):
        risk_score += 30
        reasons.append("Device is blacklisted")

    if amount > 10000:
        risk_score += 50
        reasons.append("High transaction amount")
    elif amount > 5000:
        risk_score += 20
        reasons.append("Medium transaction amount")

    if risk_score >= 50:
        risk_level = "high"
        flagged = True
    elif risk_score >= 20:
        risk_level = "medium"
        flagged = False
    else:
        risk_level = "low"
        flagged = False

    return {
        "riskScore": risk_score,
        "riskLevel": risk_level,
        "flagged": flagged,
        "reasons": reasons
    }

def is_blacklisted(entry_type, entry_value):
    blacklist_entry = blacklist_collection.find_one({"type": entry_type, "value": entry_value})
    if blacklist_entry:
        return True
    return False

def get_flagged_transactions():
    flagged_transactions = []
    for txn in transactions_collection.find({"flagged": True}):
        txn["_id"] = str(txn["_id"])
        if "timestamp" in txn:
            txn["timestamp"] = txn["timestamp"].isoformat()
        flagged_transactions.append({
            "transactionId": str(txn["_id"]),
            "amount": txn.get("amount"),
            "riskScore": txn.get("riskScore"),
            "riskLevel": txn.get("riskLevel")
        })

    return flagged_transactions

import datetime

def get_fraud_stats():
    total_transactions = transactions_collection.count_documents({})
    flagged_transactions = transactions_collection.count_documents({"flagged": True})
    high_risk = transactions_collection.count_documents({"riskLevel": "high"})
    medium_risk = transactions_collection.count_documents({"riskLevel": "medium"})
    low_risk = transactions_collection.count_documents({"riskLevel": "low"})

    return {
        "totalTransactions": total_transactions,
        "flaggedTransactions": flagged_transactions,
        "highRiskCount": high_risk,
        "mediumRiskCount": medium_risk,
        "lowRiskCount": low_risk
    }

def get_fraud_analytics():
    # 1. Categories
    category_counts = {}
    flagged_txns = transactions_collection.find({"flagged": True})
    for txn in flagged_txns:
        for reason in txn.get("reasons", []):
            category_counts[reason] = category_counts.get(reason, 0) + 1
            
    category_data = [{"category": k, "count": v} for k, v in category_counts.items()]
    category_data = sorted(category_data, key=lambda x: x["count"], reverse=True)

    # 2. Hourly Threat Activity (aggregate by hour of day (0-23) to keep graph populated regardless of data age)
    hourly_bins = {str(i).zfill(2) + ":00": {"threats": 0, "transactions": 0} for i in range(24)}
    
    for txn in transactions_collection.find({}):
        if "timestamp" in txn:
            dt = txn["timestamp"]
            if isinstance(dt, str):
                try:
                    dt = datetime.datetime.fromisoformat(dt.replace("Z", "+00:00"))
                except ValueError:
                    continue
            if isinstance(dt, datetime.datetime):
                hour_str = str(dt.hour).zfill(2) + ":00"
                hourly_bins[hour_str]["transactions"] += 1
                if txn.get("flagged"):
                    hourly_bins[hour_str]["threats"] += 1

    hourly_data = []
    for hour_str in sorted(hourly_bins.keys()):
        hourly_data.append({
            "hour": hour_str,
            "threats": hourly_bins[hour_str]["threats"],
            "transactions": hourly_bins[hour_str]["transactions"]
        })
        
    # Pick a subset like the mock did, e.g. every 3 hours to not crowd the UI, or send all 24. 
    # Sending all 24 is fine, recharts handles it. But let's return every 3 hours for aesthetic match to mock.
    filtered_hourly = [hourly_data[i] for i in range(0, 24, 3)]
        
    return {
        "hourlyData": filtered_hourly,
        "categoryData": category_data
    }
