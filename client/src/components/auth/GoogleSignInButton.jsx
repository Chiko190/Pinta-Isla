import { useEffect, useRef, useState } from "react";
import { googleAuth } from "../../api/auth";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Renders Google's own "Sign in with Google" button via the Google Identity
// Services script (loaded in index.html). Handles both login and signup —
// the backend finds-or-creates the account, so the caller just gets a token.
//
// `role` tells the backend what to do with a BRAND NEW account: "customer"
// creates it immediately, "artist" skips creation and calls
// onNeedsArtistApplication instead (an artist account still needs the full
// application), and omitting it lets the backend ask via onNeedsRoleChoice
// (used by the Login page, where intent isn't known yet).
export default function GoogleSignInButton({ role, onSuccess, onNeedsRoleChoice, onNeedsArtistApplication, onError }) {
  const buttonRef = useRef(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;

    let cancelled = false;
    function trySetup() {
      if (cancelled) return;
      if (!window.google?.accounts?.id) {
        setTimeout(trySetup, 100);
        return;
      }
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async (response) => {
          try {
            const res = await googleAuth(response.credential, role);
            if (res.data.needsRoleChoice) {
              onNeedsRoleChoice?.(res.data.profile, response.credential);
            } else if (res.data.needsArtistApplication) {
              onNeedsArtistApplication?.(res.data.profile, response.credential);
            } else {
              onSuccess(res.data.token, res.data.user);
            }
          } catch (err) {
            onError?.(err.message);
          }
        },
      });
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          width: 360,
          text: "continue_with",
        });
      }
      setScriptReady(true);
    }
    trySetup();
    return () => {
      cancelled = true;
    };
  }, [role, onSuccess, onNeedsRoleChoice, onNeedsArtistApplication, onError]);

  if (!CLIENT_ID) return null;

  return (
    <div className="flex justify-center">
      <div ref={buttonRef} />
      {!scriptReady && <p className="text-xs text-ink-950/40">Loading Google Sign-In…</p>}
    </div>
  );
}
