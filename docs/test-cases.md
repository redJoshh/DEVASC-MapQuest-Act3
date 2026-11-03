# Test cases

Manual test cases for the web app. Run them with both servers started (see
[setup-guide.md](setup-guide.md)) and record results in
[testing-results.md](testing-results.md). Numbers like `66 km` are approximate,
because MapQuest's data changes over time.

Test Cases 2 and 3 are the ones referenced in the code comments
(`UnitToggle.jsx`, `RouteForm.jsx`).

---

## TC1: Valid route

| | |
|---|---|
| **Steps** | From `Washington, DC`, To `Baltimore, MD`, route type Fastest, click Get Directions |
| **Expected** | The button shows "Loading..." and is disabled, then: "ROUTE FOUND", heading `Washington, DC → Baltimore, MD`, cards **Route Type: Fastest**, **Trip Duration** (HH:MM:SS) and **Distance** (in km), and a table with steps 01, 02, … each with a km distance. |

## TC2: Unit toggle (distances only)

| | |
|---|---|
| **Steps** | After TC1, click **Miles**, then **Kilometers**. Watch the Network tab in DevTools. |
| **Expected** | Only the distances change: the Distance card and every table row switch between `mi` and `km` (km = mi × 1.61, 2 decimals). Route Type, Trip Duration and the step texts stay the same. **No new `/api/route` request** is made. |

## TC3: Empty fields

| | |
|---|---|
| **Steps** | a) Click Get Directions with both fields empty. b) Fill only From and submit. c) Type a single space in To and submit. |
| **Expected** | The empty field(s) get a red underline and "Please fill in both locations." appears. **No `/api/route` request** in the Network tab. Typing in a field removes its red underline. |

## TC4: Location not found

| | |
|---|---|
| **Steps** | From `Washington, DC`, To `Beijing, China`, Get Directions |
| **Expected** | Red alert: "One or both locations could not be found. Try adding the city and state or country." No results. (API: 422, statuscode 402.) |

## TC5: Route type

| | |
|---|---|
| **Steps** | Same From/To as TC1. Search once with each of **Fastest**, **Shortest**, **Walking**, **Bicycle**. |
| **Expected** | The clicked button is underlined. The results show exactly three cards (**Route Type**, **Trip Duration**, **Distance**), and Route Type shows the chosen label. Walking and Bicycle take much longer than driving. There is no other summary card. |

## TC6: Swap and Clear

| | |
|---|---|
| **Steps** | a) Fill From and To, click **⇄**. b) Search, pick Bicycle, then click **Clear**. c) Trigger TC3's red underlines, then click **Clear**. |
| **Expected** | a) The values swap and no request is sent. b) Both fields empty, route type back to **Fastest**, results gone. c) Red underlines and the message disappear. |

## TC7: Backend not running

| | |
|---|---|
| **Steps** | Stop Flask (Ctrl+C in terminal 1), then search TC1's route. |
| **Expected** | Red alert: "Cannot reach the server. Make sure the backend is running." The button becomes clickable again. |

## TC8: Rejected API key

| | |
|---|---|
| **Steps** | Restart Flask with a fake key (`MAPQUEST_KEY=not-a-real-key python app.py`, see setup guide). Search TC1's route. |
| **Expected** | Red alert: "MapQuest rejected the API key. Check MAPQUEST_KEY in backend/.env." (API: 500.) |

## TC9: Missing API key

| | |
|---|---|
| **Steps** | Restart Flask from Git Bash with `MAPQUEST_KEY= python app.py`. Search TC1's route. |
| **Expected** | Red alert: "Server is missing the MapQuest API key (check backend/.env)." (API: 500.) |

## TC10: API validation (curl)

| | |
|---|---|
| **Steps** | Run the curl examples in [api.md](api.md#curl-examples). |
| **Expected** | Baltimore → 200 with `route_type: "fastest"`; `routeType=bicycle` → 200 with `route_type: "bicycle"`; Beijing → 422 / 402; empty `to` → 400 / 611; `routeType=boat` → 400 "Invalid route type…". |

## TC11: Responsive layout

| | |
|---|---|
| **Steps** | Resize the window, or use DevTools device mode, to about 1200 px, 800 px and 400 px wide. |
| **Expected** | ~1200 px: the units tab loses its ↕ icon. Below 900 px: the hero stacks (wordmark, tagline, form, units tab). Below 600 px: the fields stack, ⇄ rotates to point up/down, and the table scrolls sideways inside its box, never the whole page. |
