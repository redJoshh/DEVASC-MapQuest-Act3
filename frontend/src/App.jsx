import { useState } from "react";
import { fetchRoute } from "./api";
import RouteForm from "./components/RouteForm";
import UnitToggle from "./components/UnitToggle";
import TripSummary from "./components/TripSummary";
import DirectionsTable from "./components/DirectionsTable";
import "./App.css";

// Top-level state: the current route, any alert message, loading flag, and units.
// It lives here, not in the form, because the results area reads it and the
// form's Clear button must be able to reset it.
export default function App() {
  const [route, setRoute] = useState(null);
  const [alert, setAlert] = useState(null); // { text, level: 'error' | 'warning' }
  const [loading, setLoading] = useState(false);
  // Units are display-only state: switching re-renders the converted numbers
  // and never triggers a new request. Defaults to km, like the lab's output.
  const [metric, setMetric] = useState(true); // true = km, false = miles

  async function handleSearch(orig, dest, routeType) {
    // Reset first, so an old route or error never shows next to a new search.
    setAlert(null);
    setRoute(null);
    setLoading(true);
    try {
      setRoute(await fetchRoute(orig, dest, routeType));
    } catch (err) {
      // api.js already turned every failure into a user-facing message and level.
      setAlert({ text: err.message, level: err.level || "error" });
    } finally {
      // finally: the button must re-enable on success and on failure alike.
      setLoading(false);
    }
  }

  // Called by the form's Clear button: remove the old results and any alert,
  // so the page goes back to its empty starting state.
  function handleClear() {
    setRoute(null);
    setAlert(null);
  }

  return (
    <div className="page">
      <section className="hero">
        <header className="masthead">
          <h1 className="wordmark">ROUTE</h1>
          <p className="byline">by: Atienza, Cabillo, Mortiz, Naguimbing</p>
        </header>

        {/* <br /> fixes where the line breaks, so the two-line tagline
            reads the same at every width. */}
        <p className="tagline">
          Find the way from where you are
          <br />
          to wherever you&rsquo;re headed.
        </p>

        <div className="hero-panel">
          <RouteForm
            loading={loading}
            onSearch={handleSearch}
            onClear={handleClear}
          />
        </div>

        {/* The unit switch sits in the hero, not in the results, so it can be
            set before searching and stays in the same place on every search. */}
        <aside className="hero-tab">
          <span className="tab-icon" aria-hidden="true">
            &#8597;
          </span>
          <div>
            <span className="tab-title">Units</span>
            <UnitToggle metric={metric} onChange={setMetric} />
          </div>
        </aside>
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
