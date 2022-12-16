const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const error_messages = require('../util/error_messages.json');

const Product = require('../models/product');
const User = require('../models/user');

exports.getUser = (req, res, next) => {
  const userId = req.userId;
  let loadedUser;
  User.findById(userId)
    .then(([users]) => {
      if (users.length === 0) {
        const error = new Error(error_messages.user_not_found);
        error.statusCode = 404;
        throw error;
      }
      loadedUser = users[0];
      res.status(200).json({ message: 'User fetched', user: loadedUser });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.deleteUser = (req, res, next) => {};

exports.updateUser = (req, res, next) => {};
