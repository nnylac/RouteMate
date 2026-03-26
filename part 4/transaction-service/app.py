import logging
import os

from flask import Flask, jsonify, request
from dotenv import load_dotenv

from db import db, init_db
from models import CardTransaction
import publisher

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"]        = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/transaction_db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

init_db(app)

VALID_TYPES    = {"TOP_UP", "PAYMENT", "REFUND"}
VALID_STATUSES = {"PENDING", "SUCCESS", "FAILED", "ROLLED_BACK"}


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "transaction-service"})


# ---------------------------------------------------------------------------
# POST /transactions
# Create a new transaction record (always starts as PENDING).
#
# Body:
#   card_id               int       required
#   user_id               int       required
#   transaction_type      str       required  TOP_UP | PAYMENT | REFUND
#   amount                float     required  SGD dollars
#   currency              str       optional  default SGD
#   payment_reference     str       optional  Stripe PaymentIntent ID
#   orchestrator_reference str      optional
# ---------------------------------------------------------------------------

@app.route("/transactions", methods=["POST"])
def create_transaction():
    data = request.get_json(silent=True) or {}

    # Validate required fields
    required = ["card_id", "user_id", "transaction_type", "amount"]
    missing  = [f for f in required if data.get(f) is None]
    if missing:
        return jsonify({"error": f"Missing required fields: {missing}"}), 400

    txn_type = str(data["transaction_type"]).upper()
    if txn_type not in VALID_TYPES:
        return jsonify({"error": f"transaction_type must be one of {VALID_TYPES}"}), 400

    try:
        amount = float(data["amount"])
        if amount <= 0:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"error": "amount must be a positive number"}), 400

    txn = CardTransaction(
        card_id                = int(data["card_id"]),
        user_id                = int(data["user_id"]),
        transaction_type       = txn_type,
        amount                 = amount,
        currency               = str(data.get("currency", "SGD")).upper(),
        status                 = "PENDING",
        payment_reference      = data.get("payment_reference"),
        orchestrator_reference = data.get("orchestrator_reference"),
    )

    db.session.add(txn)
    db.session.commit()

    logger.info("Created transaction %s (type=%s, status=PENDING)", txn.transaction_id, txn_type)
    return jsonify(txn.to_dict()), 201


# ---------------------------------------------------------------------------
# PATCH /transactions/<transaction_id>/status
# Update the status of an existing transaction.
# Enforces valid state transitions and publishes AMQP events.
#
# Body:
#   status          str   required  SUCCESS | FAILED | ROLLED_BACK
#   failure_reason  str   optional  (used when status = FAILED)
# ---------------------------------------------------------------------------

@app.route("/transactions/<int:transaction_id>/status", methods=["PATCH"])
def update_transaction_status(transaction_id):
    txn = CardTransaction.query.get(transaction_id)
    if not txn:
        return jsonify({"error": "Transaction not found"}), 404

    data       = request.get_json(silent=True) or {}
    new_status = str(data.get("status", "")).upper()

    if new_status not in VALID_STATUSES:
        return jsonify({"error": f"status must be one of {VALID_STATUSES}"}), 400

    if not txn.can_transition_to(new_status):
        return jsonify({
            "error": f"Cannot transition from {txn.status} to {new_status}",
        }), 409

    txn.status = new_status

    if new_status == "FAILED":
        txn.failure_reason = data.get("failure_reason")

    db.session.commit()
    logger.info("Transaction %s → %s", transaction_id, new_status)

    # Publish AMQP event based on type + new status
    txn_dict = txn.to_dict()
    if txn.transaction_type == "TOP_UP":
        if new_status == "SUCCESS":
            publisher.publish_topup_success(txn_dict)
        elif new_status == "FAILED":
            publisher.publish_topup_failed(txn_dict)
        elif new_status == "ROLLED_BACK":
            publisher.publish_topup_rolledback(txn_dict)

    return jsonify(txn_dict), 200


# ---------------------------------------------------------------------------
# GET /transactions/<transaction_id>
# Retrieve a single transaction by ID.
# ---------------------------------------------------------------------------

@app.route("/transactions/<int:transaction_id>", methods=["GET"])
def get_transaction(transaction_id):
    txn = CardTransaction.query.get(transaction_id)
    if not txn:
        return jsonify({"error": "Transaction not found"}), 404
    return jsonify(txn.to_dict()), 200


# ---------------------------------------------------------------------------
# GET /transactions/card/<card_id>
# List all transactions for a card (newest first).
# ---------------------------------------------------------------------------

@app.route("/transactions/card/<int:card_id>", methods=["GET"])
def get_transactions_by_card(card_id):
    transactions = (
        CardTransaction.query
        .filter_by(card_id=card_id)
        .order_by(CardTransaction.created_at.desc())
        .all()
    )
    return jsonify([t.to_dict() for t in transactions]), 200


# ---------------------------------------------------------------------------
# GET /transactions/user/<user_id>
# List all transactions for a user (newest first).
# ---------------------------------------------------------------------------

@app.route("/transactions/user/<int:user_id>", methods=["GET"])
def get_transactions_by_user(user_id):
    transactions = (
        CardTransaction.query
        .filter_by(user_id=user_id)
        .order_by(CardTransaction.created_at.desc())
        .all()
    )
    return jsonify([t.to_dict() for t in transactions]), 200


# ---------------------------------------------------------------------------

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5003))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG", "false").lower() == "true")
