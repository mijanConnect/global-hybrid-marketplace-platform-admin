import { useNavigate } from 'react-router-dom'

/**
 * Custom hook for handling logout functionality
 * Clears auth token and redirects to login page
 */
export function useLogout() {
  const navigate = useNavigate()

  const logout = () => {
    // Clear authentication token
    localStorage.removeItem('admin_token')
    // Clear any other auth-related data if needed
    localStorage.removeItem('admin_user')
    localStorage.removeItem('admin_session')
    
    // Redirect to login page
    navigate('/login')
  }

  return logout
}
