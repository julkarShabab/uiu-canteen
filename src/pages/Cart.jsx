import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Trash2, Plus, Minus, MapPin, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const Cart = () => {
  // Local state instead of context
  const [cart, setCart] = useState([])
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryInstructions, setDeliveryInstructions] = useState('')
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const navigate = useNavigate()
  
  // Load cart from localStorage on component mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        setCart(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    }
  }, [])
  
  // Cart management functions
  const removeFromCart = (itemId) => {
    const updatedCart = cart.filter(item => item.id !== itemId)
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    toast.success('Item removed from cart')
  }
  
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId)
      return
    }
    
    const updatedCart = cart.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    )
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }
  
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }
  
  const clearCart = () => {
    setCart([])
    localStorage.setItem('cart', JSON.stringify([]))
  }

  const handleCheckout = () => {
    if (!deliveryAddress.trim()) {
      toast.error('Please enter a delivery address')
      return
    }

    setIsCheckingOut(true)

    try {
      // Get user info from localStorage
      const userString = localStorage.getItem('user')
      const user = userString ? JSON.parse(userString) : { id: 'guest-' + Date.now() }
      
      // Create a new order object with pending status for restaurant
      const newOrder = {
        id: 'order-' + Date.now(),
        items: [...cart],
        total: getCartTotal(),
        status: 'pending_restaurant', // Initial status - waiting for restaurant to accept
        deliveryAddress: deliveryAddress,
        deliveryInstructions: deliveryInstructions,
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 45 * 60000).toISOString(),
        customerId: user.id || 'guest',
        customerName: user.name || 'Guest Customer',
        customerEmail: user.email || 'guest@example.com',
        assignedDelivery: null, // Will be assigned after restaurant accepts
        restaurantAccepted: false,
        restaurantAcceptedAt: null,
        deliveryAssigned: false,
        deliveryAssignedAt: null,
        deliveryCompleted: false,
        deliveryCompletedAt: null
      }

      // Get existing orders from localStorage
      const existingOrdersString = localStorage.getItem('orders')
      const existingOrders = existingOrdersString ? JSON.parse(existingOrdersString) : []
      
      // Add new order to the beginning of the array
      const updatedOrders = [newOrder, ...existingOrders]
      
      // Save updated orders back to localStorage
      localStorage.setItem('orders', JSON.stringify(updatedOrders))
      
      // Also save to restaurantOrders for the restaurant dashboard
      const existingRestaurantOrdersString = localStorage.getItem('restaurantOrders')
      const existingRestaurantOrders = existingRestaurantOrdersString ? JSON.parse(existingRestaurantOrdersString) : []
      const updatedRestaurantOrders = [newOrder, ...existingRestaurantOrders]
      localStorage.setItem('restaurantOrders', JSON.stringify(updatedRestaurantOrders))
      
      // Save to restaurant orders separately
      const restaurantOrdersString = localStorage.getItem('restaurantOrders')
      const restaurantOrders = restaurantOrdersString ? JSON.parse(restaurantOrdersString) : []
      restaurantOrders.unshift(newOrder) // Add to beginning of array
      localStorage.setItem('restaurantOrders', JSON.stringify(restaurantOrders))
      
      // Clear the cart
      clearCart()
      
      // Show success message
      toast.success('Order placed successfully! Waiting for restaurant confirmation.')
      
      // Navigate to orders page after a short delay
      setTimeout(() => {
        setIsCheckingOut(false)
        navigate('/orders')
      }, 1000)
    } catch (error) {
      console.error('Error saving order:', error)
      toast.error('Failed to place order. Please try again.')
      setIsCheckingOut(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <Link to="/menu" className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Menu</span>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Cart</h1>
          <p className="text-gray-600 mb-8">Your cart is empty.</p>
          <button
            onClick={() => navigate('/menu')}
            className="btn-primary"
          >
            Browse Menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-6">
          <Link to="/menu" className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Menu</span>
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Your Cart</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-2xl font-semibold mb-6">Order Items</h2>
              
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                      <p className="text-primary-600 font-semibold">৳{item.price}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>৳{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>৳50</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>৳{(getCartTotal() + 50).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter your delivery address"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    placeholder="Any special instructions for delivery?"
                    className="input-field"
                    rows="3"
                  />
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full btn-primary text-lg py-3"
              >
                {isCheckingOut ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
