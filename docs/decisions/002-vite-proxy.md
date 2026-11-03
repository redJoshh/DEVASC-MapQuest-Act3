# ADR 002: Use the Vite dev proxy for /api

- **Status:** Accepted
- **Date:** 2026-11-03

## Context

In development, React is served by Vite on port 5173 and Flask runs on port 5000.
A page loaded from `localhost:5173` that calls `localhost:5000` directly is a
cross-origin request, which needs CORS headers on Flask (for example the
`flask-cors` package) and a backend URL hard-coded or configured in the frontend.

## Decision

Use Vite's built-in proxy in `frontend/vite.config.js`:

```js
server: {
  proxy: {
    "/api": "http://127.0.0.1:5000",
  },
},
```

The frontend calls the relative URL `/api/route`, and Vite forwards it to Flask.
The target is `127.0.0.1`, not `localhost`: newer Node versions may resolve
`localhost` to IPv6 (`::1`) while Flask only listens on IPv4, which makes the
proxy fail with no clear error.

## Consequences

- No CORS configuration and no extra Python dependency.
- No backend host in the frontend code. `src/api.js` only knows `/api/route`.
- When Flask is not running, the proxy answers with its own non-JSON error
  page. `api.js` treats a non-JSON reply as "Cannot reach the server", so the
  user still gets a clear message.
- The proxy only exists in `npm run dev`. A production deployment would need
  the same `/api` routing from its web server (see the README backlog).
