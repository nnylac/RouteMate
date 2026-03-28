running on port 3014

depends on:
- maps-wrapper-service (port 3005)
- arrival-timing-service (port 3013)
- route-cache-service (port 3010)

---

1. search for routes
```POST http://localhost:3014/route-planner/search```

using postman/rest.http, insert in body:
```bash
{
  "user_id": 1001,
  "origin": "Tampines MRT",
  "destination": "Orchard MRT"
}
```

returns all route options enriched with arrival timings for each TRANSIT segment, and saves the result to route-cache-service:
```bash
{
  "route_id": 1774425608061,
  "user_id": 1001,
  "origin_label": "Tampines MRT",
  "destination_label": "Orchard MRT",
  "options": [
    {
      "option_id": 1,
      "summary": "Option 1",
      "total_duration_mins": 44,
      "total_distance_km": 19,
      "transfer_count": 1,
      "main_mode": "SUBWAY",
      "is_public_transport": true,
      "segments": [
        {
          "mode": "WALKING",
          "from_stop": null,
          "to_stop": null,
          "duration_mins": 1,
          "distance_km": 0.09,
          "line_or_service": null,
          "segment_order": 1,
          "segment_id": 1
        },
        {
          "mode": "TRANSIT",
          "from_stop": "Tampines",
          "to_stop": "City Hall",
          "duration_mins": 24,
          "distance_km": 15.75,
          "line_or_service": "EW",
          "segment_order": 2,
          "segment_id": 2,
          "arrival_timing": {
            "line": "EW",
            "stop": "Tampines",
            "mode": "SUBWAY",
            "predicted_arrival_mins": 3,
            "source": "mock"
          }
        }
      ]
    }
  ]
}
```

notes:
- `route_id` is a timestamp-based unique ID
- arrival timings are only added to TRANSIT segments (not WALKING)
- route is saved to route-cache with `is_locked: false` and `search_status: GENERATED`

---

2. select / lock a route option
```PATCH http://localhost:3014/route-planner/select```

using postman/rest.http, insert in body:
```bash
{
  "route_id": 1774425608061,
  "option_id": 1
}
```

returns the updated route document with:
```bash
{
  "selected_option_id": 1,
  "is_locked": true,
  "search_status": "SELECTED"
}
```

notes:
- `route_id` comes from the search response
- `option_id` is whichever option the user selected (1 through however many options were returned)

---

3. get saved routes for a user
```GET http://localhost:3014/route-planner/routes?user_id=1001&origin=Tampines MRT&destination=Orchard MRT```

query params:
- `user_id` — the user's ID
- `origin` — origin label (must match exactly what was searched)
- `destination` — destination label (must match exactly what was searched)

returns the full saved route document from route-cache-service including all options and segments.