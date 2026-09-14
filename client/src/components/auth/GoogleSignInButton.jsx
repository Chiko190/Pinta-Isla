import { useEffect, useRef, useState } from "react";
import { googleAuth } from "../../api/auth";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Renders Google's own "Sign in with Google" button via the Google Identity
// Services script (loaded in index.html). Handles both login and signup —
// the backend finds-or-creates the account, so the caller just gets a token.
export default function GoogleSignInButton({ onSuccess, onError }) {
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
            const res = await googleAuth(response.credential);
            onSuccess(res.data.token, res.data.user);
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
  }, [onSuccess, onError]);

  if (!CLIENT_ID) return null;

  return (
    <div className="flex justify-center">
      <div ref={buttonRef} />
      {!scriptReady && <p className="text-xs text-ink-950/40">Loading Google Sign-In…</p>}
    </div>
  );
}
