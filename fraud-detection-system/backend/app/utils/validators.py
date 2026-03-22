def validate_transaction(data):
    required_fields = ["senderId", "receiverId", "amount"]

    for field in required_fields:
        if field not in data:
            return False, f"{field} is required"

    if not isinstance(data["amount"], (int, float)):
        return False, "Amount must be a number"

    if data["amount"] <= 0:
        return False, "Amount must be greater than 0"

    return True, None