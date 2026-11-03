// Two-option switch for Test Case 2. Changing it only re-renders;
// no new API request is made.
// It is a controlled component: App owns the metric value, so the summary
// and the table always agree on the unit.
export default function UnitToggle({ metric, onChange }) {
  return (
    // role="group" + aria-label groups the two buttons for screen readers,
    // and aria-pressed tells them which option is currently selected.
    <div className="toggle" role="group" aria-label="Distance units">
      <button
        type="button"
        className={!metric ? "active" : ""}
        aria-pressed={!metric}
        onClick={() => onChange(false)}
      >
        Miles
      </button>
      <button
        type="button"
        className={metric ? "active" : ""}
        aria-pressed={metric}
        onClick={() => onChange(true)}
      >
        Kilometers
      </button>
    </div>
  );
}
