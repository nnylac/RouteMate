running on port 3013

1. get arrival timing for a specific line and stop
```GET http://localhost:3013/arrival-timing?line=EW&stop=Tampines&mode=SUBWAY```

query params:
- `line` — MRT line code (e.g. `EW`, `NS`, `DT`, `TE`) or bus number (e.g. `65`, `129`)
- `stop` — stop name
- `mode` — `SUBWAY` for MRT/LRT, `BUS` for bus

returns:
```bash
{
  "line": "EW",
  "stop": "Tampines",
  "mode": "SUBWAY",
  "predicted_arrival_mins": 3,
  "source": "mock"
}
```

notes:
- arrival times are mocked (no live API)
- MRT/Rail (`SUBWAY`, `RAIL`, `TRAM`): returns random value between 2-6 mins
- Bus: returns random value between 3-12 mins
- always returns a value — never throws an error for unknown stops

example requests:
```GET http://localhost:3013/arrival-timing?line=EW&stop=Tampines&mode=SUBWAY```
```GET http://localhost:3013/arrival-timing?line=NS&stop=Orchard&mode=SUBWAY```
```GET http://localhost:3013/arrival-timing?line=129&stop=Opp Tampines Stn/Int&mode=BUS```