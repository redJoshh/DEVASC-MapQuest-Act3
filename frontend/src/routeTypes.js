// Route types the backend accepts (MapQuest's routeType values) and their labels.
// One list feeds both the form's buttons and the summary label, so they can't
// drift apart. It must stay in sync with ROUTE_TYPES in backend/app.py.
export const ROUTE_TYPES = [
  { value: "fastest", label: "Fastest" },
  { value: "shortest", label: "Shortest" },
  { value: "pedestrian", label: "Walking" },
  { value: "bicycle", label: "Bicycle" },
];

// Same default as the backend, so "not chosen yet" means the same on both sides.
export const DEFAULT_ROUTE_TYPE = "fastest";

// Falls back to the raw value, so an unknown type still shows something
// readable instead of an empty card.
export const routeTypeLabel = (type) =>
  ROUTE_TYPES.find((t) => t.value === type)?.label ?? type;
