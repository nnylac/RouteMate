running on port 3005

1. test service
```GET http://localhost:3005/maps/routes?origin=Tampines MRT&destination=Orchard MRT```

returns all available route options between origin and destination, with segments broken down by mode (WALKING, TRANSIT). Each TRANSIT segment includes the line, boarding stop, alighting stop, duration, and distance.

example:
```bash
{
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
          "segment_order": 1
        },
        {
          "mode": "TRANSIT",
          "from_stop": "Tampines",
          "to_stop": "City Hall",
          "duration_mins": 24,
          "distance_km": 15.75,
          "line_or_service": "EW",
          "segment_order": 2
        },
        {
          "mode": "WALKING",
          "from_stop": null,
          "to_stop": null,
          "duration_mins": 1,
          "distance_km": 0.01,
          "line_or_service": null,
          "segment_order": 3
        },
        {
          "mode": "TRANSIT",
          "from_stop": "City Hall",
          "to_stop": "Orchard",
          "duration_mins": 5,
          "distance_km": 2.87,
          "line_or_service": "NS",
          "segment_order": 4
        },
        {
          "mode": "WALKING",
          "from_stop": null,
          "to_stop": null,
          "duration_mins": 1,
          "distance_km": 0.28,
          "line_or_service": null,
          "segment_order": 5
        }
      ]
    }
  ]
}
```

notes:
- number of options returned varies depending on origin and destination (Google Maps decides)
- `main_mode` will be `SUBWAY`, `BUS`, or `WALKING`
- `line_or_service` for MRT is the line code e.g. `EW`, `NS`, `DT`, `TE`
- `line_or_service` for bus is the bus number e.g. `65`, `129`, `518`
- requires `GOOGLE_MAPS_API_KEY` in root `.env`