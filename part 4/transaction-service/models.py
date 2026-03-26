from datetime import datetime, timezone
from db import db


def _now():
    return datetime.now(timezone.utc)


class CardTransaction(db.Model):
    __tablename__ = "card_transactions"

    transaction_id        = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    card_id               = db.Column(db.BigInteger, nullable=False, index=True)
    user_id               = db.Column(db.BigInteger, nullable=False, index=True)
    transaction_type      = db.Column(db.String(50),  nullable=False)   # TOP_UP | REFUND | PAYMENT
    amount                = db.Column(db.Numeric(10, 2), nullable=False)
    currency              = db.Column(db.String(10),  nullable=False, default="SGD")
    status                = db.Column(db.String(30),  nullable=False, index=True)
    # PENDING | SUCCESS | FAILED | ROLLED_BACK
    payment_reference     = db.Column(db.String(255), unique=True, nullable=True)   # Stripe PaymentIntent ID
    orchestrator_reference = db.Column(db.String(255), nullable=True)
    failure_reason        = db.Column(db.Text, nullable=True)
    created_at            = db.Column(db.DateTime(timezone=True), default=_now, nullable=False)
    updated_at            = db.Column(db.DateTime(timezone=True), default=_now, onupdate=_now, nullable=False)

    # Valid status transitions — enforced at the service layer
    VALID_TRANSITIONS = {
        "PENDING":     {"SUCCESS", "FAILED", "ROLLED_BACK"},
        "SUCCESS":     {"ROLLED_BACK"},   # refund path
        "FAILED":      set(),
        "ROLLED_BACK": set(),
    }

    def can_transition_to(self, new_status: str) -> bool:
        return new_status in self.VALID_TRANSITIONS.get(self.status, set())

    def to_dict(self) -> dict:
        return {
            "transaction_id":         self.transaction_id,
            "card_id":                self.card_id,
            "user_id":                self.user_id,
            "transaction_type":       self.transaction_type,
            "amount":                 float(self.amount),
            "currency":               self.currency,
            "status":                 self.status,
            "payment_reference":      self.payment_reference,
            "orchestrator_reference": self.orchestrator_reference,
            "failure_reason":         self.failure_reason,
            "created_at":             self.created_at.isoformat(),
            "updated_at":             self.updated_at.isoformat(),
        }
