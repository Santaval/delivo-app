import { Routes } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';

const STORAGE_KEY = 'pendingInvitationToken';

/** Returns the token if the URL is an invitation link (…/invitations/accept?token=…). */
export const parseInvitationToken = (url: string | null): string | null => {
  if (!url) return null;
  // Match on the raw string: with a custom scheme (app://invitations/accept)
  // `invitations` is parsed as the hostname, not part of the path.
  if (!/invitations\/accept\/?(\?|#|$)/.test(url)) return null;
  const { queryParams } = Linking.parse(url);
  const token = queryParams?.token;
  return typeof token === 'string' && token.length > 0 ? token : null;
};

/**
 * An invitation link can be opened while signed out, when the accept route is
 * not reachable and the router would drop the token. So the token is stashed
 * as soon as the link arrives and the accept screen is pushed once there is a
 * session (the invitee may still have to sign in or create an account first).
 */
export function PendingInvitationNavigator({ ready }: { ready: boolean }) {
  const { authState } = useAuth();
  const url = Linking.useLinkingURL();

  useEffect(() => {
    const token = parseInvitationToken(url);
    if (token) SecureStore.setItemAsync(STORAGE_KEY, token).catch(() => {});
  }, [url]);

  useEffect(() => {
    if (!ready || !authState.authenticated) return;
    let cancelled = false;
    (async () => {
      // Link may have arrived this same tick; make sure it is stored first
      const fresh = parseInvitationToken(url);
      if (fresh) await SecureStore.setItemAsync(STORAGE_KEY, fresh).catch(() => {});
      const token = await SecureStore.getItemAsync(STORAGE_KEY).catch(() => null);
      if (!token || cancelled) return;
      await SecureStore.deleteItemAsync(STORAGE_KEY).catch(() => {});
      router.push(Routes.invitationAccept(token));
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, authState.authenticated, url]);

  return null;
}
