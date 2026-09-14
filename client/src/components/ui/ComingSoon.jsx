import Badge from "./Badge";
import EmptyState from "./EmptyState";

// Explicit "not built yet" marker per spec: never fake data or silent dead buttons.
export default function ComingSoon({ title, description }) {
  return (
    <div className="mx-auto max-w-xl py-10">
      <EmptyState
        icon="🛠️"
        title={
          <span className="inline-flex items-center gap-2">
            {title} <Badge tone="yellow">Coming soon</Badge>
          </span>
        }
        description={description}
      />
    </div>
  );
}
