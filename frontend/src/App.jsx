import { useState } from "react";
import { fetchRoute } from "./api";
import RouteForm from "./components/RouteForm";
import TripSummary from "./components/TripSummary";
import DirectionsTable from "./components/DirectionsTable";
import "./App.css";

// Top-level state: the current route, any alert message and a loading flag.
// It lives here, not in the form, because the results area needs it too.
export default function App() {
  const [route, setRoute] = useState(null);
  const [alert, setAlert] = useState(null); // { text, level: 'error' | 'warning' }
  const [loading, setLoading] = useState(false);
  // Fixed to kilometres for now, matching the lab's metric-only output.
  // The unit-toggle branch turns this into state the user can change.
  const metric = true; // true = km, false = miles

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

          {/* Both components get the same metric flag, so the summary and
              the table always show the same unit. */}
          {route && (
            <>
              <div className="results-header">
                <span className="eyebrow success">Route found</span>
                {/* Echo the places the backend actually routed, so the user
                    can see what was searched. */}
                <h2>
                  {route.origin} <span className="arrow">&rarr;</span>{" "}
                  {route.destination}
                </h2>
              </div>
              <TripSummary route={route} metric={metric} />
              <DirectionsTable maneuvers={route.maneuvers} metric={metric} />
            </>
          )}
        </section>
      )}
    </div>
  );
}
