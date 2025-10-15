import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// In-memory User model
class User {
  constructor(userData) {
    this._id = Math.random().toString(36).substr(2, 9); // Simple ID generation
    this.name = userData.name;
    this.email = userData.email;
    this.password = userData.password;
    this.type = userData.type;
    this.restaurantName = userData.restaurantName;
    this.studentId = userData.studentId;
    this.isAvailable = userData.isAvailable || false;
    this.location = userData.location || null;
    this.createdAt = new Date();
  }

  // Find a user by email
  static async findOne({ email }) {
    const user = global.mockUsers.find(user => user.email === email);
    if (user) {
      // Create a mock user object that behaves like Mongoose
      const mockUser = {
        ...user,
        select: function(fields) {
          // Return a Promise that resolves to this user object
          return Promise.resolve({
            ...this,
            matchPassword: async function(enteredPassword) {
              return await bcrypt.compare(enteredPassword, user.password);
            },
            getSignedJwtToken: function() {
              return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRE,
              });
            }
          });
        },
        matchPassword: async function(enteredPassword) {
          return await bcrypt.compare(enteredPassword, this.password);
        },
        getSignedJwtToken: function() {
          return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
          });
        }
      };
      return mockUser;
    }
    return null;
  }

  // Find a user by ID
  static async findById(id) {
    const user = global.mockUsers.find(user => user._id === id);
    if (user) {
      return {
        ...user,
        getSignedJwtToken: function() {
          return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
          });
        }
      };
    }
    return null;
  }

  // Create a new user
  static async create(userData) {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user = new User({
      ...userData,
      password: hashedPassword
    });
    
    global.mockUsers.push(user);
    
    // Save to persistent storage
    if (global.saveUsers) {
      global.saveUsers(global.mockUsers);
    }
    
    // Return user with methods
    return {
      ...user,
      getSignedJwtToken: function() {
        return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE,
        });
      }
    };
  }

  // Find user by ID and update
  static async findByIdAndUpdate(id, update, options) {
    const userIndex = global.mockUsers.findIndex(user => user._id === id);
    if (userIndex === -1) return null;

    const user = global.mockUsers[userIndex];
    const updatedUser = { ...user, ...update };
    global.mockUsers[userIndex] = updatedUser;

    // Save to persistent storage
    if (global.saveUsers) {
      global.saveUsers(global.mockUsers);
    }

    return options?.new ? updatedUser : user;
  }
}

export default User;
