# ADR 004: Remove the fuel summary

- **Status:** Accepted
- **Date:** 2026-11-03

## Context

The lab script prints a fuel figure for each trip:

```python
print("Fuel Used (Ltr): " + str("{:.2f}".format((json_data["route"]["fuelUsed"]) * 3.78)))
```

An earlier version of the web app carried this over as a fuel card in the trip
summary. It also estimated the value from the distance when MapQuest's response
didn't include `fuelUsed`.

## Decision

The fuel summary was removed from the web app. The backend no longer reads
`fuelUsed`, the API response has no fuel field, and the trip summary shows
only Route Type, Trip Duration and Distance.

Reason: [KJ: reason]

## Consequences

- `GET /api/route` returns no fuel data (see [api.md](../api.md)), and no test
  case checks for fuel.
- `legacy/mapquest_parse-json_7.py` still prints "Fuel Used (Ltr)". It is the
  unchanged lab baseline, kept for reference, and isn't part of the app.
- Bringing fuel back would mean adding a backend field and a summary card, and
  documenting where the value comes from.
