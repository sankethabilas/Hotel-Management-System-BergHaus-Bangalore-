const { verifyToken } = require('../config/jwt');
const User = require('../models/User');
const Staff = require('../models/Staff');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;
    let user = null;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies (alternative method)
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Check for session cookie (Google OAuth)
    if (!token && req.cookies && req.cookies['hms-session']) {
      try {
        const sessionData = JSON.parse(decodeURIComponent(req.cookies['hms-session']));
        if (sessionData.isAuthenticated && sessionData.user) {
          user = sessionData.user;
        }
      } catch (error) {
        console.log('Error parsing session cookie:', error.message);
      }
    }

    if (!token && !user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      if (token) {
        // Verify JWT token
        const decoded = verifyToken(token);
        
        // Check if this is a staff token (has role: 'staff') or user token
        if (decoded.role === 'staff') {
          // Get staff from token using the staff ID
          user = await Staff.findById(decoded.id).select('-password');
          
          if (!user) {
            return res.status(401).json({
              success: false,
              message: 'Token is valid but staff member no longer exists'
            });
          }
          
          // Set staff-specific properties
          user.role = 'staff';
          user.employeeId = decoded.employeeId;
        } else {
          // Get regular user from token
          user = await User.findById(decoded.userId).select('-password');
          
          if (!user) {
            return res.status(401).json({
              success: false,
              message: 'Token is valid but user no longer exists'
            });
          }
        }
      } else if (user) {
        // User from session cookie, verify they still exist and are active
        const dbUser = await User.findById(user._id || user.id).select('-password');
        if (!dbUser) {
          return res.status(401).json({
            success: false,
            message: 'User no longer exists'
          });
        }
        user = dbUser;
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Add user info to request
      req.user = {
        id: user._id,
        userId: user._id,
        email: user.email,
        role: user.role,
        // Add staff-specific fields if this is a staff member
        ...(user.role === 'staff' && {
          employeeId: user.employeeId,
          fullName: user.fullName,
          department: user.department
        })
      };

      next();
    } catch (error) {
      console.error('Auth verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid token or session'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    next();
  };
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user && user.isActive) {
          req.user = {
            id: user._id,
            userId: user._id,
            email: user.email,
            role: user.role
          };
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.log('Invalid token in optional auth:', error.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue even if there's an error
  }
};

// Check if user owns resource or is admin
const checkOwnership = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (req.user.role === 'admin' || req.user.userId === resourceUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.'
    });
  };
};

// Frontdesk specific middleware
const requireFrontdesk = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'frontdesk') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Frontdesk role required.'
    });
  }

  next();
};

// Admin or frontdesk access
const requireAdminOrFrontdesk = (req, res, next) => {
  console.log('requireAdminOrFrontdesk middleware - User:', req.user);
  console.log('User role:', req.user?.role);
  
  if (!req.user) {
    console.log('No user found in request');
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!['admin', 'frontdesk', 'manager'].includes(req.user.role)) {
    console.log('User role not authorized:', req.user.role);
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin, manager, or frontdesk role required.'
    });
  }

  console.log('User authorized, proceeding...');
  next();
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  checkOwnership,
  requireFrontdesk,
  requireAdminOrFrontdesk
};
