import { formatDistance } from "../units";

// Duration and distance cards (the lab's trip summary, formatted).
// A route type card is added in the route-type branch, once the API returns it.
export default function TripSummary({ route, metric }) {
  return (
    <div className="summary">
      <div className="stat">
        <span className="label">Trip Duration</span>
        {/* Shown exactly as MapQuest formats it (HH:MM:SS), as the lab did. */}
        <span className="value">{route.duration}</span>
      </div>
      <div className="stat">
        <span className="label">Distance</span>
        <span className="value">
          {formatDistance(route.distance_miles, metric)}
        </span>
      </div>
    </div>
  );
}
