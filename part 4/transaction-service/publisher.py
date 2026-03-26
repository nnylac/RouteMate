"""
RabbitMQ publisher for transaction events.

Events published:
  card.topup.success   — after a TOP_UP transitions to SUCCESS
  card.topup.failed    — after a TOP_UP transitions to FAILED
  card.topup.rolledback — after a TOP_UP transitions to ROLLED_BACK
"""

import json
import logging
import os

import pika
from pika.exceptions import AMQPConnectionError

logger = logging.getLogger(__name__)

RABBITMQ_URL  = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
EXCHANGE_NAME = os.getenv("RABBITMQ_EXCHANGE", "routemate.events")


def _get_connection():
    params = pika.URLParameters(RABBITMQ_URL)
    params.heartbeat = 60
    return pika.BlockingConnection(params)


def publish_event(routing_key: str, payload: dict) -> bool:
    """
    Publish a JSON event to the fanout/topic exchange.
    Returns True on success, False on failure (non-fatal — caller continues).
    """
    try:
        connection = _get_connection()
        channel    = connection.channel()

        channel.exchange_declare(
            exchange=EXCHANGE_NAME,
            exchange_type="topic",
            durable=True,
        )

        channel.basic_publish(
            exchange=EXCHANGE_NAME,
            routing_key=routing_key,
            body=json.dumps(payload),
            properties=pika.BasicProperties(
                content_type="application/json",
                delivery_mode=2,   # persistent message
            ),
        )
        connection.close()
        logger.info("Published event '%s': %s", routing_key, payload)
        return True

    except AMQPConnectionError as e:
        logger.error("RabbitMQ connection failed — event '%s' not published: %s", routing_key, e)
        return False
    except Exception as e:
        logger.error("Unexpected error publishing event '%s': %s", routing_key, e)
        return False


# ---------------------------------------------------------------------------
# Typed helpers so callers never hard-code routing keys
# ---------------------------------------------------------------------------

def publish_topup_success(transaction: dict):
    publish_event("card.topup.success", {
        "event":          "card.topup.success",
        "transaction_id": transaction["transaction_id"],
        "card_id":        transaction["card_id"],
        "user_id":        transaction["user_id"],
        "amount":         transaction["amount"],
        "currency":       transaction["currency"],
    })


def publish_topup_failed(transaction: dict):
    publish_event("card.topup.failed", {
        "event":          "card.topup.failed",
        "transaction_id": transaction["transaction_id"],
        "card_id":        transaction["card_id"],
        "user_id":        transaction["user_id"],
        "failure_reason": transaction.get("failure_reason"),
    })


def publish_topup_rolledback(transaction: dict):
    publish_event("card.topup.rolledback", {
        "event":          "card.topup.rolledback",
        "transaction_id": transaction["transaction_id"],
        "card_id":        transaction["card_id"],
        "user_id":        transaction["user_id"],
        "amount":         transaction["amount"],
        "currency":       transaction["currency"],
    })
