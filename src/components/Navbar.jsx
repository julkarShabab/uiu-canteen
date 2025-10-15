import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useOrder } from '../contexts/OrderContext'
import { ShoppingCart, User, LogOut, Coffee } from 'lucide-react'
import Notifications from './Notifications'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { getCartCount } = useOrder()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
                     <Link to="/" className="flex items-center space-x-2">
             <Coffee className="h-8 w-8 text-primary-600" />
             <span className="text-xl font-bold text-gray-800">PET THANDA</span>
           </Link>

                     {/* Navigation Links */}
           <div className="hidden md:flex items-center space-x-8">
             {(!user || (user && user.type === 'customer')) && (
               <Link to="/menu" className="text-gray-600 hover:text-primary-600 transition-colors">
                 Menu
               </Link>
             )}
            {user && (
              <>
                <Link to="/orders" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Orders
                </Link>
                {user.type === 'delivery' && (
                  <Link to="/delivery" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Delivery Dashboard
                  </Link>
                )}
                {user.type === 'restaurant' && (
                  <Link to="/restaurant" className="text-gray-600 hover:text-primary-600 transition-colors">
                    Restaurant Dashboard
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon - Only show for customers or non-logged in users */}
            {(!user || user.type === 'customer') && (
              <Link to="/cart" className="relative text-gray-600 hover:text-primary-600 transition-colors">
                <ShoppingCart className="h-6 w-6" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            )}

            {/* Notifications */}
            {user && <Notifications />}

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="text-gray-600 hover:text-primary-600 transition-colors">
                  <User className="h-6 w-6" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
