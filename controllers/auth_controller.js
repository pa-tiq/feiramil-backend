const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../keys.json');
const error_messages = require('../util/error_messages.json');

const User = require('../models/user');

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(error_messages.validation_failed);
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const password = req.body.password;
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User(null, email, hashedPassword, null, null, null);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: 'Usuário criado', userId: result[0].insertId });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findByEmail(email)
    .then(([users]) => {
      if (users.length === 0) {
        const error = new Error(error_messages.user_not_found);
        error.statusCode = 401;
        throw error;
      }
      loadedUser = users[0];
      return bcrypt.compare(password, loadedUser.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error(error_messages.wrong_password);
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser.id.toString(),
        },
        keys.jsonwebtoken_secret
        //{ expiresIn: '1h' }
      );
      res.status(200).json({
        token: token,
        userId: loadedUser.id.toString(),
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.tokenLogin = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error('Usuário não encontrado');
        error.statusCode = 404;
        throw error;
      }
      return res.status(200).json({ userId: `${req.userId}` , message: 'Token válido.' });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.getUserOM = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error('Usuário não encontrado');
        error.statusCode = 404;
        throw error;
      }
      return res.status(200).json({ om: user.om });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.updateUserOM = (req, res, next) => {
  const newOM = req.body.om;
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error('Usuário não encontrado');
        error.statusCode = 404;
        throw error;
      }
      user.om = newOM;
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: 'OM atualizada' });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
