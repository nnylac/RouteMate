running on port 3011

valid values:
- transactionType: `top_up` | `payment` | `refund`
- status: `pending` | `success` | `failed` | `rolled_back`

valid status transitions:
- `pending` → `success`, `failed`, `rolled_back`
- `success` → `rolled_back` (refund path)
- `failed` → no further transitions
- `rolled_back` → no further transitions

1. test database connection
```GET http://localhost:3011/transactions/health/db```
returns:
```bash
{
  "status": "ok",
  "database": "connected"
}
```

2. create a new transaction
```POST http://localhost:3011/transactions```
body:
```bash
{
  "userId": "user_001",
  "cardId": "CARD0001",
  "transactionType": "top_up",
  "amount": "20.00",
  "status": "pending",
  "paymentReference": "pi_xxxxxxxxxxxxx"
}
```
returns:
```bash
{
  "transactionId": "1",
  "userId": "user_001",
  "cardId": "CARD0001",
  "transactionType": "top_up",
  "amount": "20.00",
  "status": "pending",
  "reference": "txn_1234567890",
  "paymentReference": "pi_xxxxxxxxxxxxx",
  "failureReason": null,
  "createdAt": "2026-03-18T09:58:19.585Z",
  "updatedAt": "2026-03-18T09:58:19.585Z"
}
```

3. update transaction status
```PATCH http://localhost:3011/transactions/:id/status```
example:
```PATCH http://localhost:3011/transactions/1/status```
body (success):
```bash
{
  "status": "success"
}
```
body (failed — include reason):
```bash
{
  "status": "failed",
  "failureReason": "Card declined"
}
```
returns the updated transaction object.

note: invalid transitions (e.g. failed → success) return 409 Conflict

4. get all transactions
```GET http://localhost:3011/transactions```
returns array of all transactions, newest first.

5. get a single transaction
```GET http://localhost:3011/transactions/:id```
example:
```GET http://localhost:3011/transactions/1```
returns:
```bash
{
  "transactionId": "1",
  "userId": "user_001",
  "cardId": "CARD0001",
  "transactionType": "top_up",
  "amount": "20.00",
  "status": "success",
  "reference": "txn_1234567890",
  "paymentReference": "pi_xxxxxxxxxxxxx",
  "failureReason": null,
  "createdAt": "2026-03-18T09:58:19.585Z",
  "updatedAt": "2026-03-18T09:58:19.585Z"
}
```

6. get all transactions for a card
```GET http://localhost:3011/transactions/card/:cardId```
example:
```GET http://localhost:3011/transactions/card/CARD0001```
returns array of transactions for that card, newest first.

7. get all transactions for a user
```GET http://localhost:3011/transactions/user/:userId```
example:
```GET http://localhost:3011/transactions/user/user_001```
returns array of transactions for that user, newest first.
