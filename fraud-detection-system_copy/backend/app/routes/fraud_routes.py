from flask import Blueprint, jsonify, request
from app.services.fraud_service import get_flagged_transactions, get_fraud_stats, get_fraud_analytics
from app.middleware.auth_middleware import token_required

fraud_bp = Blueprint("fraud", __name__)

@fraud_bp.route("/fraud/flagged-transactions", methods=["GET"])
@token_required
def get_flagged_transactions_route():
    flagged_transactions = get_flagged_transactions()
    return jsonify(flagged_transactions), 200

@fraud_bp.route("/fraud/stats", methods=["GET"])
@token_required
def get_fraud_stats_route():
    fraud_stats = get_fraud_stats()
    return jsonify(fraud_stats), 200

@fraud_bp.route("/fraud/analytics", methods=["GET"])
@token_required
def get_fraud_analytics_route():
    analytics_data = get_fraud_analytics()
    return jsonify(analytics_data), 200