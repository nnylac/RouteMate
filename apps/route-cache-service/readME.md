to note: port running on 3010

1. must first POST data in
```POST http://localhost:3010/route-cache```

use postman to post:
```bash
{
  "route_id": 1001,
  "user_id": 501,
  "origin_label": "SMU",
  "destination_label": "Jurong East",
  "route_payload_json":
  {
    "provider": "google-maps",
    "generated_at": "2026-03-19T03:00:00.000Z",
    "routes_found": 2
  },
  "is_locked": false,
  "search_status": "GENERATED",
  "route_options": [
    {
      "option_id": 1,
      "summary": "Walk to Bras Basah, then MRT to Jurong East",
      "total_duration_mins": 42,
      "total_distance_km": 18.5,
      "transfer_count": 1,
      "main_mode": "PUBLIC_TRANSPORT",
      "is_public_transport": true,
      "segments": [
        {
          "segment_id": 1,
          "mode": "WALK",
          "from_stop": "SMU",
          "to_stop": "Bras Basah MRT",
          "duration_mins": 8,
          "distance_km": 0.6,
          "segment_order": 1
        },
        {
          "segment_id": 2,
          "mode": "MRT",
          "from_stop": "Bras Basah MRT",
          "to_stop": "Jurong East MRT",
          "duration_mins": 34,
          "distance_km": 17.9,
          "line_or_service": "Circle + East West",
          "segment_order": 2
        }
      ]
    },
    {
      "option_id": 2,
      "summary": "Bus only route",
      "total_duration_mins": 55,
      "total_distance_km": 17.2,
      "transfer_count": 0,
      "main_mode": "PUBLIC_TRANSPORT",
      "is_public_transport": true,
      "segments": [
        {
          "segment_id": 1,
          "mode": "WALK",
          "from_stop": "SMU",
          "to_stop": "Bus Stop A",
          "duration_mins": 5,
          "distance_km": 0.3,
          "segment_order": 1
        },
        {
          "segment_id": 2,
          "mode": "BUS",
          "from_stop": "Bus Stop A",
          "to_stop": "Jurong East Bus Interchange",
          "duration_mins": 50,
          "distance_km": 16.9,
          "line_or_service": "66",
          "segment_order": 2
        }
      ]
    }
  ],
  "expires_at": "2026-03-20T03:00:00.000Z"
}
```

returns:
```bash
{
    "_id": "69bb088082a804f5ef824cd6",
    "route_id": 1001,
    "__v": 0,
    "created_at": "2026-03-18T20:18:08.842Z",
    "destination_label": "Jurong East",
    "expires_at": "2026-03-20T03:00:00.000Z",
    "is_locked": false,
    "origin_label": "SMU",
    "route_options": [
        {
            "option_id": 1,
            "summary": "Walk to Bras Basah, then MRT to Jurong East",
            "total_duration_mins": 42,
            "total_distance_km": 18.5,
            "transfer_count": 1,
            "main_mode": "PUBLIC_TRANSPORT",
            "is_public_transport": true,
            "segments": [
                {
                    "segment_id": 1,
                    "mode": "WALK",
                    "from_stop": "SMU",
                    "to_stop": "Bras Basah MRT",
                    "duration_mins": 8,
                    "distance_km": 0.6,
                    "segment_order": 1
                },
                {
                    "segment_id": 2,
                    "mode": "MRT",
                    "from_stop": "Bras Basah MRT",
                    "to_stop": "Jurong East MRT",
                    "duration_mins": 34,
                    "distance_km": 17.9,
                    "line_or_service": "Circle + East West",
                    "segment_order": 2
                }
            ]
        },
        {
            "option_id": 2,
            "summary": "Bus only route",
            "total_duration_mins": 55,
            "total_distance_km": 17.2,
            "transfer_count": 0,
            "main_mode": "PUBLIC_TRANSPORT",
            "is_public_transport": true,
            "segments": [
                {
                    "segment_id": 1,
                    "mode": "WALK",
                    "from_stop": "SMU",
                    "to_stop": "Bus Stop A",
                    "duration_mins": 5,
                    "distance_km": 0.3,
                    "segment_order": 1
                },
                {
                    "segment_id": 2,
                    "mode": "BUS",
                    "from_stop": "Bus Stop A",
                    "to_stop": "Jurong East Bus Interchange",
                    "duration_mins": 50,
                    "distance_km": 16.9,
                    "line_or_service": "66",
                    "segment_order": 2
                }
            ]
        }
    ],
    "route_payload_json":
    {
        "provider": "google-maps",
        "generated_at": "2026-03-19T03:00:00.000Z",
        "routes_found": 2
    },
    "search_status": "GENERATED",
    "updated_at": "2026-03-18T20:18:08.842Z",
    "user_id": 501
}
```

2. then can fetch data using GET request
- requires user_id, origin & destination params
```GET http://localhost:3010/route-cache?user_id=501&origin=SMU&destination=Jurong%20East```

3. GET request with route_id also works
```GET http://localhost:3010/route-cache/by-route-id?route_id=1001```

4. for user to select locked route, PATCH request
- requires selected option, route_id and option_id
```PATCH http://localhost:3010/route-cache/select-option?route_id=1&option_id=1```

returns:
```bash
{
    "_id": "69bb088082a804f5ef824cd6",
    "route_id": 1001,
    "__v": 0,
    "created_at": "2026-03-18T20:18:08.842Z",
    "destination_label": "Jurong East",
    "expires_at": "2026-03-20T03:00:00.000Z",
    "is_locked": true,
    "origin_label": "SMU",
    "route_options": [
        {
            "option_id": 1,
            "summary": "Walk to Bras Basah, then MRT to Jurong East",
            "total_duration_mins": 42,
            "total_distance_km": 18.5,
            "transfer_count": 1,
            "main_mode": "PUBLIC_TRANSPORT",
            "is_public_transport": true,
            "segments": [
                {
                    "segment_id": 1,
                    "mode": "WALK",
                    "from_stop": "SMU",
                    "to_stop": "Bras Basah MRT",
                    "duration_mins": 8,
                    "distance_km": 0.6,
                    "segment_order": 1
                },
                {
                    "segment_id": 2,
                    "mode": "MRT",
                    "from_stop": "Bras Basah MRT",
                    "to_stop": "Jurong East MRT",
                    "duration_mins": 34,
                    "distance_km": 17.9,
                    "line_or_service": "Circle + East West",
                    "segment_order": 2
                }
            ]
        },
        {
            "option_id": 2,
            "summary": "Bus only route",
            "total_duration_mins": 55,
            "total_distance_km": 17.2,
            "transfer_count": 0,
            "main_mode": "PUBLIC_TRANSPORT",
            "is_public_transport": true,
            "segments": [
                {
                    "segment_id": 1,
                    "mode": "WALK",
                    "from_stop": "SMU",
                    "to_stop": "Bus Stop A",
                    "duration_mins": 5,
                    "distance_km": 0.3,
                    "segment_order": 1
                },
                {
                    "segment_id": 2,
                    "mode": "BUS",
                    "from_stop": "Bus Stop A",
                    "to_stop": "Jurong East Bus Interchange",
                    "duration_mins": 50,
                    "distance_km": 16.9,
                    "line_or_service": "66",
                    "segment_order": 2
                }
            ]
        }
    ],
    "route_payload_json":
    {
        "provider": "google-maps",
        "generated_at": "2026-03-19T03:00:00.000Z",
        "routes_found": 2
    },
    "search_status": "SELECTED",
    "updated_at": "2026-03-18T20:22:16.283Z",
    "user_id": 501,
    "selected_option_id": 2      # should be a change in this
}
```

5. get data by route id
```GET http://localhost:3010/route-cache/by-route-id?route_id=1001```

values changed:
```bash
"selected_option_id": 2
"is_locked": true
"search_status": "SELECTED"
```


6. get user history by user id
```GET http://localhost:3010/route-cache/user-history?user_id=501```  

returns:
array of routes for user 501


7. can DELETE
- requires user_id, origin & destination
```DELETE http://localhost:3010/route-cache?user_id=501&origin=SMU&destination=Jurong%20East```

result:
```bash
{
    "acknowledged": true,
    "deletedCount": 1
}
```