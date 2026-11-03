# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Each version below is one merged branch (pull request).

Previous version of the project: <https://github.com/redJoshh/DEVASC-MapQuest>.

## [Unreleased]

Branch `feature/finish-app-and-docs`.

### Added

- Route type selection: Fastest, Shortest, Walking and Bicycle buttons in the form,
  a `routeType` query parameter (validated against an allow-list, default `fastest`)
  and a **Route Type** card in the trip summary. The API now returns `route_type`.
- Backend error handling: missing API key (500), rejected API key (HTTP 401/403 → 500),
  MapQuest unreachable (502) and non-JSON MapQuest replies (502).
- Byline and tagline in the hero.
- Documentation: architecture, API reference, setup and user guides, test cases,
  a testing-results table, and decision records 001–004.
- Full README and this changelog.

## [0.8.0] - 2026-11-03

Branch `feature/swap-clear` ([#7](https://github.com/redJoshh/DEVASC-MapQuest-Act3/pull/7)).

### Added

- ⇄ button that swaps From and To without searching.
- Clear button that empties the form, clears validation errors and removes
  results and alerts (`onClear` → `App.handleClear`).

### Fixed

- Removed a duplicated header comment in `App.jsx` left by the merge-conflict
  resolution (commit `2e1d824`, pushed directly to `main`).

## [0.7.0] - 2026-11-03

Branch `feature/unit-toggle` ([#6](https://github.com/redJoshh/DEVASC-MapQuest-Act3/pull/6)).

### Added

- Miles/Kilometers switch in a units tab in the hero (default km). Switching
  re-renders only and makes no new request.

## [0.6.0] - 2026-11-03

Branch `feature/results-display` ([#5](https://github.com/redJoshh/DEVASC-MapQuest-Act3/pull/5)).

### Added

- "Route found" banner and origin → destination heading.
- Trip Duration and Distance cards and a numbered directions table.
- Miles → km conversion at render time (`units.js`, factor 1.61 as in the lab).

## [0.5.0] - 2026-11-03

Branch `feature/route-form` ([#4](https://github.com/redJoshh/DEVASC-MapQuest-Act3/pull/4)).

### Added

- `api.js` client for `/api/route`, mapping failures to warning/error alerts and
  a "Cannot reach the server" message when Flask is down.
- Route form with From/To inputs, empty-field validation and a loading state.
- Alert box for errors and warnings, and the hero and form styles.

## [0.4.0] - 2026-11-03

Branch `feature/route-api` ([#3](https://github.com/redJoshh/DEVASC-MapQuest-Act3/pull/3)).

### Added

- `GET /api/route?from=&to=`: input validation (400 / 611), a single MapQuest
  call with a timeout, 422 for non-zero MapQuest status codes, and trimmed JSON
  in miles.

## [0.3.0] - 2026-11-03

Branch `feature/frontend-scaffold` ([#2](https://github.com/redJoshh/DEVASC-MapQuest-Act3/pull/2)).

### Added

- Vite + React scaffold with ESLint, global colour/font tokens and a placeholder page.
- Vite dev proxy from `/api` to Flask on `127.0.0.1:5000`.

## [0.2.0] - 2026-11-03

Branch `feature/backend-setup` ([#1](https://github.com/redJoshh/DEVASC-MapQuest-Act3/pull/1)).

### Added

- Flask app skeleton that loads `MAPQUEST_KEY` from `backend/.env`.
- Pinned `requirements.txt` and `.env.example`.

## [0.1.0] - 2026-11-03

Repository foundation, committed directly to `main`.

### Added

- `.gitignore`, issue templates and the original lab script in `legacy/`.
- README skeleton, `CONTRIBUTING.md` and a pull request template.

[Unreleased]: https://github.com/redJoshh/DEVASC-MapQuest-Act3/compare/main...feature/finish-app-and-docs
[0.8.0]: https://github.com/redJoshh/DEVASC-MapQuest-Act3/pull/7
[0.7.0]: https://github.com/redJoshh/DEVASC-MapQuest-Act3/pull/6
[0.6.0]: https://github.com/redJoshh/DEVASC-MapQuest-Act3/pull/5
[0.5.0]: https://github.com/redJoshh/DEVASC-MapQuest-Act3/pull/4
[0.4.0]: https://github.com/redJoshh/DEVASC-MapQuest-Act3/pull/3
[0.3.0]: https://github.com/redJoshh/DEVASC-MapQuest-Act3/pull/2
[0.2.0]: https://github.com/redJoshh/DEVASC-MapQuest-Act3/pull/1
