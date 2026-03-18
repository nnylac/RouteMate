running on port 3006

1. test notification service
```GET http://localhost:3006/notification-service```
returns: notification service is running

2. test insert data
```POST http://localhost:3006/notification-service/test```

```bash
{
  "userId": "user_001",
  "type": "card_low_balance",
  "title": "Low Card Balance",
  "message": "Your card balance has fallen below the threshold.",
  "isRead": false,
  "_id": "69ba798a942280f5afc04ca7",
  "createdAt": "2026-03-18T10:08:10.094Z",
  "updatedAt": "2026-03-18T10:08:10.094Z",
  "__v": 0
}```{
  "userId": "user_001",
  "type": "card_low_balance",
  "title": "Low Card Balance",
  "message": "Your card balance has fallen below the threshold.",
  "isRead": false,
  "_id": "69ba798a942280f5afc04ca7",
  "createdAt": "2026-03-18T10:08:10.094Z",
  "updatedAt": "2026-03-18T10:08:10.094Z",
  "__v": 0
}
```

3. retrieve results
```GET http://localhost:3006/notification-service/notifications```

```bash
[
  {
    "_id": "69ba798a942280f5afc04ca7",
    "userId": "user_001",
    "type": "card_low_balance",
    "title": "Low Card Balance",
    "message": "Your card balance has fallen below the threshold.",
    "isRead": false,
    "createdAt": "2026-03-18T10:08:10.094Z",
    "updatedAt": "2026-03-18T10:08:10.094Z",
    "__v": 0
  }
]```