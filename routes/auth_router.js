const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth_controller');
const User = require('../models/user');
const isAuth = require('../util/is-auth');

const router = express.Router();

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Por favor, use um e-mail válido.')
      .custom((value, { req }) => {
        return User.findByEmail(value).then(([rows]) => {
          if (rows.length > 0) {
            return Promise.reject('Esse e-mail já está cadastrado.');
          }
        });
      })
      .normalizeEmail({ gmail_remove_dots: false }),
    body('password').trim().isLength({ min: 5 }),
  ],
  authController.signup
);

router.post('/login', authController.login);

router.get('/tokenlogin', isAuth, authController.tokenLogin);

router.post(
  '/changepasswordrequest',
  [
    body('email')
      .isEmail()
      .withMessage('Por favor, use um e-mail válido.')
      .custom((value, { req }) => {
        return User.findByEmail(value).then(([rows]) => {
          if (rows.length === 0) {
            return Promise.reject('Esse e-mail não está cadastrado.');
          }
        });
      })
      .normalizeEmail({ gmail_remove_dots: false }),
  ],
  authController.changePasswordConfirm
);

router.patch(
  '/changepassword',
  [
    body('email')
      .isEmail()
      .withMessage('Por favor, use um e-mail válido.')
      .custom((value, { req }) => {
        return User.findByEmail(value).then(([rows]) => {
          if (rows.length === 0) {
            return Promise.reject('Esse e-mail não está cadastrado.');
          }
        });
      })
      .normalizeEmail({ gmail_remove_dots: false }),
    body('password').trim().isLength({ min: 5 }),
    body('confirmationCode').trim().isLength({ min: 5, max: 5}),
  ],
  authController.changePassword
);

module.exports = router;
