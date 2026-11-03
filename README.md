# MapQuest Directions App

ROUTE is a React + Flask web app that gives turn-by-turn directions between two
places using the MapQuest Directions API. You enter a start, a destination and a
route type. Flask calls MapQuest with a key that never leaves the server, and
React shows a trip summary and a step-by-step directions table, in miles or
kilometres.

It is a rebuild of the Cisco DEVASC lab 4.9.2 command-line script, which is kept
in [`legacy/`](legacy/mapquest_parse-json_7.py) for reference.
Previous version of this project: <https://github.com/redJoshh/DEVASC-MapQuest>.

## Features

- Directions between any two locations (MapQuest Directions API)
- Route types: **Fastest**, **Shortest**, **Walking**, **Bicycle**
- Trip summary cards (route type, trip duration, distance) and a numbered directions table
- Miles/Kilometers switch that converts instantly, without a new request
- Form validation: empty fields are highlighted and never sent
- Swap (⇄) and Clear buttons
- Clear messages for an unknown location, a missing or rejected API key, no
  internet, and a stopped backend
- The MapQuest key stays on the server (never in the browser or in the repo)
- Responsive layout down to phone width

## Setup

You need Python 3, Node.js 20.19+ (or 22.12+) and a MapQuest API key.
Full instructions, including troubleshooting: [docs/setup-guide.md](docs/setup-guide.md).

**Terminal 1: backend (port 5000)**

```bash
cd backend
python -m venv venv
source venv/Scripts/activate      # Git Bash; macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env              # then put your key after MAPQUEST_KEY=
python app.py                     # Running on http://127.0.0.1:5000
```

**Terminal 2: frontend (port 5173)**

```bash
cd frontend
npm ci
npm run dev                       # open http://localhost:5173
```

## How it works

```
Browser (React, :5173) ──/api/route──► Vite proxy ──► Flask (:5000) ──► MapQuest
                       ◄──────────── JSON in miles ◄──────────────────
```

1. **RouteForm** validates the input and calls `fetchRoute()` in `src/api.js`.
2. The request goes to `/api/route` on the Vite dev server, which proxies it to
   Flask on `127.0.0.1:5000`, so no CORS setup is needed.
3. **Flask** checks the input, the route type and the key, calls MapQuest with a
   10-second timeout, and turns every failure into a JSON error with the right
   HTTP status.
4. On success it returns only what the UI needs, with distances in miles.
5. **React** shows the results and converts to kilometres (× 1.61, as in the
   lab) when rendering, so the unit switch makes no new request.

Details: [docs/architecture.md](docs/architecture.md) · API contract: [docs/api.md](docs/api.md)

### Sample request

`GET /api/route?from=Washington, DC&to=Baltimore, MD&routeType=fastest`

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

`routeType` is optional (default `fastest`); any value other than `fastest`,
`shortest`, `pedestrian` or `bicycle` returns HTTP 400.

## Lab vs this version

| Lab (CLI)                      | This app                                              |
| ------------------------------ | ----------------------------------------------------- |
| `input()` prompts              | Web form with validation                              |
| Printed URL with the key in it | Key hidden on the server                              |
| Metric only                    | Miles/km switch                                       |
| Fastest route only             | Fastest, shortest, walking and bicycle                |
| Printed lines                  | Summary cards and a table                             |
| 402/611 messages               | Same codes, plus bad-key, no-internet and server-down messages |

## Project structure

| Path | Purpose |
| ---- | ------- |
| `backend/app.py` | Flask app: `GET /api/route`, validation and error handling |
| `backend/requirements.txt` | Pinned Python dependencies |
| `backend/.env.example` | Template for `MAPQUEST_KEY` (copy to `.env`, never commit `.env`) |
| `frontend/vite.config.js` | Vite + React plugin, `/api` proxy to `127.0.0.1:5000` |
| `frontend/src/main.jsx` | React entry point |
| `frontend/src/App.jsx` | Top-level state (route, alert, loading, units) and layout |
| `frontend/src/api.js` | Calls the backend and turns failures into messages |
| `frontend/src/units.js` | Miles → km conversion and formatting |
| `frontend/src/routeTypes.js` | Route type values and labels |
| `frontend/src/components/` | `RouteForm`, `UnitToggle`, `TripSummary`, `DirectionsTable` |
| `frontend/src/App.css`, `index.css` | Component styles; colour/font tokens |
| `legacy/` | Original lab script (reference only, not used by the app) |
| `docs/` | Architecture, API, decisions, guides and tests |

## Documentation

- [Setup guide](docs/setup-guide.md): installing, running, testing key errors, troubleshooting
- [User guide](docs/user-guide.md): using the app and what each message means
- [Architecture](docs/architecture.md): request flow, component tree, folder structure
- [API reference](docs/api.md): `GET /api/route`, every status code and body, curl examples
- [Test cases](docs/test-cases.md) and [testing results](docs/testing-results.md)
- Architecture decision records:
  - [001: Flask backend with a React frontend](docs/decisions/001-flask-backend-react-frontend.md)
  - [002: Vite dev proxy for /api](docs/decisions/002-vite-proxy.md)
  - [003: Convert units on the frontend](docs/decisions/003-conversion-on-frontend.md)
  - [004: Remove the fuel summary](docs/decisions/004-remove-fuel-summary.md)
- [Contributing](CONTRIBUTING.md): branches, commit messages, pull requests
- [Changelog](CHANGELOG.md)

## Backlog

Ideas not yet built (open a **Feature** issue to pick one up):

- Add the missing `frontend/public/favicon.svg` (`index.html` already links it, so browsers get a 404).
- Automated tests: `pytest` for `/api/route` with a mocked MapQuest, and Vitest + React Testing Library for the form.
- GitHub Actions workflow running `npm run lint`, the frontend build and the backend tests on every PR.
- Production setup: serve the built frontend and `/api` from one origin (e.g. Gunicorn behind a web server) with `debug=False`.
- Remember the chosen unit and route type between visits.
- Show the route on a map (MapQuest static map or a JS map library).
- Replace the Vite template text in `frontend/README.md` with project-specific notes.
