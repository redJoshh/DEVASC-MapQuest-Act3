import { useState } from "react";

// Start/destination inputs with empty-field validation (Test Case 3).
// Validating here, before any request, gives instant feedback and saves a
// round trip. The backend still checks too (code 611), because a client-side
// check can always be bypassed.
export default function RouteForm({ loading, onSearch }) {
  // Controlled inputs: React state is the single source of truth, so the
  // values can be validated, trimmed and (later) swapped or cleared.
  const [orig, setOrig] = useState("");
  const [dest, setDest] = useState("");
  // One flag per field, so only the empty field gets the red border.
  const [fieldError, setFieldError] = useState({ orig: false, dest: false });

  function handleSubmit(e) {
    // Stop the browser's full-page form submit; we fetch with JavaScript instead.
    e.preventDefault();
    // trim() so a field holding only spaces counts as empty, matching the backend.
    const errs = { orig: !orig.trim(), dest: !dest.trim() };
    setFieldError(errs);
    if (errs.orig || errs.dest) return; // nothing is sent to the backend
    onSearch(orig.trim(), dest.trim());
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
        <div className="actions">
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
