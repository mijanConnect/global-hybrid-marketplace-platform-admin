import { Navigate } from 'react-router-dom';

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('admin_token');
  
  if (token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}
