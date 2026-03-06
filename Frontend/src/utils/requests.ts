const BASE_URL = '';  // requests go through the Vite dev proxy (see vite.config.ts)

// In-memory access token storage (never persisted to localStorage for security)
let _accessToken: string | null = null;
let _onUnauthorized: (() => void) | null = null;

export function setAccessToken(token: string | null): void {
    _accessToken = token;
}

export function getAccessToken(): string | null {
    return _accessToken;
}

/**
 * Register a callback that fires when the refresh token has expired and the
 * user must log in again. Typically used to redirect back to the login page.
 */
export function setOnUnauthorized(cb: () => void): void {
    _onUnauthorized = cb;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginPayload {
    username: string;
    password: string;
}

/**
 * Log in with an email / password pair.
 * On success the server returns `{ accessToken }` in the body and sets an
 * httpOnly refresh-token cookie automatically.
 */
export async function login(payload: LoginPayload): Promise<void> {
    const res = await fetch(`${BASE_URL}/auth-v2/login`, {
        method: 'POST',
        credentials: 'include',          // receive the httpOnly refresh-token cookie
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(data.message ?? `Login failed (${res.status})`);
    }

    const data = await res.json() as { accessToken: string };
    setAccessToken(data.accessToken);
}

export async function logout(): Promise<void> {
    await fetch(`${BASE_URL}/auth-v2/logout`, {
        method: 'POST',
        credentials: 'include',          // receive the httpOnly refresh-token cookie
        headers: { 'Content-Type': 'application/json' },
    });
    setAccessToken(null);
    _onUnauthorized?.();
}

/**
 * Use the httpOnly refresh-token cookie to obtain a new access token.
 * Returns `true` on success, `false` if the refresh token has also expired
 * (in which case the `onUnauthorized` callback is invoked to trigger re-login).
 */
export async function refresh(): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/auth-v2/refresh`, {
        method: 'POST',
        credentials: 'include',          // send the httpOnly refresh-token cookie
    });

    if (!res.ok) {
        setAccessToken(null);
        _onUnauthorized?.();             // redirect to login
        return false;
    }

    const data = await res.json() as { accessToken: string };
    setAccessToken(data.accessToken);
    return true;
}

// ── Authenticated request helper ──────────────────────────────────────────────

/**
 * Make an authenticated request to the backend API.
 * Automatically injects the Bearer token and retries once after a
 * transparent token refresh when a 401 is received.
 */
export async function request<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const buildHeaders = (): HeadersInit => ({
        'Content-Type': 'application/json',
        ...(_accessToken ? { Authorization: `Bearer ${_accessToken}` } : {}),
        ...(options.headers as Record<string, string> ?? {}),
    });

    const makeRequest = () =>
        fetch(`${BASE_URL}${path}`, {
            ...options,
            credentials: 'include',
            headers: buildHeaders(),
        });

    let res = await makeRequest();

    // Attempt a transparent refresh on 401 before giving up
    if (res.status === 401) {
        const refreshed = await refresh();
        if (refreshed) {
            res = await makeRequest();
        } else {
            throw new Error('Session expired. Please log in again.');
        }
    }

    if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(data.message ?? `Request failed (${res.status})`);
    }

    return res.json() as Promise<T>;
}
