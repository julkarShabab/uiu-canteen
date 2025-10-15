import React from 'react'
import { Link } from 'react-router-dom'
import { Coffee, Truck, Clock, Star, ShoppingCart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useOrder } from '../contexts/OrderContext'

const Home = () => {
  const { user } = useAuth()
  const { menuItems } = useOrder()
  
  // Get featured items (first 6 items)
  const featuredItems = menuItems.slice(0, 6)
  
  return (
    <div className="min-h-screen">
      {/* Hero Section - Only show when not logged in */}
      {!user && (
        <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Fresh Food Delivered Fast
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Order your favorite food and beverages with our quick and reliable delivery service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/menu" className="btn-primary text-lg px-8 py-3">
                Browse Menu
              </Link>
              <Link to="/register" className="btn-secondary text-lg px-8 py-3">
                Sign Up for Delivery
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Welcome Section - Only show when logged in */}
      {user && (
        <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Ready to order some delicious food?
            </p>
            <Link to="/menu" className="btn-primary text-lg px-6 py-2">
              Browse Menu
            </Link>
          </div>
        </section>
      )}

      {/* Featured Menu Items - Show for non-logged in users */}
      {!user && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Our Featured Menu
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Browse our delicious offerings. Sign in to place an order!
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredItems.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-semibold">{item.name}</h3>
                      <span className="text-primary-600 font-bold">₹{item.price}</span>
                    </div>
                    <p className="text-gray-600 mb-4">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{item.category}</span>
                      <Link to="/login" className="flex items-center text-primary-600 hover:text-primary-700">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Login to Order
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Link to="/menu" className="btn-primary px-6 py-2">
                View Full Menu
              </Link>
            </div>
          </div>
        </section>
      )}
      
      {/* Features Section - Only show when not logged in */}
      {!user && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Choose Our Cafe Delivery?
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coffee className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fresh Food</h3>
                <p className="text-gray-600">
                  Premium Bengali food prepared fresh daily for the perfect meal every time.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Delivery</h3>
                <p className="text-gray-600">
                  AI-powered routing finds the nearest available delivery person.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast Service</h3>
                <p className="text-gray-600">
                  Average delivery time of 20-30 minutes from order to doorstep.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality Guaranteed</h3>
                <p className="text-gray-600">
                  Every order is carefully prepared and quality-checked before delivery.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section - Only show when not logged in */}
      {!user && (
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              How It Works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-primary-600">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Browse & Order</h3>
                <p className="text-gray-600">
                  Explore our menu of delicious food and beverages. Add to cart and checkout.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-primary-600">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Assignment</h3>
                <p className="text-gray-600">
                  Our system automatically finds the nearest available delivery person.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-primary-600">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                <p className="text-gray-600">
                  Track your order in real-time and receive it fresh at your doorstep.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Logged-in User Dashboard Sections */}
      {user && (
        <>
          {/* Customer Dashboard */}
          {user.type === 'customer' && (
            <section className="py-20">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                  What would you like to order today?
                </h2>
                <div className="text-center">
                  <Link to="/menu" className="btn-primary text-lg px-8 py-3">
                    Browse Our Menu
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Restaurant Staff Dashboard */}
          {user.type === 'restaurant' && (
            <section className="py-20">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                  Restaurant Dashboard
                </h2>
                <div className="text-center">
                  <Link to="/restaurant" className="btn-primary text-lg px-8 py-3">
                    View Orders & Manage Menu
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Delivery Personnel Dashboard */}
          {user.type === 'delivery' && (
            <section className="py-20">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                  Delivery Dashboard
                </h2>
                <div className="text-center">
                  <Link to="/delivery" className="btn-primary text-lg px-8 py-3">
                    View Available Orders
                  </Link>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* CTA Section - Only show when not logged in */}
      {!user && (
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Order?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of satisfied customers who love our food delivery service.
            </p>
            <Link to="/menu" className="btn-primary text-lg px-8 py-3">
              Start Ordering Now
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home
