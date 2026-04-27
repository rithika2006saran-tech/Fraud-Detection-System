from datetime import datetime
from app.database.db import transactions_collection
from app.services.fraud_service import calculate_risk
from bson import ObjectId

def create_transaction(data):
    fraud_result = calculate_risk(data)

    transaction = {
        "senderId": data.get("senderId"),
        "receiverId": data.get("receiverId"),
        "amount": data.get("amount"),
        "timestamp": datetime.utcnow(),
        "riskScore": fraud_result["riskScore"],
        "riskLevel": fraud_result["riskLevel"],
        "flagged": fraud_result["flagged"],
        "reasons": fraud_result["reasons"]
    }

    result = transactions_collection.insert_one(transaction)

    transaction["_id"] = str(result.inserted_id)
    transaction["timestamp"] = transaction["timestamp"].isoformat()

    return transaction


def get_all_transactions():
    transactions = []

    for txn in transactions_collection.find():
        txn["_id"] = str(txn["_id"])
        if "timestamp" in txn:
            txn["timestamp"] = txn["timestamp"].isoformat()
        transactions.append(txn)

    return transactions


def get_transaction_by_id(transaction_id):
    txn = transactions_collection.find_one({"_id": ObjectId(transaction_id)})

    if not txn:
        return None

    txn["_id"] = str(txn["_id"])
    if "timestamp" in txn:
        txn["timestamp"] = txn["timestamp"].isoformat()

    return txn

def get_transactions_by_user(user_id):
    transactions = []

    for txn in transactions_collection.find({"senderId": user_id}):
        txn["_id"] = str(txn["_id"])
        if "timestamp" in txn:
            txn["timestamp"] = txn["timestamp"].isoformat()
        transactions.append({
            "transactionId": txn["_id"],
            "amount": txn["amount"],
            "riskScore": txn["riskScore"]
        })

    return transactions