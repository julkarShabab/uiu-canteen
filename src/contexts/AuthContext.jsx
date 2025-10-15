import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Function to fetch current user data
  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    
    try {
      const response = await api.get('/auth/me')
      
      if (response.data && !response.data.error) {
        setUser(response.data.user)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      } else {
        // If there's an API error, use the stored user data instead of logging out
        console.log('Using stored user data instead of API response')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      // Don't remove token or user data on API errors
      // This prevents unexpected logouts
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
        // Verify token and refresh user data
        fetchCurrentUser()
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('user')
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      // Check if email and password are provided
      if (!email || !password) {
        toast.error('Please enter both email and password')
        return null
      }

      // Try to login with the backend
      try {
        const response = await api.post('/auth/login', {
          email,
          password
        })
        
        if (response.data && response.data.token) {
          const userData = response.data.user || {
            id: 'user-' + Date.now(),
            name: email.split('@')[0],
            email: email,
            type: 'customer'
          }
          const token = response.data.token
          
          localStorage.setItem('token', token)
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
          toast.success('Login successful!')
          return userData
        } else {
          throw new Error('Invalid response from server')
        }
      } catch (apiError) {
        console.error('API login error:', apiError)
        
        // For development purposes only - create a user if backend is not available
        // This should be removed in production
        if (apiError.message && apiError.message.includes('Network Error')) {
          // Create a temporary user for development
          const userData = {
            id: 'user-' + Date.now(),
            name: email.split('@')[0],
            email: email,
            type: email.includes('delivery') ? 'delivery' : 
                  email.includes('restaurant') ? 'restaurant' : 'customer'
          }
          const token = 'dev-token-' + Date.now()
          
          localStorage.setItem('token', token)
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
          toast.success('Development login successful')
          return userData
        }
        
        toast.error('Invalid email or password')
        return null
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed. Please try again.')
      return null
    }
  }

  const register = async (userData) => {
    try {
      // Convert userType to type as expected by the API
      const apiData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        type: userData.userType
      }
      
      if (userData.userType === 'restaurant' && userData.restaurantName) {
        apiData.restaurantName = userData.restaurantName
      }
      
      const response = await api.post('/auth/register', apiData)
      
      if (response.data && response.data.success) {
        const user = response.data.user
        const token = response.data.token
        
        // Store token in localStorage
        localStorage.setItem('token', token)
        
        setUser(user)
        localStorage.setItem('user', JSON.stringify(user))
        toast.success('Registration successful!')
        return true
      } else {
        toast.error('Registration failed - Invalid response')
        return false
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error.response?.data?.message || 'Registration failed')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    toast.success('Logged out successfully')
  }

  const updateDeliveryLocation = async (lat, lng) => {
    if (user && user.type === 'delivery') {
      try {
        const token = localStorage.getItem('token')
        
        if (!token) {
          toast.error('Authentication required')
          return false
        }
        
        const response = await api.put('/auth/location', { lat, lng })
        
        const updatedUser = { ...user, location: { lat, lng } }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        return true
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update location')
        return false
      }
    }
  }

  const updateDeliveryAvailability = async (isAvailable) => {
    if (user && user.type === 'delivery') {
      try {
        const token = localStorage.getItem('token')
        
        if (!token) {
          toast.error('Authentication required')
          return false
        }
        
        const response = await api.put('/auth/availability', { isAvailable })
        
        const updatedUser = { ...user, isAvailable }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        return true
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update availability status')
        return false
      }
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateDeliveryLocation,
    updateDeliveryAvailability,
    fetchCurrentUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

