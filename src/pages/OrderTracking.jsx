import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrder } from '../contexts/OrderContext';
import { MapPin, Clock, Package, CheckCircle, XCircle, Navigation, ArrowLeft, Map, MessageCircle } from 'lucide-react';
import Chat from '../components/Chat';
import toast from 'react-hot-toast';

const OrderTracking = () => {
  const { orderId } = useParams();
  const { getOrderById } = useOrder();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    // Fetch order data
    const fetchOrder = async () => {
      try {
        const orderData = getOrderById(orderId);
        setOrder(orderData);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Could not load order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId, getOrderById]);

  const handleCancelOrder = () => {
    toast.success('Your order has been cancelled');
    setOrder({
      ...order,
      status: 'cancelled'
    });
  };

  const openDeliveryMap = () => {
    if (!order.deliveryPerson?.location) {
      toast.error('Delivery location is not available');
      return;
    }
    
    // In a real app, this would open a map with the delivery person's location
    setShowMap(true);
    
    // Alternatively, open Google Maps
    const { lat, lng } = order.deliveryPerson.location;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="mb-4">We couldn't find the order you're looking for.</p>
        <Link
          to="/orders"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Return to Orders
        </Link>
      </div>
    );
  }

  const getStatusStep = () => {
    switch (order.status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'preparing':
        return 2;
      case 'ready_for_pickup':
        return 3;
      case 'in_transit':
        return 4;
      case 'delivered':
        return 5;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const statusStep = getStatusStep();

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link
          to="/orders"
          className="text-blue-500 hover:text-blue-700 flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Orders
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              order.status === 'delivered'
                ? 'bg-green-100 text-green-800'
                : order.status === 'cancelled'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {order.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Ordered at:{' '}
            {new Date(order.createdAt).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
          {order.status !== 'cancelled' && (
            <p className="text-gray-600 flex items-center mt-1">
              <Clock className="h-4 w-4 mr-2" />
              Estimated delivery:{' '}
              {new Date(order.estimatedDelivery).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          )}
        </div>

        {/* Order Status Tracker */}
        {order.status !== 'cancelled' ? (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Order Status</h2>
            <div className="relative">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div
                  style={{ width: `${(statusStep / 5) * 100}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
              </div>
              <div className="flex justify-between">
                <div className="text-center">
                  <div
                    className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
                      statusStep >= 0
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {statusStep > 0 ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span>1</span>
                    )}
                  </div>
                  <div className="text-xs mt-1">Confirmed</div>
                </div>
                <div className="text-center">
                  <div
                    className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
                      statusStep >= 2
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {statusStep > 2 ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span>2</span>
                    )}
                  </div>
                  <div className="text-xs mt-1">Preparing</div>
                </div>
                <div className="text-center">
                  <div
                    className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
                      statusStep >= 3
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {statusStep > 3 ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span>3</span>
                    )}
                  </div>
                  <div className="text-xs mt-1">Ready</div>
                </div>
                <div className="text-center">
                  <div
                    className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
                      statusStep >= 4
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {statusStep > 4 ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span>4</span>
                    )}
                  </div>
                  <div className="text-xs mt-1">In Transit</div>
                </div>
                <div className="text-center">
                  <div
                    className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
                      statusStep >= 5
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {statusStep >= 5 ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span>5</span>
                    )}
                  </div>
                  <div className="text-xs mt-1">Delivered</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center text-red-700">
              <XCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">This order has been cancelled</span>
            </div>
          </div>
        )}

        {/* Delivery Person Info */}
        {order.status === 'in_transit' && order.deliveryPerson && (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Delivery Information</h2>
            <p className="flex items-center mb-1">
              <Package className="h-4 w-4 mr-2" />
              <span className="font-medium">
                {order.deliveryPerson.name} is delivering your order
              </span>
            </p>
            <p className="text-gray-600 ml-6 mb-3">
              Contact: {order.deliveryPerson.phone}
            </p>
            
            <div className="flex space-x-2 mt-2">
              <button 
                onClick={openDeliveryMap}
                className="flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
              >
                <Map className="h-4 w-4 mr-1" />
                Track Location
              </button>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          <div className="border-t border-gray-200">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="py-3 flex justify-between items-center border-b border-gray-200"
              >
                <div className="flex items-center">
                  <span className="font-medium">
                    {item.quantity}x {item.name}
                  </span>
                </div>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right">
            <p className="text-gray-600">Subtotal: ${order.total.toFixed(2)}</p>
            <p className="text-gray-600">Delivery Fee: $2.00</p>
            <p className="text-xl font-semibold mt-2">
              Total: ${(order.total + 2).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded flex items-center">
            <MessageCircle className="h-4 w-4 mr-1" />
            Need Help?
          </button>
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <button 
              onClick={handleCancelOrder}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
      
      {/* Chat Component - Only show for active orders with a delivery person */}
      {order.status !== 'cancelled' && 
       order.status !== 'delivered' && 
       order.deliveryPerson && (
        <Chat 
          orderId={order.id}
          recipientId={order.deliveryPerson.id}
          recipientName={order.deliveryPerson.name}
          recipientRole="Delivery Person"
        />
      )}
    </div>
  );
};

export default OrderTracking;