const jwt = require('jsonwebtoken');
const keys = require('../keys.json');
const error_messages = require('./error_messages.json');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if(!authHeader){
    const error = new Error(error_messages.not_authenticated);
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, keys.jsonwebtoken_secret);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if(!decodedToken){
    const error = new Error(error_messages.not_authenticated);
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};
