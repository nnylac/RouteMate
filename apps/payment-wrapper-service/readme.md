running on port 3007

1. test service
```GET http://localhost:3007/payment/health```
returns:
```bash
{
  "status": "ok",
  "service": "payment-wrapper-service"
}
```

2. create a payment intent
```POST http://localhost:3007/payment/intent```
body:
```bash
{
  "amount": 20.00,
  "currency": "sgd",
  "metadata": {
    "userId": "user_001",
    "cardId": "CARD0001"
  }
}
```
returns:
```bash
{
  "paymentIntentId": "pi_xxxxxxxxxxxxx",
  "clientSecret": "pi_xxxxxxxxxxxxx_secret_xxxxxxxxxxxxx",
  "status": "requires_confirmation",
  "amount": 20,
  "currency": "sgd"
}
```

3. confirm a payment
```POST http://localhost:3007/payment/confirm```

Stripe test payment methods:
- `pm_card_visa` → success
- `pm_card_visa_chargeDeclined` → card declined

body:
```bash
{
  "paymentIntentId": "pi_xxxxxxxxxxxxx",
  "paymentMethod": "pm_card_visa"
}
```
returns:
```bash
{
  "paymentIntentId": "pi_xxxxxxxxxxxxx",
  "status": "succeeded"
}
```

4. refund a payment (full)
```POST http://localhost:3007/payment/refund```
body:
```bash
{
  "paymentIntentId": "pi_xxxxxxxxxxxxx"
}
```
returns:
```bash
{
  "refundId": "re_xxxxxxxxxxxxx",
  "status": "succeeded",
  "amount": 20,
  "currency": "sgd"
}
```

5. refund a payment (partial)
```POST http://localhost:3007/payment/refund```
body:
```bash
{
  "paymentIntentId": "pi_xxxxxxxxxxxxx",
  "amount": 5.00
}
```

6. retrieve a payment intent
```GET http://localhost:3007/payment/intent/:id```
example:
```GET http://localhost:3007/payment/intent/pi_xxxxxxxxxxxxx```
returns:
```bash
{
  "paymentIntentId": "pi_xxxxxxxxxxxxx",
  "status": "succeeded",
  "amount": 20,
  "currency": "sgd",
  "metadata": {
    "userId": "user_001",
    "cardId": "CARD0001"
  }
}
```
