import os
import bcrypt
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
from app.database.db import users_collection

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")


def register_user(data):
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    existing_user = users_collection.find_one({"email": email})
    if existing_user:
        return {"error": "User already exists with this email"}, 400

    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    user = {
        "name": name,
        "email": email,
        "password": hashed_password,
        "createdAt": datetime.utcnow()
    }

    result = users_collection.insert_one(user)

    return {
        "message": "User registered successfully",
        "user": {
            "id": str(result.inserted_id),
            "name": name,
            "email": email,
            "createdAt": user["createdAt"].isoformat()
        }
    }, 201


def login_user(data):
    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})
    if not user:
        return {"error": "Invalid email or password"}, 401

    stored_password = user["password"]

    if not bcrypt.checkpw(password.encode("utf-8"), stored_password):
        return {"error": "Invalid email or password"}, 401

    token_payload = {
        "user_id": str(user["_id"]),
        "email": user["email"],
        "exp": datetime.utcnow() + timedelta(hours=24)
    }

    token = jwt.encode(token_payload, JWT_SECRET, algorithm="HS256")

    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"]
        }
    }, 200