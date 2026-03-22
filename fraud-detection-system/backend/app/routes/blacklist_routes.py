from flask import Blueprint, request, jsonify
from app.services.blacklist_service import add_to_blacklist, get_all_blacklist, delete_blacklist_entry

blacklist_bp = Blueprint("blacklist", __name__)

@blacklist_bp.route("/blacklist", methods=["POST"])
def add_blacklist():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    required_fields = ["type", "value", "reason"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    blacklist_entry = add_to_blacklist(data)
    return jsonify(blacklist_entry), 201

@blacklist_bp.route("/blacklist", methods=["GET"])
def fetch_blacklist():
    blacklists = get_all_blacklist()
    return jsonify(blacklists), 200

@blacklist_bp.route("/blacklist/<entry_id>", methods=["DELETE"])
def delete_blacklist(entry_id):
    success = delete_blacklist_entry(entry_id)

    if not success:
        return jsonify({"error": "Blacklist entry not found or could not be deleted"}), 404

    return jsonify({"message": "Blacklist entry deleted successfully"}), 200
 
