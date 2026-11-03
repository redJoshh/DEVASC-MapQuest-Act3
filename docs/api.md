# API reference

The backend exposes one endpoint. During development the frontend reaches it
through the Vite proxy (`http://localhost:5173/api/...`). You can also call
Flask directly on `http://127.0.0.1:5000`.

## GET /api/route

Returns driving, walking or cycling directions between two places, using the
MapQuest Directions API. The MapQuest key is added by the server and never
appears in the request or response.

### Query parameters

| Name        | Required | Default   | Description                                                        |
| ----------- | -------- | --------- | ------------------------------------------------------------------ |
| `from`      | yes      | –         | Start location, e.g. `Washington, DC`. Leading/trailing spaces are removed. |
| `to`        | yes      | –         | Destination, e.g. `Baltimore, MD`. Leading/trailing spaces are removed.     |
| `routeType` | no       | `fastest` | One of `fastest`, `shortest`, `pedestrian`, `bicycle`. Case-insensitive; empty counts as `fastest`. |

Route types and their labels in the UI:

| `routeType`  | UI label |
| ------------ | -------- |
| `fastest`    | Fastest  |
| `shortest`   | Shortest |
| `pedestrian` | Walking  |
| `bicycle`    | Bicycle  |

### Responses

All responses, including errors, are JSON. Distances are always in **miles**;
the frontend converts them to kilometres (× 1.61) for display.

| HTTP | When | Body |
| ---- | ---- | ---- |
| 200 | Route found | `{origin, destination, route_type, duration, distance_miles, maneuvers[]}` |
| 400 | `from` or `to` is missing or blank | `{"error": "Please enter both a starting location and a destination.", "statuscode": 611}` |
| 400 | `routeType` is not one of the four values | `{"error": "Invalid route type. Choose one of: fastest, shortest, pedestrian, bicycle."}` |
| 422 | MapQuest could not route it: location not found (402) | `{"error": "One or both locations could not be found. Try adding the city and state or country.", "statuscode": 402}` |
| 422 | Any other non-zero MapQuest `info.statuscode` | `{"error": "MapQuest returned status code <code>.", "statuscode": <code>}` |
| 500 | `MAPQUEST_KEY` is not set on the server | `{"error": "Server is missing the MapQuest API key (check backend/.env)."}` |
| 500 | MapQuest rejected the key (HTTP 401/403) | `{"error": "MapQuest rejected the API key. Check MAPQUEST_KEY in backend/.env."}` |
| 502 | MapQuest unreachable (no internet, DNS, 10 s timeout) | `{"error": "Could not reach MapQuest. Check your internet connection."}` |
| 502 | MapQuest replied with something that is not JSON | `{"error": "MapQuest sent an unexpected response (HTTP <status>)."}` |

Checks run in this order, and the first failure is returned: missing input →
route type → missing key → network → rejected key → non-JSON → MapQuest status.
Any other path, e.g. `/api/unknown`, gets Flask's default 404 page.

How the frontend shows these (`src/api.js`):

- **400** → yellow **warning** alert (the user can fix the input).
- **422, 500, 502** → red **error** alert, using the `error` text.
- The request itself fails, or the reply is not JSON (Flask not running, so
  the Vite proxy returns its own error page) → red alert *"Cannot reach the
  server. Make sure the backend is running."*

### Success body

```json
{
  "origin": "Washington, DC",
  "destination": "Baltimore, MD",
  "route_type": "fastest",
  "duration": "00:51:05",
  "distance_miles": 46.3475,
  "maneuvers": [
    { "narrative": "Head toward Madison Dr NW on 14th St NW (US-1). Go for 0.1 mi.", "distance_miles": 0.1187 },
    { "narrative": "Turn right onto Constitution Ave NW (US-1/US-50). Go for 0.4 mi.", "distance_miles": 0.43 }
  ]
}
```

| Field            | Type   | Notes                                                    |
| ---------------- | ------ | -------------------------------------------------------- |
| `origin`         | string | The trimmed `from` value                                 |
| `destination`    | string | The trimmed `to` value                                   |
| `route_type`     | string | The route type actually used (lower-case)                |
| `duration`       | string | MapQuest `formattedTime`, `HH:MM:SS`; `"N/A"` if absent  |
| `distance_miles` | number | Total distance in miles; `0` if absent                   |
| `maneuvers`      | array  | Each step: `narrative` (string), `distance_miles` (number) |

Exact numbers change as MapQuest updates its map data.

### curl examples

Run these with Flask started (`python app.py` in `backend/`). Quote the URL so
the shell doesn't interpret `&`.

```bash
# 200: route found
curl -i "http://127.0.0.1:5000/api/route?from=Washington,%20DC&to=Baltimore,%20MD"

# 200: bicycle route (route_type is echoed back)
curl -i "http://127.0.0.1:5000/api/route?from=Washington,%20DC&to=Baltimore,%20MD&routeType=bicycle"

# 422 / 402: a location MapQuest can't route to by road
curl -i "http://127.0.0.1:5000/api/route?from=Washington,%20DC&to=Beijing,%20China"

# 400 / 611: empty destination
curl -i "http://127.0.0.1:5000/api/route?from=Washington,%20DC&to="

# 400: invalid route type
curl -i "http://127.0.0.1:5000/api/route?from=Washington,%20DC&to=Baltimore,%20MD&routeType=boat"
```

Through the proxy, replace `http://127.0.0.1:5000` with `http://localhost:5173`.

To test the key errors without editing or showing `.env`, see
[setup-guide.md → Testing the API-key errors](setup-guide.md#testing-the-api-key-errors).
