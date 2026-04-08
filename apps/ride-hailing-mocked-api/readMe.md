Tests:

1. Test GET
run ```GET http://localhost:3005/mock-api/```
returns: mocked ride-hailing provider api is running

2. Retrieve All Database Records
run ```GET http://localhost:3005/mock-api/all-quotes```
returns: The entire contents of database.json.

3. Query Specific Route
run ```GET http://localhost:3005/mock-api/quotes?origin=SMU&destination=Changi%20Airport```

Notes: This service uses a local database.json file to simulate real-world API responses. It contains 12+ pre-defined Singapore routes.

Database Structure Example:
```bash
{
  "provider": "Grab",
  "price": 28.50,
  "eta": 12,
  "link": "https://grab.fake/ride1"
}```