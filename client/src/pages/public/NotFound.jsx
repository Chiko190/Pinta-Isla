import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-28 text-center">
      <h1 className="font-display text-5xl font-bold text-ink-950">404</h1>
      <p className="mt-3 text-ink-950/60">We couldn't find that page.</p>
      <Button as={Link} to="/" className="mt-7">Back to Home</Button>
    </div>
  );
}
