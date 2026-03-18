running on port 3002

1. test service
```GET http://localhost:3002/card-service```
returns: card service is running

2. create new card
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

note: posting again returns error

3. retrieve all cards
```GET http://localhost:3002/card-service/cards```
```bash
[
  {
    "_id": "69ba773b171025a41ee64586",
    "userId": "user_001",
    "cardNumber": "CARD0001",
    "cardType": "adult",
    "balance": 25,
    "status": "active",
    "createdAt": "2026-03-18T09:58:19.585Z",
    "updatedAt": "2026-03-18T09:58:19.585Z",
    "__v": 0
  }
]
```