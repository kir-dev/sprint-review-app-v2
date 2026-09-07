export const SESSION_REJECTED_EVENT = 'session-rejected';

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  GROUP_MEMBERSHIP_REQUIRED:
    'Az oldal használatához a beállított kör aktív tagjának kell lenned, vagy engedélyezett öregtagsággal kell rendelkezned.',
  GROUP_MEMBERSHIP_UNVERIFIABLE:
    'Az AuthSCH nem adott ellenőrizhető körtagsági adatot. Ellenőrizd a PÉK-kapcsolatot és az adatátadási engedélyt, majd próbáld újra.',
  GROUP_ACCESS_UNAVAILABLE:
    'A kör hozzáférési beállítása jelenleg nem érhető el. Kérjük, jelezd az üzemeltetőnek, vagy próbáld újra később.',
  GROUP_SESSION_INVALID:
    'A hozzáférési szabály megváltozott vagy a munkamenet lejárt. Jelentkezz be újra az AuthSCH-val.',
  AUTHSCH_FAILED: 'Az AuthSCH-belépés nem sikerült. Kérjük, próbáld újra később.',
};

export function authErrorMessage(code: string): string {
  return AUTH_ERROR_MESSAGES[code] || 'A munkamenet lejárt vagy érvénytelen. Jelentkezz be újra.';
}

/** Notifies the auth context only about rejected application sessions, not action-level 403s. */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);
  const authorization = new Headers(
    init?.headers ?? (input instanceof Request ? input.headers : undefined),
  ).get('Authorization');
  if (typeof window === 'undefined' || !authorization) return response;
  const url = new URL(input instanceof Request ? input.url : String(input), window.location.origin);
  if (url.origin !== window.location.origin || !url.pathname.startsWith('/api/')) return response;
  if (response.status !== 401 && response.status !== 403) return response;
  let code = '';
  try {
    const body: unknown = await response.clone().json();
    if (
      typeof body === 'object' &&
      body !== null &&
      'code' in body &&
      typeof body.code === 'string'
    ) {
      code = body.code;
    }
  } catch {
    /* An empty 401 still invalidates the session. */
  }
  if (response.status === 401 || code.startsWith('GROUP_MEMBERSHIP_')) {
    window.dispatchEvent(
      new CustomEvent(SESSION_REJECTED_EVENT, {
        detail: { token: authorization.replace(/^Bearer /, ''), code },
      }),
    );
    throw new Error(authErrorMessage(code));
  }
  return response;
}
