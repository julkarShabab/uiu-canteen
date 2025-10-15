import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { socketEmitters } from '../utils/socket'
import { useAuth } from './AuthContext'

const DeliveryContext = createContext()

export const useDelivery = () => {
  const context = useContext(DeliveryContext)
  if (!context) {
    throw new Error('useDelivery must be used within a DeliveryProvider')
  }
  return context
}

export const DeliveryProvider = ({ children }) => {
  const { user } = useAuth()
  const [deliveryPersonnel, setDeliveryPersonnel] = useState([])

  const [pendingDeliveries, setPendingDeliveries] = useState([])
  const [restaurantLocation] = useState({ lat: 40.7589, lng: -73.9851 }) // Restaurant location
  
  // Current location tracking
  const [currentLocation, setCurrentLocation] = useState(null)
  const [locationTracking, setLocationTracking] = useState(false)
  const [locationError, setLocationError] = useState(null)

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Find the best delivery person for an order
  const findBestDeliveryPerson = (deliveryAddress) => {
    // Filter only available personnel who are marked as isAvailable
    const availablePersonnel = deliveryPersonnel.filter(person => 
      person.status === 'available' && !person.currentOrder && person.isAvailable === true
    )

    if (availablePersonnel.length === 0) {
      return null
    }

    // Sort by total deliveries in descending order (more experienced first)
    availablePersonnel.sort((a, b) => b.totalDeliveries - a.totalDeliveries)
    
    return availablePersonnel
  }

  // Assign delivery to the best available person
  const assignDelivery = async (order, deliveryAddress) => {
    try {
      const availablePersonnel = findBestDeliveryPerson(deliveryAddress)
      
      if (!availablePersonnel || availablePersonnel.length === 0) {
        toast.error('No delivery personnel available')
        return null
      }

      // Try to assign to the first (most experienced) person
      const bestPerson = availablePersonnel[0]
      
      // Simulate delivery person response
      const accepted = await simulateDeliveryResponse(bestPerson, order)
      
      if (accepted) {
        // Update delivery person status
        setDeliveryPersonnel(prev =>
          prev.map(person =>
            person.id === bestPerson.id
              ? { ...person, status: 'busy', currentOrder: order.id }
              : person
          )
        )
        
        // Try to emit socket event if available
        try {
          if (socketEmitters) {
            socketEmitters.assignDelivery(order.id, bestPerson)
          }
        } catch (socketError) {
          console.error('Socket error:', socketError);
          // Continue even if socket fails
        }
        
        toast.success(`Order assigned to ${bestPerson.name}`)
        return bestPerson
      } else {
        // Try the second most experienced person
        if (availablePersonnel.length > 1) {
          const secondBestPerson = availablePersonnel[1]
          const secondAccepted = await simulateDeliveryResponse(secondBestPerson, order)
          
          if (secondAccepted) {
            setDeliveryPersonnel(prev =>
              prev.map(person =>
                person.id === secondBestPerson.id
                  ? { ...person, status: 'busy', currentOrder: order.id }
                  : person
              )
            )
            
            toast.success(`Order assigned to ${secondBestPerson.name}`)
            return secondBestPerson
          }
        }
        
        // If no one accepts, add to pending deliveries
        setPendingDeliveries(prev => [...prev, { order, deliveryAddress }])
        toast.error('No delivery personnel accepted the order')
        return null
      }
    } catch (error) {
      console.error('Error assigning delivery:', error)
      return null
    }
  }

  // Simulate delivery person response (in real app, this would be a push notification)
  const simulateDeliveryResponse = async (deliveryPerson, order) => {
    // Simulate 80% acceptance rate
    return Math.random() > 0.2
  }

  // Update delivery person location
  const updateDeliveryLocation = (personId, lat, lng) => {
    setDeliveryPersonnel(prev =>
      prev.map(person =>
        person.id === personId
          ? { ...person, location: { lat, lng } }
          : person
      )
    )
  }

  // Mark delivery as completed
  const completeDelivery = (personId) => {
    setDeliveryPersonnel(prev =>
      prev.map(person =>
        person.id === personId
          ? { ...person, status: 'available', currentOrder: null }
          : person
      )
    )
  }

  // Get delivery person by ID
  const getDeliveryPerson = (personId) => {
    return deliveryPersonnel.find(person => person.id === personId)
  }

  // Get all available delivery personnel
  const getAvailablePersonnel = () => {
    return deliveryPersonnel.filter(person => 
      person.status === 'available' && !person.currentOrder
    )
  }

  // Start location tracking for delivery personnel
  useEffect(() => {
    if (user && user.type === 'delivery' && locationTracking) {
      // Request permission and start tracking
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCurrentLocation(newLocation);
            
            // Update own location in the delivery personnel array
            if (user.id) {
              updateDeliveryLocation(user.id, newLocation);
              
              // Emit location update via socket
              socketEmitters.updateLocation(newLocation);
            }
            
            setLocationError(null);
          },
          (error) => {
            console.error('Error getting location:', error);
            setLocationError(error.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          }
        );
        
        // Cleanup function
        return () => {
          navigator.geolocation.clearWatch(watchId);
        };
      } else {
        setLocationError('Geolocation is not supported by this browser.');
      }
    }
  }, [user, locationTracking]);
  
  // Toggle location tracking
  const toggleLocationTracking = () => {
    setLocationTracking(prev => !prev);
  };

  // Get current coordinates from browser
  const getCurrentCoordinates = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coordinates = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            resolve(coordinates);
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error('Geolocation is not supported by this browser.'));
      }
    });
  };
  
  const value = {
    deliveryPersonnel,
    pendingDeliveries,
    restaurantLocation,
    assignDelivery,
    updateDeliveryLocation,
    completeDelivery,
    getDeliveryPerson,
    getAvailablePersonnel,
    calculateDistance,
    currentLocation,
    locationTracking,
    toggleLocationTracking,
    locationError,
    getCurrentCoordinates
  }

  return (
    <DeliveryContext.Provider value={value}>
      {children}
    </DeliveryContext.Provider>
  )
}


