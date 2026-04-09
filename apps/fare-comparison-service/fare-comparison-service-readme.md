running on port 3003

This is a composite/orchestrator service. It calls:
- route-cache-service (:3010) — to fetch the user's locked route
- fare-service (:3004) — to calculate PT fare per segment
- ride-hailing-aggregator (:3008) — to fetch ride-hailing quotes

Before testing, make sure all three services above are running, and that fare-service has data imported (see fare-service readme).

---

valid values:
- fare_category: `adult_card` | `adult_cash` | `senior_card` | `senior_cash` | `student_card` | `student_cash` | `workfare_card` | `workfare_cash`
- sort_by: `price` | `eta`

---

1. test service health
```GET http://localhost:3003/fare/health```
returns:
```json
{
  "status": "ok",
  "service": "fare-comparison-service"
}
```

---

2. compare fares (main endpoint)
```POST http://localhost:3003/fare/compare```
body:
```json
{
  "route_id": 1,
  "group_size": 1,
  "fare_category": "adult_card",
  "sort_by": "price"
}
```
returns:
```json
{
  "route_id": 1,
  "origin": "Ang Mo Kio",
  "destination": "Bras Basah",
  "group_size": 1,
  "fare_category": "adult_card",
  "public_transport": {
    "mode": "PUBLIC_TRANSPORT",
    "total_duration_mins": 44,
    "total_distance_km": 12.3,
    "transfer_count": 1,
    "fare_per_person": 1.80,
    "fare_breakdown": [
      {
        "segment_id": 1,
        "mode": "MRT",
        "transport_mode": "mrt_lrt",
        "from_stop": "Ang Mo Kio",
        "to_stop": "Dhoby Ghaut",
        "distance_km": 9.8,
        "fare": 1.48
      },
      {
        "segment_id": 3,
        "mode": "BUS",
        "transport_mode": "trunk_bus",
        "from_stop": "Dhoby Ghaut",
        "to_stop": "Bras Basah",
        "distance_km": 2.5,
        "fare": 0.32
      }
    ],
    "segments_priced": 2,
    "segments_skipped": 1
  },
  "ride_hailing": {
    "metadata": {
      "totalOptions": 3,
      "cheapestProvider": "Tada",
      "fastestProvider": "Grab"
    },
    "quotes": [
      {
        "provider": "Tada",
        "price": 11.80,
        "eta": 28,
        "route": "Ang Mo Kio → Bras Basah",
        "bookingLink": "tada://book?..."
      },
      {
        "provider": "Gojek",
        "price": 12.50,
        "eta": 25,
        "route": "Ang Mo Kio → Bras Basah",
        "bookingLink": "gojek://book?..."
      },
      {
        "provider": "Grab",
        "price": 14.00,
        "eta": 22,
        "route": "Ang Mo Kio → Bras Basah",
        "bookingLink": "grab://book?..."
      }
    ]
  },
  "filters": {
    "cheapest": {
      "mode": "public_transport",
      "provider": "PT",
      "price": 1.80
    },
    "fastest": {
      "mode": "ride_hailing",
      "provider": "Grab",
      "duration_mins": 22
    }
  }
}
```

---

3. compare fares for group travel (4 people)
```POST http://localhost:3003/fare/compare```
body:
```json
{
  "route_id": 1,
  "group_size": 4,
  "fare_category": "adult_card",
  "sort_by": "price"
}
```

note: each ride-hailing quote will include `price_per_person` (total cost ÷ group_size).
This lets users see if splitting a car is cheaper than each taking PT individually.

returns the same structure as above, with `price_per_person` added to each ride-hailing quote:
```json
{
  "ride_hailing": {
    "quotes": [
      {
        "provider": "Tada",
        "price": 11.80,
        "eta": 28,
        "price_per_person": 2.95
      }
    ],
    "group_size_note": "Cost split across 4 people (ride cost ÷ 4)"
  }
}
```

---

4. sort by fastest eta instead of cheapest price
```POST http://localhost:3003/fare/compare```
body:
```json
{
  "route_id": 1,
  "group_size": 1,
  "sort_by": "eta"
}
```

note: `fare_category` defaults to `adult_card` if omitted.

---

error cases:
- route_id not found → 404 Not Found
- route has no route_options stored → 400 Bad Request
- ride-hailing aggregator unavailable → returns PT fare only, with `provider_unavailable: true` in ride_hailing block (does not fail the whole request)
- no fare rule found for a segment → that segment is skipped and noted in `fare_breakdown` with `fare: null`
