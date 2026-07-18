import { useNavigate } from 'react-router-dom'

export function useLogout() {
  const navigate = useNavigate()
  
  const logout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    localStorage.removeItem('admin_session')
    navigate('/login')
  }
  return logout
}
