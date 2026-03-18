running on port 3011

1. test is service running
```GET http://localhost:3011/transactions/health/db```
```bash
{
  "status": "ok",
  "database": "connected"
}```

2. post data using postman
```POST http://localhost:3011/transactions```
body:
```bash
{
    "userId": "user_001",
    "cardId": "card_001",
    "transactionType": "top_up",
    "amount": "20.00",
    "status": "success"
}
```

3. get all transactions
```GET http://localhost:3011/transactions```