export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-ink-950">Privacy Policy</h1>
      <p className="mt-2 text-sm text-ink-950/50">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="mt-8 space-y-8 text-ink-950/75 leading-relaxed">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">What we collect</h2>
          <p className="mt-2">
            When you create an account, we collect your name, username, email address, and
            password (stored as a one-way hash — we never see or store your actual password).
            Customers may optionally add a phone number, address, city, and province. Artists
            additionally provide an artist name, bio, specialization, and portfolio images as
            part of their application.
          </p>
          <p className="mt-2">
            If you sign in with Google, we receive your name, email address, and profile picture
            from Google — never your Google password.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">How we use it</h2>
          <p className="mt-2">
            Your information is used to operate your account, display your public profile
            (artists) or manage your orders and wishlist (customers), review artist applications,
            moderate artwork listings, and send you account-related notifications (e.g. approval
            status). We do not sell your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">How we protect it</h2>
          <p className="mt-2">
            Passwords are hashed with bcrypt and never stored in plain text. All traffic to the
            site is encrypted (HTTPS). Login attempts are rate-limited and accounts temporarily
            lock after repeated failed attempts to deter unauthorized access.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">Third parties</h2>
          <p className="mt-2">
            If you use "Continue with Google," Google acts as an identity provider solely to
            verify your email address for sign-in — see Google's own Privacy Policy for how they
            handle your data.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">Your choices</h2>
          <p className="mt-2">
            You can update or remove most of your account information from your profile settings
            at any time. To request deletion of your account and associated data, contact us
            using the details on our <a href="/contact" className="font-medium text-ink-700 hover:underline">Contact page</a>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-950">Changes to this policy</h2>
          <p className="mt-2">
            We may update this policy as the platform evolves. Continued use of Pinta Isla after
            a change means you accept the updated policy.
          </p>
        </section>
      </div>
    </div>
  );
}
