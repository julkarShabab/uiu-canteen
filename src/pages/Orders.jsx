import React from 'react'
import { useOrder } from '../contexts/OrderContext'
import { useDelivery } from '../contexts/DeliveryContext'
import { Clock, MapPin, Package, CheckCircle, Truck, User, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const Orders = () => {
  const { orders } = useOrder()
  const { getDeliveryPerson } = useDelivery()

  const getStatusColor = (status) => {
    switch (status) {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  if (orders.length === 0) {
    return (
           <div className="min-h-screen py-8">
       <div className="container mx-auto px-4 text-center">
         <div className="flex items-center justify-center mb-6">
           <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors">
             <ArrowLeft className="h-5 w-5" />
             <span>Back to Home</span>
           </Link>
         </div>
         <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Orders</h1>
         <p className="text-gray-600 mb-8">You haven't placed any orders yet.</p>
        </div>
      </div>
    )
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
         <h1 className="text-4xl font-bold text-gray-900 mb-8">Your Orders</h1>
        
        <div className="space-y-6">
          {orders.map(order => {
            const deliveryPerson = order.assignedDelivery 
              ? getDeliveryPerson(order.assignedDelivery.id)
              : null

            return (
              <div key={order.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Order #{order.id}
                    </h2>
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
                  <h3 className="font-semibold text-gray-900 mb-2">Items:</h3>
                  <div className="space-y-2">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg"
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
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold text-gray-900">Delivery Address</span>
                    </div>
                    <p className="text-gray-600">{order.deliveryAddress}</p>
                    {order.deliveryInstructions && (
                      <p className="text-sm text-gray-500 mt-1">
                        Instructions: {order.deliveryInstructions}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold text-gray-900">Estimated Delivery</span>
                    </div>
                    <p className="text-gray-600">
                      {formatDate(order.estimatedDelivery)}
                    </p>
                  </div>
                </div>

                {/* Delivery Person Information */}
                {deliveryPerson && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Delivery Person</h3>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{deliveryPerson.name}</p>
                        <p className="text-sm text-gray-600">
                          Rating: {deliveryPerson.rating} ⭐ ({deliveryPerson.totalDeliveries} deliveries)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                                         <span className="text-2xl font-bold text-primary-600">
                       ৳{order.total.toFixed(2)}
                     </span>
                  </div>
                </div>

                {/* Order Progress */}
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Order Progress</h3>
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      {[
                        { status: 'pending', label: 'Order Placed' },
                        { status: 'assigned', label: 'Assigned' },
                        { status: 'picked_up', label: 'Picked Up' },
                        { status: 'in_transit', label: 'In Transit' },
                        { status: 'delivered', label: 'Delivered' }
                      ].map((step, index) => {
                        const isCompleted = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered']
                          .indexOf(order.status) >= index
                        
                        return (
                          <div key={step.status} className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted 
                                ? 'bg-primary-500 text-white' 
                                : 'bg-gray-200 text-gray-500'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <span className="text-sm font-medium">{index + 1}</span>
                              )}
                            </div>
                            <span className={`text-xs mt-1 text-center ${
                              isCompleted ? 'text-primary-600' : 'text-gray-500'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Progress Line */}
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                      <div 
                        className="h-full bg-primary-500 transition-all duration-500"
                        style={{
                          width: `${(['pending', 'assigned', 'picked_up', 'in_transit', 'delivered']
                            .indexOf(order.status) / 4) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Orders
