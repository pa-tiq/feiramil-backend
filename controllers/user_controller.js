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

exports.updateUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(error_messages.validation_failed);
    error.statusCode = 422;
    throw error;
  }
  const userId = req.userId;
  const email = req.body.email;
  const name = req.body.name;
  const om = req.body.om;
  const phone = req.body.phone;
  const newPassword = req.body.password;
  if (!newPassword) {
    const user = new User(userId, email, null, name, om, phone);
    user
      .update()
      .then((result) => {
        res.status(201).json({
          message: 'Usuário editado',
          changedRows: result[0].changedRows,
        });
      })
      .catch((error) => {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        next(error);
      });
  } else {
    bcrypt
      .hash(newPassword, 12)
      .then((hashedPassword) => {
        const user = new User(userId, email, hashedPassword, name, om, phone);
        return user.update();
      })
      .then((result) => {
        res.status(201).json({
          message: 'Usuário editado',
          changedRows: result[0].changedRows,
        });
      })
      .catch((error) => {
        if (!error.statusCode) {
          error.statusCode = 500;
        }
        next(error);
      });
  }
};

exports.updatePhoto = (req, res, next) => {
  if (!req.file) {
    const error = new Error(error_messages.no_image_provided);
    error.statusCode = 422;
    throw error;
  }
  console.log('file', req.file);
  console.log('body', req.body._parts);
  const userId = req.userId;
  const newPhoto = req.body.photo;
  const user = new User(userId, null, null, null, null, null, newPhoto);
  user
    .updatePhoto()
    .then((result) => {
      res.status(201).json({
        message: 'Foto do usuário editada',
        changedRows: result[0].changedRows,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
