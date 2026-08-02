const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretgymkey12345', {
    expiresIn: '30d'
  });
};

module.exports = generateToken;
