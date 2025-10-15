import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useOrder } from '../contexts/OrderContext'
import { useDelivery } from '../contexts/DeliveryContext'
import { Clock, Package, CheckCircle, XCircle, ArrowLeft, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const DeliveryDashboard = () => {
  const { user, updateDeliveryLocation, updateDeliveryAvailability } = useAuth()
  const { orders, updateOrderStatus } = useOrder()
  const { deliveryPersonnel, completeDelivery, calculateDistance, restaurantLocation } = useDelivery()
  
  const [currentLocation, setCurrentLocation] = useState(null)
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable || false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [showMap, setShowMap] = useState(false)

  // Get current delivery person data
  const deliveryPerson = deliveryPersonnel?.find(person => person?.id === user?.id) || null

  // Get orders assigned to current delivery person
  const myOrders = orders?.filter(order => {
    const assignedId = order.assignedDelivery?.id || order.assignedDelivery
    return assignedId === user?.id && ['assigned', 'picked_up', 'in_transit'].includes(order.status)
  }) || []

  // Get pending orders (no area restriction for now)
  const pendingOrders = orders?.filter(order => 
    order.status === 'pending'
  ) || []

  // Location no longer required

  const toggleAvailability = () => {
    const newAvailability = !isAvailable
    setIsAvailable(newAvailability)
    updateDeliveryAvailability(newAvailability)
    toast.success(`You are now ${newAvailability ? 'available' : 'unavailable'} for deliveries`)
  }

  const acceptOrder = (order) => {
    setCurrentOrder(order)
    updateOrderStatus(order.id, 'assigned')
    toast.success('Order accepted! You can now pick up the order.')
  }

  const rejectOrder = (order) => {
    toast.success('Order rejected')
  }

  const pickUpOrder = () => {
    if (currentOrder) {
      updateOrderStatus(currentOrder.id, 'picked_up')
      toast.success('Order picked up!')
    }
  }

  const startDelivery = () => {
    if (currentOrder) {
      updateOrderStatus(currentOrder.id, 'in_transit')
      toast.success('Delivery started!')
    }
  }

  const completeOrder = () => {
    if (currentOrder) {
      updateOrderStatus(currentOrder.id, 'delivered')
      completeDelivery(user?.id)
      setCurrentOrder(null)
      toast.success('Delivery completed!')
    }
  }

  const cancelCurrentOrder = () => {
    if (currentOrder) {
      updateOrderStatus(currentOrder.id, 'pending')
      setCurrentOrder(null)
      toast.success('Order cancelled and returned to pending')
    }
  }

  return (
         <div className="min-h-screen py-8">
       <div className="container mx-auto px-4">
         <div className="flex items-center mb-6">
           <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors">
             <ArrowLeft className="h-5 w-5" />
             <span>Back to Home</span>
           </Link>
         </div>
         <h1 className="text-4xl font-bold text-gray-900 mb-8">Delivery Dashboard</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Status & Areas */}
          <div className="lg:col-span-1 space-y-6">
            {/* Online Status */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Status</h2>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Availability Status:</span>
                <button
                   onClick={toggleAvailability}
                   className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                     isAvailable 
                       ? 'bg-green-100 text-green-700 hover:bg-green-200'
                       : 'bg-red-100 text-red-700 hover:bg-red-200'
                   }`}
                 >
                   {isAvailable ? 'Available' : 'Unavailable'}
                  </button>
              </div>
              
            </div>

                                      {/* Map */}

            {/* Current Order */}
            {currentOrder && (
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Current Order</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Order ID:</span>
                    <p className="font-semibold">#{currentOrder.id}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Delivery Address:</span>
                    <p className="font-semibold">{currentOrder.deliveryAddress}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Total:</span>
                    <p className="font-semibold">${currentOrder.total}</p>
                  </div>
                  
                  <div className="space-y-2 pt-4">
                    {currentOrder.status === 'assigned' && (
                      <button
                        onClick={pickUpOrder}
                        className="w-full btn-primary"
                      >
                        Pick Up Order
                      </button>
                    )}
                    
                    {currentOrder.status === 'picked_up' && (
                      <button
                        onClick={startDelivery}
                        className="w-full btn-primary"
                      >
                        Start Delivery
                      </button>
                    )}
                    
                    {currentOrder.status === 'in_transit' && (
                      <button
                        onClick={completeOrder}
                        className="w-full btn-primary"
                      >
                        Complete Delivery
                      </button>
                    )}
                    
                                         <button
                       onClick={cancelCurrentOrder}
                       className="w-full btn-secondary"
                     >
                       Cancel Order
                     </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Orders */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Orders */}
            {myOrders.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">My Orders</h2>
                <div className="space-y-4">
                  {myOrders.map(order => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">Order #{order.id}</h3>
                          <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'picked_up' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                                                 <div className="flex justify-between items-center">
                             <span className="font-semibold">৳{order.total}</span>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Orders */}
            {isAvailable && (
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Available Orders</h2>
                {pendingOrders.length > 0 ? (
                  <div className="space-y-4">
                    {pendingOrders.map(order => {
                      return (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold">Order #{order.id}</h3>
                              <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                            </div>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              PENDING
                            </span>
                          </div>
                          

                          
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">৳{order.total}</span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => acceptOrder(order)}
                                className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white font-medium px-3 py-2 rounded-lg transition-colors"
                                disabled={currentOrder !== null}
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span>Accept Order</span>
                              </button>
                              <button
                                onClick={() => rejectOrder(order)}
                                className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white font-medium px-3 py-2 rounded-lg transition-colors"
                                disabled={currentOrder !== null}
                              >
                                <XCircle className="h-4 w-4" />
                                <span>Reject</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">
                    No orders available at the moment.
                  </p>
                )}
              </div>
            )}

            {!isAvailable && (
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Go Available</h2>
                <p className="text-gray-600 mb-4">
                  Set yourself as available to start receiving delivery requests.
                </p>
                <button
                  onClick={toggleAvailability}
                  className="w-full btn-primary"
                >
                  Go Available
                </button>
              </div>
            )}

            
          </div>
        </div>
      </div>
    </div>
  )
}


export default DeliveryDashboard
