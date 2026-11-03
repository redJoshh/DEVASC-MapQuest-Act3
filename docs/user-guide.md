# User guide

ROUTE gives turn-by-turn directions between two places.

## Getting directions

1. Type a start in **From** and a destination in **To**. Adding the state or
   country helps, e.g. `Washington, DC` and `Baltimore, MD`.
2. Pick a route type under the fields:

   | Button   | Meaning                                 |
   | -------- | --------------------------------------- |
   | Fastest  | Quickest driving route (default)        |
   | Shortest | Shortest driving distance               |
   | Walking  | Pedestrian route                        |
   | Bicycle  | Cycling route                           |

3. Click **Get Directions →**. The button shows **Loading...** while the route
   is fetched.

Below the hero you'll then see:

- **ROUTE FOUND** and a heading `From → To`
- three cards: **Route Type**, **Trip Duration** (HH:MM:SS) and **Distance**
- a numbered table with every step and its distance

## Other controls

| Control                  | What it does |
| ------------------------ | ------------ |
| **⇄** (between fields)   | Swaps From and To. It doesn't search; click Get Directions when ready. |
| **Clear**                | Empties both fields, resets the route type to Fastest and removes the results and any message. |
| **Units: Miles / Kilometers** (bottom-right tab) | Switches every distance on the page instantly. Kilometers is the default. No new search is made. |

## Messages

| Message | Meaning |
| ------- | ------- |
| Red underline + "Please fill in both locations." | A field is empty (or only spaces). Nothing was sent. |
| "One or both locations could not be found…" | MapQuest couldn't route between them (e.g. no road connection). Add the city and state or country. |
| "Invalid route type…" | Only possible when calling the API directly with an unknown `routeType`. |
| "Cannot reach the server. Make sure the backend is running." | The Flask backend isn't running. |
| "Could not reach MapQuest. Check your internet connection." | The backend is running but can't reach MapQuest. |
| "Server is missing the MapQuest API key…" / "MapQuest rejected the API key…" | The server's key is missing or invalid; see [setup-guide.md](setup-guide.md). |

Warnings you can fix yourself (missing input) are shown in amber; other problems are red.
