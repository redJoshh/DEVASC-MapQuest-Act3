import { formatDistance } from "../units";

// Step-by-step maneuvers (the lab's for-loop over legs[0].maneuvers) as a table.
// A table, not a list, so the step number, narrative and distance line up in
// columns that are easy to scan.
export default function DirectionsTable({ maneuvers, metric }) {
  return (
    // The wrapper scrolls sideways on narrow screens instead of breaking the page.
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Directions</th>
            <th className="num">Distance</th>
          </tr>
        </thead>
        <tbody>
          {/* The index is a safe key here: the list is replaced as a whole on
              each search and never reordered or edited in place. */}
          {maneuvers.map((m, i) => (
            <tr key={i}>
              {/* Zero-padded (01, 02, ...) so the step column stays a fixed width. */}
              <td className="step">{String(i + 1).padStart(2, "0")}</td>
              <td>{m.narrative}</td>
              <td className="nowrap num">
                {formatDistance(m.distance_miles, metric)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
