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
      .normalizeEmail(),
    body('password').trim().isLength({ min: 5 }),
    body('password').trim().not().isEmpty(),
  ],
  authController.signup
);

router.post('/login', authController.login);

router.get('/om', isAuth, authController.getUserOM);

router.get('/tokenlogin', isAuth, authController.tokenLogin)

router.patch(
  '/om',
  isAuth,
  [body('om').trim().not().isEmpty()],
  authController.updateUserOM
);

module.exports = router;
