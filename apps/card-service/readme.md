running on port 3002

1. test service
```GET http://localhost:3002/card-service```
returns: card service is running


<!--
note: removed test card, subsequent tests need to use diff ID
2. create test card
```post http://localhost:3002/card-service/test```
```bash
{
  "userId": "user_001",
  "cardNumber": "CARD0001",
  "cardType": "adult",
  "balance": 25,
  "status": "active",
  "_id": "69ba773b171025a41ee64586",
  "createdAt": "2026-03-18T09:58:19.585Z",
  "updatedAt": "2026-03-18T09:58:19.585Z",
  "__v": 0
}
``` 

note: posting again returns error -->


3. create real card
```POST http://localhost:3002/card-service/cards```

using postman, insert in body:
```bash
{
  "userId": "user_001",
  "cardType": "adult"
}
```

returns:
```bash
{
    "userId": "user_001",
    "cardNumber": "CARD1774550950941",
    "cardType": "adult",
    "balance": 0,
    "status": "active",
    "_id": "69c57fa6fc52b87b0d0d2aea",
    "createdAt": "2026-03-26T18:49:10.942Z",
    "updatedAt": "2026-03-26T18:49:10.942Z",
    "__v": 0
}
```


4. retrieve all cards
```GET http://localhost:3002/card-service/cards```
```bash
[
  {
    "_id": "69c57f5ffc52b87b0d0d2ae8",
    "userId": "user_001",
    "cardNumber": "CARD0001",
    "cardType": "adult",
    "balance": 25,
    "status": "active",
    "createdAt": "2026-03-26T18:47:59.140Z",
    "updatedAt": "2026-03-26T18:47:59.140Z",
    "__v": 0
  },
  {
    "_id": "69c57fa6fc52b87b0d0d2aea",
    "userId": "user_001",
    "cardNumber": "CARD1774550950941",
    "cardType": "adult",
    "balance": 0,
    "status": "active",
    "createdAt": "2026-03-26T18:49:10.942Z",
    "updatedAt": "2026-03-26T18:49:10.942Z",
    "__v": 0
  }
]
```


5. get cards by userId
```GET http://localhost:3002/card-service/cards/user/<userId>```

example:
```GET http://localhost:3002/card-service/cards/user/user_001```

returns:
```bash
[
  {
    "_id": "69c57f5ffc52b87b0d0d2ae8",
    "userId": "user_001",
    "cardNumber": "CARD0001",
    "cardType": "adult",
    "balance": 25,
    "status": "active",
    "createdAt": "2026-03-26T18:47:59.140Z",
    "updatedAt": "2026-03-26T18:47:59.140Z",
    "__v": 0
  },
  {
    "_id": "69c57fa6fc52b87b0d0d2aea",
    "userId": "user_001",
    "cardNumber": "CARD1774550950941",
    "cardType": "adult",
    "balance": 0,
    "status": "active",
    "createdAt": "2026-03-26T18:49:10.942Z",
    "updatedAt": "2026-03-26T18:49:10.942Z",
    "__v": 0
  }
]
```


6. get card by cardId
```GET http://localhost:3002/card-service/cards/<cardId>```

example:
```GET http://localhost:3002/card-service/cards/69c57f5ffc52b87b0d0d2ae8```


7. top up card
```PATCH http://localhost:3002/card-service/cards/<cardId>/topup```

example:
```PATCH http://localhost:3002/card-service/cards/69c57f5ffc52b87b0d0d2ae8/topup```

using postman, input in body:
```bash
{
  "amount": 10
}
```

returns:
```bash
{
    "_id": "69c57f5ffc52b87b0d0d2ae8",
    "userId": "user_001",
    "cardNumber": "CARD0001",
    "cardType": "adult",
    "balance": 35,
    "status": "active",
    "createdAt": "2026-03-26T18:47:59.140Z",
    "updatedAt": "2026-03-26T18:55:38.934Z",
    "__v": 0
}
```


8. get card by cardNumber
```GET http://localhost:3002/card-service/cards/number/<cardNumber>```

example:
```GET http://localhost:3002/card-service/cards/number/CARD39222077```


9. deduct from card
```PATCH http://localhost:3002/card-service/cards/<cardId>/deduct```

example:
```PATCH http://localhost:3002/card-service/cards/69c57f5ffc52b87b0d0d2ae8/deduct```

enter in body:
```bash
{
  "amount": 2
}
```


10. update card status
```PATCH http://localhost:3002/card-service/cards/<cardId>/status```

example:
```PATCH http://localhost:3002/card-service/cards/69c57f5ffc52b87b0d0d2ae8/status```

body:
```bash
{
  "status": "blocked"
}
```