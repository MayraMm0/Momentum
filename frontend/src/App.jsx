import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './components/auth/SignUp';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import TasksPage from './components/tasks/TasksPage';
import AppLayout from './components/layout/AppLayout';

function App() {
  // Token starts as null
  // when setToken gets called with a real JWT string, App re-renders
  const [token, setToken] = useState(null);
  const onAuthError = () => setToken(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/signup"
          element={token ? <Navigate to="/today" replace /> : <SignUp setToken={setToken} />}
        />

        <Route
          path="/login"
          element={token ? <Navigate to="/today" replace /> : <Login setToken={setToken} />}
        />

        <Route
          element={token ? <AppLayout token={token} onAuthError={onAuthError} /> : <Navigate to="/today" replace />}
        >
          <Route path="/today" element={<Dashboard token={token} onAuthError={onAuthError} />} />
          <Route path="/tasks" element={<TasksPage token={token} onAuthError={onAuthError} />} />
        </Route>

        <Route path="*" element={<Navigate to={token ? '/today' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;