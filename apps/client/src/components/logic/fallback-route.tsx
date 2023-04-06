import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface FallbackRouteProps {
  children: ReactNode
  redirectWhenLoggedIn?: boolean
}

const FallbackRoute = ({
  children,
  redirectWhenLoggedIn = false
}: FallbackRouteProps) => {
  const isLoggedIn = localStorage.getItem('token') !== null

  if (redirectWhenLoggedIn) {
    return isLoggedIn ? <Navigate to="/" replace /> : <>{children}</>
  }

  return !isLoggedIn ? <Navigate to="/login" replace /> : <>{children}</>
}

export default FallbackRoute
