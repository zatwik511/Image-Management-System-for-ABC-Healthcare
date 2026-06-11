import { Navigate } from 'react-router-dom';

interface PatientRouteProps {
  children: React.ReactElement;
}

export function PatientRoute({ children }: PatientRouteProps) {
  const token = localStorage.getItem('patientToken');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}
