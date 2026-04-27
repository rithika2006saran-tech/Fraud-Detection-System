from datetime import datetime
from app.database.db import blacklist_collection
from bson import ObjectId

def add_to_blacklist(data):
    blacklist={
        "type":data.get("type"),
        "value":data.get("value"),
        "reason":data.get("reason"),
        "createdAt": datetime.utcnow()
    }
    result = blacklist_collection.insert_one(blacklist)
    blacklist["_id"]=str(result.inserted_id)
    blacklist["createdAt"]=blacklist["createdAt"].isoformat()
    return blacklist

def get_all_blacklist():
    blacklists = []
    for blacklist in blacklist_collection.find():
        blacklist["_id"]=str(blacklist["_id"])
        if blacklist.get("createdAt"):
            blacklist["createdAt"]=blacklist["createdAt"].isoformat()
        blacklists.append(blacklist)
    return blacklists

def delete_blacklist_entry(entry_id):
    try:
        entry_id = ObjectId(entry_id)
        result = blacklist_collection.delete_one({"_id": entry_id})

        if result.deleted_count == 0:
            return False

        return True

    except Exception:
        return False