import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  // Check for stored user data as a fallback
  const storedUserString = localStorage.getItem('user')
  const storedUser = storedUserString ? JSON.parse(storedUserString) : null
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  // Allow access if either the context user or stored user exists
  if (!user && !storedUser) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute


