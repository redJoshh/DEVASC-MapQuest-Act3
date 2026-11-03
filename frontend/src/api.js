// Talks to our Flask backend only. The browser never calls MapQuest directly,
// so the API key never leaves the server.

// One shared message for every way the backend can be unreachable. To the
// user, "Flask isn't running" and "the proxy returned an HTML error page"
// mean the same thing and have the same fix.
const SERVER_DOWN =
  "Cannot reach the server. Make sure the backend is running.";

// Build an Error that also carries a severity level. App.jsx uses the level to
// choose the alert style, so a missing-input warning looks different from a
// real failure.
function fail(text, level = "error") {
  const err = new Error(text);
  err.level = level;
  return err;
}

export async function fetchRoute(orig, dest, routeType) {
  // URLSearchParams encodes commas and spaces in place names ("Washington, DC").
  const params = new URLSearchParams({ from: orig, to: dest, routeType });

  // A relative URL, so the Vite dev proxy forwards it to Flask. No CORS is
  // needed, and no backend host is hard-coded in the frontend.
  let res;
  try {
    res = await fetch(`/api/route?${params}`);
  } catch {
    // fetch only rejects on network failure, never on HTTP error statuses.
    throw fail(SERVER_DOWN);
  }

  // Check that the body is JSON. When Flask is stopped, the Vite proxy answers
  // with a non-JSON error page, so a parse failure also means "server down".
  let data;
  try {
    data = await res.json();
  } catch {
    throw fail(SERVER_DOWN);
  }

  if (!res.ok) {
    // 400 = missing input (warning); 422/500/502 = real errors.
    // Prefer the backend's message: it knows the actual cause (e.g. code 402).
    throw fail(
      data.error || "Something went wrong.",
      res.status === 400 ? "warning" : "error",
    );
  }
  return data;
}
