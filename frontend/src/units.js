// Same conversion factor the lab used. MapQuest returns miles.
// Keeping the lab's 1.61 (instead of the exact 1.609344) means our km figures
// match the original script's output.
export const KM_PER_MILE = 1.61;

// Conversion happens only at render time: the backend always sends miles, so
// switching units never needs a new API request.
// toFixed(2) matches the lab's "{:.2f}" formatting.
export const formatDistance = (miles, metric) =>
  metric ? `${(miles * KM_PER_MILE).toFixed(2)} km` : `${miles.toFixed(2)} mi`;
