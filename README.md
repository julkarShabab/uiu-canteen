# Cafe Delivery System

A comprehensive cafe delivery system with smart delivery assignment, real-time tracking, and multi-user management.

## Features

### 🍽️ **Customer Features**
- Browse menu with categories (Coffee, Pastry, Dessert, Food)
- Add items to cart with quantity selection
- Place orders with delivery address and instructions
- Real-time order tracking with progress indicators
- View order history and delivery person details

### 🚚 **Delivery Personnel Features**
- **Area Selection**: Choose delivery areas (Downtown, Midtown, etc.)
- **Smart Assignment**: Automatic distance-based order assignment
- **Location Tracking**: Real-time GPS location updates
- **Order Management**: Accept, pick up, deliver, and complete orders
- **Online/Offline Status**: Toggle availability for order requests

### 🏪 **Restaurant Management**
- View and manage all orders with status updates
- Assign delivery personnel to orders
- Menu management (add, edit, delete items)
- Order statistics and analytics
- Real-time order status tracking

### 🤖 **Smart Delivery System**
- **Distance Calculation**: Uses Haversine formula for accurate distance calculation
- **Priority Assignment**: Orders are assigned to the nearest available delivery person
- **Fallback System**: If the closest person rejects, automatically tries the second closest
- **Real-time Updates**: Instant status updates across all users

## Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Notifications**: React Hot Toast
- **Maps**: Leaflet (ready for integration)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cafe-delivery-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage Guide

### For Customers
1. **Register/Login** as a customer
2. **Browse Menu** - View items by category
3. **Add to Cart** - Select quantities and add items
4. **Checkout** - Enter delivery address and place order
5. **Track Order** - Monitor real-time delivery progress

### For Delivery Personnel
1. **Register/Login** as a delivery person
2. **Select Areas** - Choose delivery zones you want to serve
3. **Go Online** - Make yourself available for orders
4. **Accept Orders** - Receive notifications for nearby orders
5. **Manage Deliveries** - Pick up, deliver, and complete orders

### For Restaurant Staff
1. **Register/Login** as restaurant staff
2. **View Orders** - See all incoming orders
3. **Manage Status** - Update order status as they progress
4. **Assign Delivery** - Manually assign orders to delivery personnel
5. **Menu Management** - Add, edit, or remove menu items

## Smart Delivery Algorithm

The system uses a sophisticated algorithm for optimal delivery assignment:

1. **Distance Calculation**: Uses Haversine formula to calculate distances between:
   - Delivery person's current location
   - Restaurant location
   - Customer's delivery address

2. **Priority Assignment**:
   - Orders are automatically assigned to the nearest available delivery person
   - If the closest person rejects, the system tries the second closest
   - Continues until an available person accepts or all options are exhausted

3. **Real-time Updates**:
   - Delivery person locations are updated in real-time
   - Order status changes are reflected immediately
   - All users see live updates


## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── pages/              # Main application pages
├── App.jsx            # Main application component
├── main.jsx           # Application entry point
└── index.css          # Global styles
```

## Key Features Explained

### Distance-Based Assignment
The system calculates the total distance a delivery person would need to travel:
- Distance from their current location to the restaurant
- Distance from the restaurant to the customer's address
- Assigns orders to minimize total travel distance

### Area Selection
Delivery personnel can select specific areas they want to serve:
- Downtown, Midtown, Upper East Side, etc.
- Only receive orders from selected areas
- Can change areas at any time

### Real-time Location Tracking
- Uses browser geolocation API
- Updates delivery person location automatically
- Enables accurate distance calculations

### Order Status Flow
1. **Pending** - Order placed, waiting for assignment
2. **Assigned** - Delivery person assigned
3. **Picked Up** - Order collected from restaurant
4. **In Transit** - On the way to customer
5. **Delivered** - Successfully delivered

## Future Enhancements

- **Real-time Maps**: Integration with Leaflet for visual tracking
- **Push Notifications**: Real-time alerts for new orders
- **Payment Integration**: Secure payment processing
- **Rating System**: Customer and delivery person ratings
- **Analytics Dashboard**: Detailed business insights
- **Mobile App**: Native mobile applications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

---

**Note**: This application uses simulated data. In a production environment, you would need to:
- Implement proper authentication and authorization
- Add a backend API with database
- Integrate with real payment gateways
- Add proper error handling and validation
- Implement real-time communication (WebSockets)
- Add proper security measures


