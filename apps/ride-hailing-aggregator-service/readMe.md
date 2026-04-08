Port running on 3008

Tests:

1. Test GET
run ```GET http://localhost:3008/ridehail/```
returns: ride-hailing aggregator is running

2. Get Aggregated Quotes (The "Main" Call)
run POST ```http://localhost:3008/ridehail/quotes```
Note: This service calls the Wrapper to fetch and sort data.

Using Postman, input in body:
```bash
{
  "origin": "SMU",
  "destination": "Changi Airport"
}
``` 

3. Check Health via Gateway
run ```GET http://localhost:8080/ridehail/```
returns: ride-hailing aggregator is running (via Kong)

Notes: This service acts as the orchestrator. It currently forwards requests to the Wrapper and will eventually integrate with the route-cache-service (MongoDB) to store search sessions.