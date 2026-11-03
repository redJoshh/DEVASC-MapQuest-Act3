# Architecture

ROUTE has two parts that run side by side during development:

| Part     | Tech            | Port | Entry point               |
| -------- | --------------- | ---- | ------------------------- |
| Backend  | Flask (Python)  | 5000 | `backend/app.py`          |
| Frontend | React 19 + Vite | 5173 | `frontend/src/main.jsx`   |

The browser only ever talks to the Vite dev server. Vite forwards every `/api`
request to Flask, and only Flask talks to MapQuest. This keeps the MapQuest key
on the server (see [ADR 001](decisions/001-flask-backend-react-frontend.md) and
[ADR 002](decisions/002-vite-proxy.md)).

## Request flow

```
Browser (React)                Vite dev server            Flask (backend/app.py)          MapQuest
---------------                ---------------            ----------------------          --------
RouteForm submit
  │ empty field? ─► red border + message, nothing sent
  ▼
App.handleSearch(orig, dest, routeType)
  ▼
api.fetchRoute()
  GET /api/route?from=..&to=..&routeType=..
  ─────────────────────────────►  proxy /api ──────────►  get_route()
                                  (127.0.0.1:5000)          validate from/to       (400, 611)
                                                            validate routeType     (400)
                                                            check MAPQUEST_KEY     (500)
                                                            requests.get(timeout=10) ──────► /directions/v2/route
                                                              network error        (502)  ◄──
                                                              HTTP 401/403         (500)
                                                              not JSON             (502)
                                                              info.statuscode != 0 (422)
                                                            trim to UI fields      (200)
  ◄─────────────────────────────  ◄──────────────────────  JSON in miles
  fetch failed / not JSON ─► "Cannot reach the server"
  !res.ok ─► alert (400 = warning, else error)
  ▼
App state: route ─► TripSummary + DirectionsTable
           metric ─► formatDistance() converts miles → km at render time
```

Key points:

- **Validation happens twice.** RouteForm blocks empty fields instantly, and
  Flask checks again (code 611), because a client-side check can be bypassed.
- **Flask always returns JSON**, including for every error, so the frontend can
  always read `response.error`. The full contract is in [api.md](api.md).
- **Units are converted in the browser.** Flask sends miles only; switching
  Miles/Kilometers re-renders without a new request
  ([ADR 003](decisions/003-conversion-on-frontend.md)).

## Component tree

```
main.jsx                      mounts <App/> in StrictMode, loads index.css
└── App.jsx                   state: route, alert, loading, metric
    ├── section.hero
    │   ├── header.masthead   ROUTE wordmark + byline
    │   ├── p.tagline
    │   ├── div.hero-panel
    │   │   └── RouteForm     state: orig, dest, routeType, fieldError
    │   │                     From/To inputs, ⇄ swap, route type buttons,
    │   │                     Clear, Get Directions
    │   └── aside.hero-tab
    │       └── UnitToggle    Miles / Kilometers (controlled by App)
    └── section.results       only rendered when there is an alert or a route
        ├── div.alert         error or warning message
        ├── div.results-header  "Route found" + origin → destination
        ├── TripSummary       Route Type, Trip Duration, Distance cards
        └── DirectionsTable   numbered maneuvers with distances
```

Shared helpers:

| File                   | Used by                      | Purpose                                     |
| ---------------------- | ---------------------------- | ------------------------------------------- |
| `src/api.js`           | App                          | `fetchRoute()` and error-to-message mapping |
| `src/units.js`         | TripSummary, DirectionsTable | `KM_PER_MILE = 1.61`, `formatDistance()`    |
| `src/routeTypes.js`    | RouteForm, TripSummary       | route type values, labels, default          |

## Folder structure

```
.
├── backend/
│   ├── app.py                 Flask app and GET /api/route
│   ├── requirements.txt       pinned Python dependencies
│   └── .env.example           template for MAPQUEST_KEY (copy to .env)
├── frontend/
│   ├── index.html             Vite entry page
│   ├── vite.config.js         React plugin + /api proxy to 127.0.0.1:5000
│   ├── eslint.config.js
│   ├── package.json / package-lock.json
│   └── src/
│       ├── main.jsx           React root
│       ├── App.jsx            top-level state and layout
│       ├── App.css            component styles
│       ├── index.css          colour/font tokens and reset
│       ├── api.js             backend client
│       ├── units.js           unit conversion
│       ├── routeTypes.js      route type list
│       └── components/
│           ├── RouteForm.jsx
│           ├── UnitToggle.jsx
│           ├── TripSummary.jsx
│           └── DirectionsTable.jsx
├── legacy/
│   └── mapquest_parse-json_7.py   original DEVASC lab CLI script (reference only)
├── docs/                      this documentation
├── .github/                   issue templates and PR template
├── CONTRIBUTING.md
├── CHANGELOG.md
└── README.md
```

`legacy/` is not used by the app. It is the lab's final script, kept unchanged
(except that the key comes from the environment) to show where the project started.
It still prints a fuel figure; the web app does not
([ADR 004](decisions/004-remove-fuel-summary.md)).
