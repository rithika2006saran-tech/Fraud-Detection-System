1. Auth endpoints
These are needed if your app has login/signup.
POST /auth/register
Create new user
Request

{
  "name": "Shiv",
  "email": "shiv@email.com",
  "password": "123456"
}

Response

{
  "message": "User registered successfully",
  "userId": "U001"
}


POST /auth/login
Login user
Request

{
  "email": "shiv@email.com",
  "password": "123456"
}

Response

{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "U001",
    "name": "Shiv",
    "email": "shiv@email.com"
  }
}


GET /auth/profile
Get logged-in user profile
Response

{
  "id": "U001",
  "name": "Shiv",
  "email": "shiv@email.com"
}


2. User endpoints
GET /users
Get all users
Response

[
  {
    "id": "U001",
    "name": "Shiv",
    "email": "shiv@email.com"
  }
]


GET /users/<user_id>
Get one user
Example: GET /users/U001
Response

{
  "id": "U001",
  "name": "Shiv",
  "email": "shiv@email.com"
}


3. Transaction endpoints
These are the most important for your app.
POST /transactions
Create a new transaction and calculate risk
Request

{
  "senderId": "U001",
  "receiverId": "U002",
  "amount": 15000,
  "timestamp": "2026-03-21T10:30:00",
  "location": "Chennai",
  "deviceId": "D123",
  "paymentType": "QR"
}

Response

{
  "message": "Transaction processed successfully",
  "transactionId": "TXN1001",
  "riskScore": 80,
  "riskLevel": "high",
  "flagged": true
}

This is your main endpoint.

GET /transactions
Get all transactions
Optional query params later:
* ?status=flagged
* ?userId=U001
Response

[
  {
    "transactionId": "TXN1001",
    "senderId": "U001",
    "receiverId": "U002",
    "amount": 15000,
    "riskScore": 80,
    "riskLevel": "high",
    "flagged": true
  }
]


GET /transactions/<transaction_id>
Get one transaction
Example: GET /transactions/TXN1001
Response

{
  "transactionId": "TXN1001",
  "senderId": "U001",
  "receiverId": "U002",
  "amount": 15000,
  "riskScore": 80,
  "riskLevel": "high",
  "flagged": true,
  "reasons": [
    "High amount",
    "New receiver"
  ]
}


GET /transactions/user/<user_id>
Get transactions of one user
Example: GET /transactions/user/U001
Response

[
  {
    "transactionId": "TXN1001",
    "amount": 15000,
    "riskScore": 80
  }
]


4. Fraud analysis endpoints
You can separate fraud logic from transaction creation if you want a cleaner design.
POST /fraud/check
Check fraud risk without permanently saving transaction
This is useful if frontend wants to first check the transaction.
Request

{
  "senderId": "U001",
  "receiverId": "U002",
  "amount": 15000,
  "location": "Chennai",
  "deviceId": "D123"
}

Response

{
  "riskScore": 80,
  "riskLevel": "high",
  "flagged": true,
  "reasons": [
    "High amount",
    "Receiver is blacklisted"
  ]
}


GET /fraud/flagged-transactions
Get all risky/flagged transactions
Response

[
  {
    "transactionId": "TXN1001",
    "amount": 15000,
    "riskScore": 80,
    "riskLevel": "high"
  }
]


GET /fraud/stats
Fraud analytics summary
Response

{
  "totalTransactions": 200,
  "flaggedTransactions": 15,
  "highRiskCount": 8,
  "mediumRiskCount": 7,
  "lowRiskCount": 185
}

This is useful for dashboard.

5. Blacklist endpoints
POST /blacklist
Add a user/account/device to blacklist
Request

{
  "type": "user",
  "value": "U002",
  "reason": "Reported fraud"
}

Response

{
  "message": "Added to blacklist"
}


GET /blacklist
Get blacklist entries
Response

[
  {
    "id": "B001",
    "type": "user",
    "value": "U002",
    "reason": "Reported fraud"
  }
]


DELETE /blacklist/<blacklist_id>
Remove blacklist entry
Example: DELETE /blacklist/B001
Response

{
  "message": "Removed from blacklist"
}


6. QR-specific endpoint
If later your app scans QR payments:
POST /qr/scan
Send scanned QR data to backend
Request

{
  "qrData": "upi://pay?pa=test@upi&pn=Test",
  "userId": "U001",
  "deviceId": "D123",
  "location": "Chennai"
}

Response

{
  "safe": false,
  "riskScore": 75,
  "message": "Potentially suspicious QR target"
}


7. Dashboard/Admin endpoints
GET /dashboard/summary
For admin dashboard cards
Response

{
  "users": 120,
  "transactions": 2000,
  "flaggedTransactions": 73,
  "blacklistedEntities": 14
}


GET /dashboard/recent-alerts
Recent risky events
Response

[
  {
    "transactionId": "TXN1001",
    "message": "High-risk transaction detected",
    "time": "2026-03-21T10:30:00"
  }
]
