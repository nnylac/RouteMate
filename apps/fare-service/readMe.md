port running on 3004

tests:
1. test GET
run ```GET http://localhost:3004/fare-service/```
returns: fare service is running


2. test POST
run ```POST http://localhost:3004/fare-service/test```
```bash 
{
  "fareRuleId": "4",
  "transportMode": "trunk_bus",
  "fareCategory": "adult_card",
  "applicableTime": null,
  "distanceFromKm": "0.00",
  "distanceToKm": "3.20",
  "fareAmount": "128.00",
  "createdAt": "2026-03-17T11:39:43.288Z",
  "updatedAt": "2026-03-17T11:39:43.288Z"
}
```

3. run ```GET http://localhost:3004/fare-service/rules```
```bash
[
  {
    "fareRuleId": "1",
    "transportMode": "trunk_bus",
    "fareCategory": "adult_card",
    "applicableTime": null,
    "distanceFromKm": "0.00",
    "distanceToKm": "3.20",
    "fareAmount": "128.00",
    "createdAt": "2026-03-15T11:43:46.085Z",
    "updatedAt": "2026-03-15T11:43:46.085Z"
  },
  {
    "fareRuleId": "2",
    "transportMode": "trunk_bus",
    "fareCategory": "adult_card",
    "applicableTime": null,
    "distanceFromKm": "0.00",
    "distanceToKm": "3.20",
    "fareAmount": "128.00",
    "createdAt": "2026-03-15T11:48:11.275Z",
    "updatedAt": "2026-03-15T11:48:11.275Z"
  }
]```