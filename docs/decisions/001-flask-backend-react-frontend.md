# ADR 001: Flask backend with a React frontend

- **Status:** Accepted
- **Date:** 2026-11-03

## Context

The starting point was the DEVASC lab 4.9.2 script (`legacy/mapquest_parse-json_7.py`):
a command-line loop that reads two locations with `input()`, calls the MapQuest
Directions API and prints the result. It had three problems for a web version:

- The MapQuest key was hard-coded, and the script printed the full request URL,
  key included.
- Output was plain console text, metric only, with no input validation beyond
  MapQuest's own status codes.
- A browser can't safely call MapQuest directly: the key would be visible to
  every user in DevTools.

## Decision

Split the app in two:

- **Flask backend** (`backend/app.py`): one endpoint, `GET /api/route`, that
  reads the key from `backend/.env`, calls MapQuest with `requests`, keeps the
  lab's status-code logic (0 / 402 / 611) and returns a small JSON object.
- **React + Vite frontend** (`frontend/`): the form, the unit switch, the trip
  summary and the directions table, calling only our own `/api/route`.

Flask was chosen because the lab was already Python with `requests`, so its
logic carries over almost line for line. React suits a UI with several
pieces of shared state (route, alert, loading, units).

## Consequences

- The key stays on the server; the browser never sees it or the MapQuest URL.
- Two processes must run during development (see [setup-guide.md](../setup-guide.md)).
- The API contract between them is documented in [api.md](../api.md).
- Error handling can be split: Flask turns MapQuest and network failures into
  clear JSON errors, and React decides how to show them.
