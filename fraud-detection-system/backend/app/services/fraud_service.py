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
