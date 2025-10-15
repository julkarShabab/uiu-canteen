import React, { useState, useEffect } from 'react';
import { useOrder } from '../contexts/OrderContext';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdNotifications, IoMdClose } from 'react-icons/io';

const Notifications = () => {
  const { notifications, clearNotification } = useOrder();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Update unread count when notifications change
    setUnreadCount(notifications.length);
  }, [notifications]);

  const handleNotificationClick = (notification) => {
    // Mark as read and potentially navigate to relevant page
    clearNotification(notification.id);
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <IoMdNotifications size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden"
          >
            <div className="p-3 bg-gray-800 text-white flex justify-between items-center">
              <h3 className="text-lg font-medium">Notifications</h3>
              <button onClick={() => setShowNotifications(false)}>
                <IoMdClose size={20} />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <div
                    key={notification.id || index}
                    className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start">
                      <div className="ml-3 w-full">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.type === 'order_status' && '🔄 Order Status Update'}
                          {notification.type === 'new_assignment' && '🚚 New Delivery Assignment'}
                          {notification.type === 'delivery_update' && '📍 Delivery Update'}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {notification.time || 'Just now'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;