import { useEffect, useState } from 'react';
import { Box, Spinner, Center, Button } from '@chakra-ui/react';
import LoginPage from '@/pages/LoginPage';
import { refresh, setOnUnauthorized, getAccessToken, logout } from '@/utils/requests';

type AuthState = 'loading' | 'unauthenticated' | 'authenticated';

function App() {
  const [authState, setAuthState] = useState<AuthState>('loading');

  // On mount, try to restore the session via the httpOnly refresh-token cookie.
  useEffect(() => {
    // Register before calling refresh so mid-session expiry is also caught.
    setOnUnauthorized(() => setAuthState('unauthenticated'));

    refresh()
      .then((ok) => setAuthState(ok ? 'authenticated' : 'unauthenticated'))
      .catch(() => setAuthState('unauthenticated')); // network error → show login
  }, []);

  if (authState === 'loading') {
    return (
      <Center minH="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (authState === 'unauthenticated') {
    return <LoginPage onSuccess={() => setAuthState('authenticated')} />;
  }

  // ── Authenticated app shell ────────────────────────────────────────────────
  return (
    <Box p={8}>
      <p>Logged in — access token: {getAccessToken()?.slice(0, 20)}…</p>
      <Button onClick={logout}>Logout</Button>
    </Box>
  );
}

export default App;
