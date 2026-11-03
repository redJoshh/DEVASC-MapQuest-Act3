import { useState } from "react";
import { ROUTE_TYPES, DEFAULT_ROUTE_TYPE } from "../routeTypes";

// Start/destination inputs with empty-field validation (Test Case 3),
// a route type picker, plus swap and clear buttons.
// Validating here, before any request, gives instant feedback and saves a
// round trip. The backend still checks too (code 611), because a client-side
// check can always be bypassed.
export default function RouteForm({ loading, onSearch, onClear }) {
  // Controlled inputs: React state is the single source of truth, so the
  // values can be validated, trimmed, swapped and cleared.
  const [orig, setOrig] = useState("");
  const [dest, setDest] = useState("");
  // Kept in the form because it's part of what is being submitted, like the
  // two locations.
  const [routeType, setRouteType] = useState(DEFAULT_ROUTE_TYPE);
  // One flag per field, so only the empty field gets the red border.
  const [fieldError, setFieldError] = useState({ orig: false, dest: false });

  function handleSubmit(e) {
    // Stop the browser's full-page form submit; we fetch with JavaScript instead.
    e.preventDefault();
    // trim() so a field holding only spaces counts as empty, matching the backend.
    const errs = { orig: !orig.trim(), dest: !dest.trim() };
    setFieldError(errs);
    if (errs.orig || errs.dest) return; // nothing is sent to the backend
    onSearch(orig.trim(), dest.trim(), routeType);
  }

  // Swap only exchanges the text. It doesn't search, so the user can still
  // edit before submitting, and an accidental click costs no API call.
  function handleSwap() {
    setOrig(dest);
    setDest(orig);
  }

  // Reset the form's own state, then tell App to drop the results and alert.
  // Those live in App, so the form can't clear them itself.
  function handleClear() {
    setOrig("");
    setDest("");
    // Clear means a full reset, so the route type goes back to the default too.
    setRouteType(DEFAULT_ROUTE_TYPE);
    setFieldError({ orig: false, dest: false });
    onClear();
  }

  return (
    // noValidate turns off the browser's own validation popups, so our
    // consistent inline message is the only feedback the user sees.
    <form className="route-form" onSubmit={handleSubmit} noValidate>
      <div className="fields">
        <label className="field">
          <span className="field-index">01</span>
          <span className="field-body">
            <span className="field-label">From</span>
            <input
              type="text"
              aria-label="Starting location"
              className={fieldError.orig ? "invalid" : ""}
              placeholder="Washington, D.C."
              value={orig}
              onChange={(e) => {
                setOrig(e.target.value);
                // Clear the error as soon as the user starts fixing it.
                setFieldError((f) => ({ ...f, orig: false }));
              }}
            />
          </span>
        </label>

        {/* type="button" so clicking it doesn't submit the form. The arrow
            glyph has no visible text, so aria-label names it for screen readers. */}
        <button
          type="button"
          className="swap"
          onClick={handleSwap}
          title="Swap locations"
          aria-label="Swap locations"
        >
          &#8644;
        </button>

        <label className="field">
          <span className="field-index">02</span>
          <span className="field-body">
            <span className="field-label">To</span>
            <input
              type="text"
              aria-label="Destination"
              className={fieldError.dest ? "invalid" : ""}
              placeholder="Baltimore, Md"
              value={dest}
              onChange={(e) => {
                setDest(e.target.value);
                setFieldError((f) => ({ ...f, dest: false }));
              }}
            />
          </span>
        </label>
      </div>

      {(fieldError.orig || fieldError.dest) && (
        <p className="field-error">Please fill in both locations.</p>
      )}

      <div className="form-footer">
        {/* Buttons rather than a <select>: only four options, all visible at
            once, and the same .toggle style as the units switch. */}
        <div className="toggle route-type" role="group" aria-label="Route type">
          {ROUTE_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={routeType === t.value ? "active" : ""}
              aria-pressed={routeType === t.value}
              onClick={() => setRouteType(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="actions">
          {/* Secondary style: clearing is less common than searching, so it
              shouldn't compete with the main button. */}
          <button type="button" className="secondary" onClick={handleClear}>
            Clear
          </button>
          {/* Disabled while loading so a double click can't send duplicate
              requests, and the label shows that something is happening. */}
          <button type="submit" className="primary" disabled={loading}>
            {loading ? "Loading..." : "Get Directions"}
            <span className="arrow" aria-hidden="true">
              &rarr;
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
