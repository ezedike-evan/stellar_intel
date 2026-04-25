import { useState, useEffect, useRef, useCallback } from "react";

// Assumed cache utilities from #023
import { getAnchorAuthCache, setAnchorAuthCache } from "../cache/anchorAuthCache";

type AnchorAuthState = {
  jwt: string | null;
  isAuthenticating: boolean;
  error: Error | null;
};

type UseAnchorAuthReturn = {
  jwt: string | null;
  authenticate: () => Promise<void>;
  isAuthenticating: boolean;
  error: Error | null;
};

export function useAnchorAuth(anchorId: string): UseAnchorAuthReturn {
  const [state, setState] = useState<AnchorAuthState>({
    jwt: null,
    isAuthenticating: false,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    const cached = getAnchorAuthCache(anchorId);
    if (cached) {
      setState({
        jwt: cached,
        isAuthenticating: false,
        error: null,
      });
    }
  }, [anchorId]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const authenticate = useCallback(async () => {
    if (state.isAuthenticating) return;

    const controller = new AbortController();
    abortRef.current = controller;

    setState((prev) => ({
      ...prev,
      isAuthenticating: true,
      error: null,
    }));

    try {
      const res = await fetch(`/api/anchor/${anchorId}/auth`, {
        method: "POST",
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Auth failed: ${res.status}`);
      }

      const data = await res.json();
      const jwt = data.jwt;

      if (!jwt) {
        throw new Error("Missing JWT in response");
      }

      setAnchorAuthCache(anchorId, jwt);

      if (!mountedRef.current) return;

      setState({
        jwt,
        isAuthenticating: false,
        error: null,
      });
    } catch (err: any) {
      if (err.name === "AbortError") return;

      if (!mountedRef.current) return;

      setState((prev) => ({
        ...prev,
        isAuthenticating: false,
        error: err,
      }));
    }
  }, [anchorId, state.isAuthenticating]);

  return {
    jwt: state.jwt,
    authenticate,
    isAuthenticating: state.isAuthenticating,
    error: state.error,
  };
}
