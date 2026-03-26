import os
import stripe
from flask import Flask, jsonify, request
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "payment-wrapper-service"})


# ---------------------------------------------------------------------------
# POST /payment/intent
# Create a Stripe PaymentIntent and return the client_secret.
# Body: { amount: float (SGD dollars), currency: str, metadata: dict }
# ---------------------------------------------------------------------------

@app.route("/payment/intent", methods=["POST"])
def create_payment_intent():
    data = request.get_json(silent=True) or {}

    amount = data.get("amount")
    if amount is None:
        return jsonify({"error": "amount is required"}), 400

    try:
        amount_cents = int(round(float(amount) * 100))   # SGD dollars → cents
    except (TypeError, ValueError):
        return jsonify({"error": "amount must be a number"}), 400

    currency  = data.get("currency", "sgd").lower()
    metadata  = data.get("metadata", {})

    try:
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency=currency,
            metadata=metadata,
            # Allows backend-only confirmation with a test payment method
            automatic_payment_methods={
                "enabled": True,
                "allow_redirects": "never",
            },
        )
        return jsonify({
            "payment_intent_id": intent.id,
            "client_secret":     intent.client_secret,
            "status":            intent.status,
            "amount":            amount,
            "currency":          currency,
        }), 201

    except stripe.error.StripeError as e:
        return jsonify({"error": e.user_message}), 400


# ---------------------------------------------------------------------------
# POST /payment/confirm
# Confirm a PaymentIntent with a (test) payment method.
# Body: { payment_intent_id: str, payment_method: str }
#
# Stripe test payment methods:
#   pm_card_visa              → success
#   pm_card_visa_chargeDeclined → card declined
# ---------------------------------------------------------------------------

@app.route("/payment/confirm", methods=["POST"])
def confirm_payment():
    data = request.get_json(silent=True) or {}

    payment_intent_id = data.get("payment_intent_id")
    if not payment_intent_id:
        return jsonify({"error": "payment_intent_id is required"}), 400

    # Default to Stripe's generic success test card
    payment_method = data.get("payment_method", "pm_card_visa")

    try:
        intent = stripe.PaymentIntent.confirm(
            payment_intent_id,
            payment_method=payment_method,
        )
        return jsonify({
            "payment_intent_id": intent.id,
            "status":            intent.status,
        }), 200

    except stripe.error.CardError as e:
        # Card was declined — caller should mark transaction FAILED
        return jsonify({
            "error":  e.user_message,
            "code":   e.code,
            "status": "failed",
        }), 402

    except stripe.error.StripeError as e:
        return jsonify({"error": e.user_message}), 400


# ---------------------------------------------------------------------------
# POST /payment/refund
# Refund a PaymentIntent (full or partial).
# Body: { payment_intent_id: str, amount?: float (SGD dollars) }
# ---------------------------------------------------------------------------

@app.route("/payment/refund", methods=["POST"])
def create_refund():
    data = request.get_json(silent=True) or {}

    payment_intent_id = data.get("payment_intent_id")
    if not payment_intent_id:
        return jsonify({"error": "payment_intent_id is required"}), 400

    params = {"payment_intent": payment_intent_id}

    partial_amount = data.get("amount")
    if partial_amount is not None:
        try:
            params["amount"] = int(round(float(partial_amount) * 100))
        except (TypeError, ValueError):
            return jsonify({"error": "amount must be a number"}), 400

    try:
        refund = stripe.Refund.create(**params)
        return jsonify({
            "refund_id": refund.id,
            "status":    refund.status,
            "amount":    refund.amount / 100,   # back to SGD dollars
            "currency":  refund.currency,
        }), 200

    except stripe.error.StripeError as e:
        return jsonify({"error": e.user_message}), 400


# ---------------------------------------------------------------------------
# GET /payment/intent/<intent_id>
# Retrieve current status of a PaymentIntent.
# ---------------------------------------------------------------------------

@app.route("/payment/intent/<intent_id>", methods=["GET"])
def get_payment_intent(intent_id):
    try:
        intent = stripe.PaymentIntent.retrieve(intent_id)
        return jsonify({
            "payment_intent_id": intent.id,
            "status":            intent.status,
            "amount":            intent.amount / 100,
            "currency":          intent.currency,
            "metadata":          dict(intent.metadata),
        }), 200

    except stripe.error.StripeError as e:
        return jsonify({"error": e.user_message}), 400


# ---------------------------------------------------------------------------

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG", "false").lower() == "true")
