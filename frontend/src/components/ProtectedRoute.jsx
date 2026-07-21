import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedRoute() {
  const location = useLocation();
  return window.localStorage.getItem('access_token')
    ? <Outlet />
    : <Navigate to="/login" replace state={{ from: location }} />;
}
