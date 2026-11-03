import { useState } from "react";
import { fetchRoute } from "./api";
import RouteForm from "./components/RouteForm";
import "./App.css";

// Top-level state: the current route, any alert message and a loading flag.
// It lives here, not in the form, because the results area needs it too.
export default function App() {
  const [route, setRoute] = useState(null);
  const [alert, setAlert] = useState(null); // { text, level: 'error' | 'warning' }
  const [loading, setLoading] = useState(false);

  async function handleSearch(orig, dest) {
    // Reset first, so an old route or error never shows next to a new search.
    setAlert(null);
    setRoute(null);
    setLoading(true);
    try {
      setRoute(await fetchRoute(orig, dest));
    } catch (err) {
      // api.js already turned every failure into a user-facing message and level.
      setAlert({ text: err.message, level: err.level || "error" });
    } finally {
      // finally: the button must re-enable on success and on failure alike.
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <section className="hero">
        <header className="masthead">
          <h1 className="wordmark">ROUTE</h1>
        </header>

        <div className="hero-panel">
          <RouteForm loading={loading} onSearch={handleSearch} />
        </div>
      </section>

      {/* Render the results area only when there is something to show, so an
          empty page has no blank padded section under the hero. */}
      {(alert || route) && (
        <section className="results">
          {alert && (
            // role="alert" makes screen readers announce the message right away.
            <div className={`alert ${alert.level}`} role="alert">
              {alert.text}
            </div>
          )}

          {/* Temporary: proves the round trip works. Replaced by the trip
              summary and directions table in the results-display branch. */}
          {route && (
            <p>
              Route found: {route.origin} &rarr; {route.destination}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
