## Ride-Hailing Mocked API

This folder is a lightweight `json-server` data source for the ride-hailing flow.

The mock API starts from the root project script:

```bash
npm run start:ride-hailing-mocked-api
```

That command runs:

```bash
json-server apps/ride-hailing-mocked-api/db.json --port 4000
```

## What It Serves

`db.json` exposes a `quotes` collection on port `4000`.

Useful direct endpoint:

```bash
GET http://localhost:4000/quotes
```

Example:

```bash
GET http://localhost:4000/quotes?origin=SMU&destination=Changi%20Airport
```

## How The App Uses It

The frontend does not call this mock API directly.

Flow:
1. Frontend -> Kong -> `ride-hailing-aggregator-service`
2. `ride-hailing-aggregator-service` -> `ride-hailing-wrapper-service`
3. `ride-hailing-wrapper-service` -> `http://localhost:4000/quotes`

The wrapper service reads the matching route entry from the mock data and extracts provider-specific quotes such as Grab, Gojek, and Tada.

## Data Shape

Each route record contains an origin, destination, and provider results array.

```json
{
  "id": "1",
  "origin": "SMU",
  "destination": "Changi Airport",
  "results": [
    {
      "provider": "Grab",
      "price": 28.5,
      "eta": 12,
      "link": "https://grab.fake/ride1"
    }
  ]
}
```
