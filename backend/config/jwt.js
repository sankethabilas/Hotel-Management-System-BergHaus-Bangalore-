const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  return jwt.sign(payload, 'your-super-secret-jwt-key-change-this-in-production', {
    expiresIn: '7d'
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, 'your-super-secret-jwt-key-change-this-in-production');
};

module.exports = {
  generateToken,
  verifyToken
};
