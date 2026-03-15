to note: port running on 3010

1. must first POST data in
```bash
{
    {
    "route_id": 1,
    "user_id": 1001,
    "origin_label": "SMU",
    "destination_label": "Jurong East",
    "route_payload_json": {
        "source": "google-maps",
        "duration": 1200
    },
    "selected_option_id": null,
    "is_locked": false,
    "search_status": "GENERATED",
    "route_options": [
    {
      "option_id": 1,
      "summary": "MRT via Bugis",
      "total_duration_mins": 52,
      "total_distance_km": 18.4,
      "transfer_count": 1,
      "main_mode": "MRT",
      "is_public_transport": true,
      "segments": [
        {
          "segment_id": 1,
          "mode": "WALK",
          "from_stop": "SMU",
          "to_stop": "Bencoolen MRT",
          "duration_mins": 7,
          "distance_km": 0.5,
          "line_or_service": "",
          "segment_order": 1
        }
      ]
    }
  ]
}
```

2. then can fetch data using GET request
- requires user_id, origin & destination params
```bash
GET http://localhost:3010/route-cache?user_id=1001&origin=SMU&destination=Jurong%20East
```
3. GET request with route_id also works
```bash
GET http://localhost:3010/route-cache/by-route-id?route_id=1
```

4. for user to select locked route, PATCH request
- requires selected option, route_id and option_id
```bash
PATCH http://localhost:3010/route-cache/select-option?route_id=1&option_id=1
```

5. can DELETE
- requires user_id, origin & destination
```bash
DELETE http://localhost:3010/route-cache?user_id=1001&origin=SMU&destination=Jurong%20East
```

result: { "acknowledged": true, "deletedCount": 1 }