def calculate_risk(transaction_data):
    risk_score = 0
    reasons = []

    amount = transaction_data.get("amount", 0)

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