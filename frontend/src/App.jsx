import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  // Token starts as null
  // when setToken gets called with a real JWT string, App re-renders
  const [token, setToken] = useState(null);

  return (
    <>
    {token ? (
      // Dashboard never touches setToken directly
      <Dashboard token={token} onAuthError={() => setToken(null)} />
    ) : (
      <Login setToken={setToken} />
    )}
    </>
  );
}

export default App;