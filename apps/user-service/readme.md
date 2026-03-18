running on port 3012

1. test service is running
```GET http://localhost:3012/user-service```
returns: user service is running

2. insert user data
```POST http://localhost:3012/user-service/test```
returns:
```bash
{
  "fullName": "Calynn Ong",
  "email": "calynn@example.com",
  "username": "calynnong",
  "passwordHash": "mockhashedpassword",
  "isActive": true,
  "_id": "69ba75859d6606c9c589588b",
  "createdAt": "2026-03-18T09:51:01.273Z",
  "updatedAt": "2026-03-18T09:51:01.273Z",
  "__v": 0
}
```

3. retrieve user data
```GET http://localhost:3012/user-service/users```
```bash
[
  {
    "_id": "69ba7478d981f25eba605025",
    "fullName": "Calynn Ong",
    "email": "calynn@example.com",
    "username": "calynnong",
    "passwordHash": "mockhashedpassword",
    "isActive": true,
    "createdAt": "2026-03-18T09:46:32.229Z",
    "updatedAt": "2026-03-18T09:46:32.229Z",
    "__v": 0
  }
]
```