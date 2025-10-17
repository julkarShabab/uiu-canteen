import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { OrderProvider } from './contexts/OrderContext'
import { DeliveryProvider } from './contexts/DeliveryContext'

// Components
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import Login from './pages/Login'
import Register from './pages/Register'
import DeliveryDashboard from './pages/DeliveryDashboard'
import RestaurantDashboard from './pages/RestaurantDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'

function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <DeliveryProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={
                  <RoleRoute roles={["customer"]}>
                    <Menu />
                  </RoleRoute>
                } />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/orders" 
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/delivery" 
                  element={
                    <RoleRoute roles={["delivery"]}>
                      <DeliveryDashboard />
                    </RoleRoute>
                  } 
                />
                <Route 
                  path="/restaurant" 
                  element={
                    <RoleRoute roles={["restaurant"]}>
                      <RestaurantDashboard />
                    </RoleRoute>
                  } 
                />
              </Routes>
            </main>
            <Toaster position="top-right" />
          </div>
        </DeliveryProvider>
      </OrderProvider>
    </AuthProvider>
  )
}

export default App


