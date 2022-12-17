const express = require('express');
const { body } = require('express-validator');

const userController = require('../controllers/user_controller');
const isAuth = require('../util/is-auth');

const router = express.Router();

router.get('/user', isAuth, userController.getUser); // GET /user/user

router.delete('/user/:userId', isAuth, userController.deleteUser);

router.put(
  '/user',
  isAuth,
  [
    body('email').trim().isLength({ min: 6 }),
    body('name').trim().isLength({ min: 0 }),
    body('om').trim().isLength({ min: 0 }),
    body('phone').trim().isLength({ min: 0 }),
  ],
  userController.updateUser
);

module.exports = router;
