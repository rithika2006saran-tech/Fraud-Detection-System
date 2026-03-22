from flask import Flask
from flask_cors import CORS
from app.routes.transaction_routes import transaction_bp
from app.routes.blacklist_routes import blacklist_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(transaction_bp)
app.register_blueprint(blacklist_bp)


@app.route('/')
def home():
    return {"message": "Fraud Detection Backend Running"}

if __name__ == '__main__':
    app.run(debug=True)