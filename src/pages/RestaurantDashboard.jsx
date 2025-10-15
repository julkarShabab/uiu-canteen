import React, { useState, useRef, useEffect } from 'react'
import { useOrder } from '../contexts/OrderContext'
import { useDelivery } from '../contexts/DeliveryContext'
import { Clock, Package, CheckCircle, Truck, User, Plus, Edit, Trash2, ArrowLeft, X, Upload, Check, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import Banner from '../components/Banner'

const RestaurantDashboard = () => {
  const { orders, updateOrderStatus, assignDelivery, menuItems, addMenuItem, updateMenuItem, removeMenuItem } = useOrder()
  const { deliveryPersonnel } = useDelivery()
  
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [restaurantOrders, setRestaurantOrders] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [showItemModal, setShowItemModal] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    available: true
  })
  const fileInputRef = useRef(null)
  
  // Load restaurant orders from localStorage or directly from orders prop
  useEffect(() => {
    try {
      // Force refresh from both sources to ensure we have the latest data
      const storedOrders = localStorage.getItem('restaurantOrders')
      const parsedStoredOrders = storedOrders ? JSON.parse(storedOrders) : []
      
      // Combine orders from context and localStorage, removing duplicates
      const combinedOrders = [...(orders || []), ...parsedStoredOrders]
      const uniqueOrders = Array.from(new Map(combinedOrders.map(order => [order.id, order])).values())
      
      setRestaurantOrders(uniqueOrders)
      // Update localStorage for persistence
      localStorage.setItem('restaurantOrders', JSON.stringify(uniqueOrders))
      
      // Debug notification to confirm orders are loaded
      if (uniqueOrders.length > 0) {
        toast.success(`Loaded ${uniqueOrders.length} orders`)
      }
    } catch (error) {
      console.error('Error loading restaurant orders:', error)
      toast.error('Error loading orders. Please refresh the page.')
    }
    
    // Set up interval to check for new orders every 2 seconds
    const intervalId = setInterval(() => {
      try {
        // Force refresh from both sources to ensure we have the latest data
        const storedOrders = localStorage.getItem('restaurantOrders')
        const parsedStoredOrders = storedOrders ? JSON.parse(storedOrders) : []
        
        // Combine orders from context and localStorage, removing duplicates
        const combinedOrders = [...(orders || []), ...parsedStoredOrders]
        const uniqueOrders = Array.from(new Map(combinedOrders.map(order => [order.id, order])).values())
        
        // Only update if there are changes
        if (JSON.stringify(uniqueOrders) !== JSON.stringify(restaurantOrders)) {
          setRestaurantOrders(uniqueOrders)
          localStorage.setItem('restaurantOrders', JSON.stringify(uniqueOrders))
        }
      } catch (error) {
        console.error('Error checking for new orders:', error)
      }
    }, 2000) // Check every 2 seconds
    
    return () => clearInterval(intervalId)
  }, [])
  
  // Function to accept an order from a customer
  const handleAcceptOrder = (order) => {
    try {
      // Update order status
      const updatedOrder = {
        ...order,
        status: 'pending',
        restaurantAccepted: true,
        restaurantAcceptedAt: new Date().toISOString()
      }
      
      // Update restaurantOrders in localStorage
      const updatedRestaurantOrders = restaurantOrders.map(o => 
        o.id === order.id ? updatedOrder : o
      )
      localStorage.setItem('restaurantOrders', JSON.stringify(updatedRestaurantOrders))
      setRestaurantOrders(updatedRestaurantOrders)
      
      // Update customerOrders in localStorage to reflect the change
      const customerOrders = JSON.parse(localStorage.getItem('orders') || '[]')
      const updatedCustomerOrders = customerOrders.map(o => 
        o.id === order.id ? updatedOrder : o
      )
      localStorage.setItem('orders', JSON.stringify(updatedCustomerOrders))
      
      toast.success('Order accepted successfully!')
    } catch (error) {
      console.error('Error accepting order:', error)
      toast.error('Failed to accept order. Please try again.')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_restaurant':
        return 'bg-red-100 text-red-700'
      case 'pending':
        return 'bg-orange-100 text-orange-700'
      case 'assigned':
        return 'bg-blue-100 text-blue-700'
      case 'picked_up':
        return 'bg-yellow-100 text-yellow-700'
      case 'in_transit':
        return 'bg-purple-100 text-purple-700'
      case 'delivered':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_restaurant':
        return <AlertTriangle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'assigned':
        return <User className="h-4 w-4" />
      case 'picked_up':
        return <Package className="h-4 w-4" />
      case 'in_transit':
        return <Truck className="h-4 w-4" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }
  
  // Function to accept an order from a customer
  const acceptOrder = (order) => {
    try {
      // Update the order status
      const updatedOrder = {
        ...order,
        status: 'pending', // Change from pending_restaurant to pending
        restaurantAccepted: true,
        restaurantAcceptedAt: new Date().toISOString()
      }
      
      // Update in restaurantOrders
      const updatedRestaurantOrders = restaurantOrders.map(o => 
        o.id === order.id ? updatedOrder : o
      )
      setRestaurantOrders(updatedRestaurantOrders)
      localStorage.setItem('restaurantOrders', JSON.stringify(updatedRestaurantOrders))
      
      // Update in customer orders
      const customerOrdersString = localStorage.getItem('orders')
      if (customerOrdersString) {
        const customerOrders = JSON.parse(customerOrdersString)
        const updatedCustomerOrders = customerOrders.map(o => 
          o.id === order.id ? updatedOrder : o
        )
        localStorage.setItem('orders', JSON.stringify(updatedCustomerOrders))
      }
      
      toast.success('Order accepted! Ready for delivery assignment.')
    } catch (error) {
      console.error('Error accepting order:', error)
      toast.error('Failed to accept order')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus)

  // New orders from customers waiting for restaurant acceptance
  const newCustomerOrders = restaurantOrders.filter(order => order.status === 'pending_restaurant')
  
  // Orders accepted by restaurant but not yet assigned to delivery
  const pendingOrders = restaurantOrders.filter(order => order.status === 'pending')
  
  const activeOrders = orders.filter(order => 
    ['assigned', 'picked_up', 'in_transit'].includes(order.status)
  )
  const completedOrders = orders.filter(order => order.status === 'delivered')

  const handleStatusUpdate = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus)
    toast.success(`Order status updated to ${newStatus}`)
  }

  const handleAssignDelivery = async (order) => {
    try {
      await assignDelivery(order.id)
    } catch (error) {
      toast.error('Failed to assign delivery person')
    }
  }
  
  // Food item management functions
  const handleAddItem = () => {
    setEditingItem(null)
    setNewItem({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      available: true
    })
    setShowItemModal(true)
  }
  
  const handleEditItem = (item) => {
    setEditingItem(item.id)
    setNewItem({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      available: item.available
    })
    setShowItemModal(true)
  }
  
  const handleDeleteItem = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      removeMenuItem(id)
    }
  }
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewItem({...newItem, image: e.target.result})
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleSubmitItem = () => {
    // Validate form
    if (!newItem.name || !newItem.description || !newItem.price || !newItem.category || !newItem.image) {
      toast.error('Please fill all fields')
      return
    }
    
    // Convert price to number
    const itemData = {
      ...newItem,
      price: parseFloat(newItem.price)
    }
    
    if (editingItem) {
      updateMenuItem(editingItem, itemData)
    } else {
      addMenuItem(itemData)
    }
    
    setShowItemModal(false)
  }
  
  const handleToggleAvailability = (id, currentStatus) => {
    updateMenuItem(id, { available: !currentStatus })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-6">
          <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Restaurant Dashboard</h1>
        
        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-orange-600">{pendingOrders.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-blue-600">{activeOrders.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Orders</p>
                <p className="text-2xl font-bold text-green-600">{completedOrders.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Orders</h2>
            <div className="flex space-x-2">
              {['all', 'pending', 'assigned', 'picked_up', 'in_transit', 'delivered'].map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === status
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Items:</h4>
                    <div className="space-y-2">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded-lg"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            </div>
                          </div>
                                                     <span className="font-semibold text-gray-900">
                             ৳{(item.price * item.quantity).toFixed(2)}
                           </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Information */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Delivery Address</h4>
                      <p className="text-gray-600">{order.deliveryAddress}</p>
                      {order.deliveryInstructions && (
                        <p className="text-sm text-gray-500 mt-1">
                          Instructions: {order.deliveryInstructions}
                        </p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Total</h4>
                                             <p className="text-2xl font-bold text-primary-600">
                         ৳{order.total.toFixed(2)}
                       </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex space-x-2">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAssignDelivery(order)}
                            className="btn-primary"
                          >
                            Accept & Auto-Assign
                          </button>
                        </>
                      )}
                      
                      {order.status === 'assigned' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'picked_up')}
                          className="btn-primary"
                        >
                          Mark as Picked Up
                        </button>
                      )}
                      
                      {order.status === 'picked_up' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'in_transit')}
                          className="btn-primary"
                        >
                          Mark as In Transit
                        </button>
                      )}
                      
                      {order.status === 'in_transit' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'delivered')}
                          className="btn-primary"
                        >
                          Mark as Delivered
                        </button>
                      )}
                    </div>

                    {order.assignedDelivery && (
                      <div className="text-sm text-gray-600">
                        Assigned to: {order.assignedDelivery?.name || 'Delivery Person'}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No orders found with the selected status.</p>
              </div>
            )}
          </div>
        </div>

        <div className="card mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Menu Management</h2>
            <button 
              onClick={handleAddItem}
              className="btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map(item => (
              <div key={item.id} className="border rounded-lg p-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-primary-600">৳{item.price}</span>
                  <button 
                    onClick={() => handleToggleAvailability(item.id, item.available)}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.available 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                    {item.available ? 'Available' : 'Out of Stock'}
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditItem(item)}
                    className="btn-secondary flex-1 flex items-center justify-center space-x-1">
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteItem(item.id)}
                    className="btn-secondary flex-1 flex items-center justify-center space-x-1">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Food Item Modal */}
        {showItemModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                <button 
                  onClick={() => setShowItemModal(false)}
                  className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image
                  </label>
                  {newItem.image ? (
                    <div className="relative">
                      <img 
                        src={newItem.image} 
                        alt="Preview" 
                        className="w-full h-40 object-cover rounded-lg mb-2" 
                      />
                      <button 
                        onClick={() => setNewItem({...newItem, image: ''})}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Click to upload image</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden" 
                  />
                </div>
                
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input 
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Item name"
                  />
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea 
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Item description"
                    rows="3"
                  />
                </div>
                
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (৳)
                  </label>
                  <input 
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Item price"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select 
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a category</option>
                    <option value="Food">Food</option>
                    <option value="Coffee">Coffee</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Beverage">Beverage</option>
                  </select>
                </div>
                
                {/* Availability */}
                <div className="flex items-center">
                  <input 
                    type="checkbox"
                    id="available"
                    checked={newItem.available}
                    onChange={(e) => setNewItem({...newItem, available: e.target.checked})}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="available" className="ml-2 block text-sm text-gray-700">
                    Item is available
                  </label>
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-end space-x-2 pt-2">
                  <button 
                    onClick={() => setShowItemModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSubmitItem}
                    className="btn-primary flex items-center space-x-1"
                  >
                    <Check className="h-4 w-4" />
                    <span>{editingItem ? 'Update' : 'Add'} Item</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RestaurantDashboard
