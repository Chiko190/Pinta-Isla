export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-ink-950">Terms of Service</h1>
      <p className="mt-2 text-sm text-ink-950/50">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="mt-8 space-y-8 text-ink-950/75 leading-relaxed">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">Accounts</h2>
          <p className="mt-2">
            You must provide accurate information when creating an account and are responsible
            for keeping your login credentials confidential. Artist accounts are subject to
            review and approval before they can list artwork publicly.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">Artist listings</h2>
          <p className="mt-2">
            Artists must own the rights to any artwork they upload, or have permission to sell
            it. Listings are reviewed before appearing publicly, and Pinta Isla may remove or
            reject listings that violate these terms or applicable law, including copyright
            infringement.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">Acceptable use</h2>
          <p className="mt-2">
            Don't use Pinta Isla to upload content you don't have rights to, impersonate someone
            else, attempt to bypass account security, or interfere with the normal operation of
            the platform.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">Suspension</h2>
          <p className="mt-2">
            We may suspend or terminate accounts that violate these terms, at our discretion,
            with or without notice depending on severity.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">Platform status</h2>
          <p className="mt-2">
            Pinta Isla is under active development. Some features referenced in the app (cart,
            checkout, commissions, messaging, reviews) are shown as "Coming soon" and are not yet
            available — no payments are processed through the platform at this time.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">Changes</h2>
          <p className="mt-2">
            We may update these terms as the platform evolves. Continued use of Pinta Isla after
            a change means you accept the updated terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">Contact</h2>
          <p className="mt-2">
            Questions about these terms? Reach out via our{" "}
            <a href="/contact" className="font-medium text-ink-700 hover:underline">Contact page</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
