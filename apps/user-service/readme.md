running on port 3012

1. test service is running
```GET http://localhost:3012/user-service```
returns: user service is running

2. register new user
```POST http://localhost:3012/user-service/register```

use postman to input:
```bash
{
  "fullName": "Calynn Ong",
  "email": "calynn@example.com",
  "username": "calynnong",
  "password": "password123"
}
```

returns:
```bash
{
    "id": "69baf275bfdfe524919f68f9",
    "fullName": "Calynn Ong",
    "email": "calynn@example.com",
    "username": "calynnong",
    "isActive": true,
    "createdAt": "2026-03-18T18:44:05.166Z",
    "updatedAt": "2026-03-18T18:44:05.166Z"
}
```

3. login with user details
```POST http://localhost:3012/user-service/login```

use postman to input:
```bash
{
  "usernameOrEmail": "calynnong",
  "password": "password123"
}
```

returns:
```bash
{
    "message": "Login successful",
    "user":
    {
        "id": "69baf275bfdfe524919f68f9",
        "fullName": "Calynn Ong",
        "email": "calynn@example.com",
        "username": "calynnong",
        "isActive": true,
        "createdAt": "2026-03-18T18:44:05.166Z",
        "updatedAt": "2026-03-18T18:44:05.166Z"
    }
}
```

4. get all users
```GET http://localhost:3012/user-service/users```

returns:
```bash
[
    {
        "id": "69baf275bfdfe524919f68f9",
        "fullName": "Calynn Ong",
        "email": "calynn@example.com",
        "username": "calynnong",
        "isActive": true,
        "createdAt": "2026-03-18T18:44:05.166Z",
        "updatedAt": "2026-03-18T18:44:05.166Z"
    }
]
```

5. get one user
```GET http://localhost:3012/user-service/users/<mongo-user-id>```

example:
```GET http://localhost:3012/user-service/users/69baf275bfdfe524919f68f9```

returns:
```bash
{
    "id": "69baf275bfdfe524919f68f9",
    "fullName": "Calynn Ong",
    "email": "calynn@example.com",
    "username": "calynnong",
    "isActive": true,
    "createdAt": "2026-03-18T18:44:05.166Z",
    "updatedAt": "2026-03-18T18:44:05.166Z"
}
```

6. update user details
```PATCH http://localhost:3012/user-service/users/<user_id>```

example:
```PATCH http://localhost:3012/user-service/users/69baf275bfdfe524919f68f9```

use postman and input:
```bash
{
  "fullName": "Calynn Ong",
  "email": "calynn_new@example.com"
}
```

returns:
```bash
{
    "id": "69baf275bfdfe524919f68f9",
    "fullName": "Calynn Ong",
    "email": "calynn_new@example.com",
    "username": "calynnong",
    "isActive": true,
    "createdAt": "2026-03-18T18:44:05.166Z",
    "updatedAt": "2026-03-18T19:09:33.630Z"
}
```

7. change user password
```PATCH http://localhost:3012/user-service/users/<user-id>/change-password```

example:
```PATCH http://localhost:3012/user-service/users/69baf275bfdfe524919f68f9/change-password```

use postman to input:
```bash
{
  "currentPassword": "password123",
  "newPassword": "newPassword456"
}
```

returns:
```bash
{
    "message": "Password changed successfully"
}
```