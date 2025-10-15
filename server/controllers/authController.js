import User from '../models/User.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, type, restaurantName, studentId, isAvailable } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      type,
      restaurantName: type === 'restaurant' ? restaurantName : undefined,
      studentId: type === 'delivery' ? studentId : undefined,
      isAvailable: type === 'delivery' ? (isAvailable || false) : undefined,
      location: type === 'delivery' ? { lat: 0, lng: 0 } : null
    });

    if (user) {
      res.status(201).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          type: user.type,
          restaurantName: user.restaurantName,
          studentId: user.studentId,
          isAvailable: user.isAvailable,
          location: user.location,
        },
        token: user.getSignedJwtToken(),
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // For mock users, select method returns a promise
    const userWithPassword = await user.select('+password');

    // Check if password matches
    const isMatch = await userWithPassword.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: userWithPassword._id,
        name: userWithPassword.name,
        email: userWithPassword.email,
        type: userWithPassword.type,
        restaurantName: userWithPassword.restaurantName,
        studentId: userWithPassword.studentId,
        isAvailable: userWithPassword.isAvailable,
        location: userWithPassword.location,
      },
      token: userWithPassword.getSignedJwtToken(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
        restaurantName: user.restaurantName,
        studentId: user.studentId,
        isAvailable: user.isAvailable,
        location: user.location,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update delivery person location
// @route   PUT /api/auth/location
// @access  Private/Delivery
export const updateLocation = async (req, res) => {
  try {
    // Location is no longer required; keep endpoint for compatibility
    if (req.user.type !== 'delivery') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    return res.status(200).json({ success: true, message: 'Location update ignored' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update delivery person availability
// @route   PUT /api/auth/availability
// @access  Private/Delivery
export const updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    if (req.user.type !== 'delivery') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isAvailable },
      { new: true }
    );

    res.status(200).json({
      success: true,
      isAvailable: user.isAvailable,
      message: `Availability ${isAvailable ? 'enabled' : 'disabled'}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
