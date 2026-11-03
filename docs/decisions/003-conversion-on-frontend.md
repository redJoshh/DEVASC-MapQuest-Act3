# ADR 003: Convert units on the frontend

- **Status:** Accepted
- **Date:** 2026-11-03

## Context

MapQuest returns distances in miles by default. The lab converted every value
to kilometres with a factor of 1.61 and printed metric only. The web app lets
the user switch between Miles and Kilometers (Test Case 2).

The conversion could happen in two places:

1. The backend converts (or passes `unit=k` to MapQuest), so every unit switch
   is a new request.
2. The backend always sends miles, and the frontend converts when rendering.

## Decision

Option 2. Flask returns `distance_miles` for the trip and for each maneuver.
`frontend/src/units.js` converts at render time:

```js
export const KM_PER_MILE = 1.61;
export const formatDistance = (miles, metric) =>
  metric ? `${(miles * KM_PER_MILE).toFixed(2)} km` : `${miles.toFixed(2)} mi`;
```

`1.61` and two decimals were kept from the lab so the numbers match its output.

## Consequences

- Switching units is instant and makes no request, so it costs no MapQuest
  quota and can't fail.
- The API stays simple: one unit, with field names that say which (`*_miles`).
- The unit is chosen in one place (`metric` state in `App.jsx`), and both
  TripSummary and DirectionsTable read the same flag, so they always agree.
- 1.61 is slightly larger than the exact 1.609344 (an error of about 0.04%).
  That's acceptable for directions and keeps parity with the lab.
