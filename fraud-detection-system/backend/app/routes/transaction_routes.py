from flask import Blueprint, request, jsonify
from app.services.transaction_service import create_transaction, get_all_transactions
from app.services.transaction_service import get_transaction_by_id
from app.utils.validators import validate_transaction
from app.services.transaction_service import get_transactions_by_user

transaction_bp = Blueprint('transaction_bp', __name__)

@transaction_bp.route('/transactions', methods=['POST'])
def add_transaction():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    is_valid, error = validate_transaction(data)
    if not is_valid:
        return jsonify({"error": error}), 400

    transaction = create_transaction(data)
    return jsonify(transaction), 201


@transaction_bp.route('/transactions', methods=['GET'])
def fetch_transactions():
    transactions = get_all_transactions()
    return jsonify(transactions), 200

@transaction_bp.route('/transactions/<transaction_id>', methods=['GET'])
def fetch_transaction_by_id(transaction_id):
    txn = get_transaction_by_id(transaction_id)

    if not txn:
        return jsonify({"error": "Transaction not found"}), 404

    return jsonify(txn), 200

@transaction_bp.route('/transactions/user/<user_id>', methods=['GET'])
def fetch_transactions_by_user(user_id):
    transactions = get_transactions_by_user(user_id)
    return jsonify(transactions), 200
