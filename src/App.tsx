import { RouterProvider } from '@tanstack/react-router';
import { useAuth } from './auth/useAuth';
import { router } from './router';

function App() {
  const auth = useAuth();

  return <RouterProvider context={{ auth }} router={router} />;
}

export default App;
