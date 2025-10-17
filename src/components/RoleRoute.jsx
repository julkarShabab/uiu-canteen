import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const RoleRoute = ({ roles, children }) => {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user || !roles.includes(user.type)) {
    return <Navigate to="/" replace />
  }
  return children
}

export default RoleRoute