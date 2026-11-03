"""
MapQuest Directions API wrapper (Flask).

GET /api/route?from=<start>&to=<destination>&routeType=<fastest|shortest|pedestrian|bicycle>

Keeps the lab's logic (statuscode 0 / 402 / 611 checks, maneuvers list) but
returns JSON for the React frontend instead of printing to the console.
The API key stays on the server and is never sent to the browser, which is
also why we no longer print the request URL like the lab did (it contained the key).
"""
import os
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv

# Read backend/.env into the environment before anything looks up the key.
# This lets each developer keep their own key locally, while .gitignore keeps
# it out of the repo. Only .env.example (with an empty value) is committed.
load_dotenv()
app = Flask(__name__)

# The same Directions endpoint the lab used. It lives here, in one place, so
# the browser never needs to know it: React talks only to our Flask API.
MAIN_API = 'https://www.mapquestapi.com/directions/v2/route'

# Read once at startup. It may be None if .env is missing. We don't crash here,
# so the server still starts and get_route() can return a clear error message
# instead of a stack trace.
KEY = os.getenv('MAPQUEST_KEY')

# Route types MapQuest supports.
# An allow-list: only these values are forwarded, so a typo or a crafted value
# gets a clear 400 from us instead of an unclear error from MapQuest.
ROUTE_TYPES = ('fastest', 'shortest', 'pedestrian', 'bicycle')

# The lab handled 402 and 611 explicitly; everything else gets a generic message.
# The wording is friendlier than the lab's console text because it is shown
# directly to users in the browser.
ERROR_MESSAGES = {
    402: 'One or both locations could not be found. Try adding the city and state or country.',
    611: 'Please enter both a starting location and a destination.',
}


@app.get('/api/route')
def get_route():
    # strip() so that input made only of spaces counts as empty, just like a
    # blank field, instead of being sent to MapQuest as a "location".
    orig = request.args.get('from', '').strip()
    dest = request.args.get('to', '').strip()
    # Optional, and case-insensitive. `or 'fastest'` also covers an empty
    # ?routeType= so old clients that never send it keep working.
    route_type = request.args.get('routeType', 'fastest').strip().lower() or 'fastest'

    # Missing input: stop before calling MapQuest at all (same idea as lab code 611).
    # This saves an API call and quota, and 400 tells the client that the
    # problem is in its request, not on the server.
    if not orig or not dest:
        return jsonify(error=ERROR_MESSAGES[611], statuscode=611), 400

    if route_type not in ROUTE_TYPES:
        return jsonify(error=f'Invalid route type. Choose one of: {", ".join(ROUTE_TYPES)}.'), 400

    # A server setup problem, not the user's fault: 500, and a message that
    # says where to fix it. Checked before calling MapQuest, which would only
    # answer with a vaguer error.
    if not KEY:
        return jsonify(error='Server is missing the MapQuest API key (check backend/.env).'), 500

    try:
        # One request only. The lab called requests.get twice for the same URL.
        # A timeout keeps a slow MapQuest from hanging this worker forever.
        resp = requests.get(
            MAIN_API,
            # requests URL-encodes this, so commas and spaces in place names are
            # safe, and the key never appears in a URL we build or log ourselves.
            params={'key': KEY, 'from': orig, 'to': dest, 'routeType': route_type},
            timeout=10,
        )
    except requests.RequestException:
        # DNS failure, no internet, timeout: an upstream problem, so 502 Bad
        # Gateway, not a crash with Flask's HTML error page.
        return jsonify(error='Could not reach MapQuest. Check your internet connection.'), 502

    # A wrong or unapproved key comes back as HTTP 401/403 with plain text, not JSON.
    # Without this check it would be misreported as "could not reach MapQuest".
    if resp.status_code in (401, 403):
        return jsonify(error='MapQuest rejected the API key. Check MAPQUEST_KEY in backend/.env.'), 500

    # Any other non-JSON reply (an outage page, a proxy error) still gets a
    # JSON error, so the frontend can always read response.error.
    try:
        data = resp.json()
    except ValueError:
        return jsonify(error=f'MapQuest sent an unexpected response (HTTP {resp.status_code}).'), 502

    # MapQuest reports problems inside the JSON body (often with HTTP 200), so
    # info.statuscode, not the HTTP status, tells us whether a route was found.
    status = data.get('info', {}).get('statuscode')
    if status != 0:
        msg = ERROR_MESSAGES.get(status, f'MapQuest returned status code {status}.')
        # 422: the request was well-formed, but MapQuest could not route it
        # (e.g. 402 unknown location). The frontend uses this to show an error.
        return jsonify(error=msg, statuscode=status), 422

    route = data['route']
    # Send raw imperial values (MapQuest's default). The frontend converts them,
    # so the miles/km toggle works instantly with no new request.
    # Only the fields the UI needs are returned, keeping the response small and
    # independent of MapQuest's much larger format.
    return jsonify(
        origin=orig,
        destination=dest,
        # Echoed back so the UI shows the type that was actually used
        # (including the 'fastest' default).
        route_type=route_type,
        duration=route.get('formattedTime', 'N/A'),
        distance_miles=route.get('distance', 0),
        maneuvers=[
            {'narrative': m['narrative'], 'distance_miles': m['distance']}
            for m in route['legs'][0]['maneuvers']
        ],
    )


if __name__ == '__main__':
    # Port 5000 is what the Vite dev proxy forwards /api requests to.
    # debug=True gives auto-reload and readable tracebacks during development.
    # It must never be enabled in production.
    app.run(debug=True, port=5000)
