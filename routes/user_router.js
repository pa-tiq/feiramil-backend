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
  ],
  userController.updateUser
);

router.put(
  '/image',
  isAuth,
  userController.updatePhotoPath
);

router.patch(
  '/image',
  isAuth,
  userController.uploadPhoto
);

router.post(
  '/filter',
  isAuth,
  userController.addFilter
);

router.put(
  '/filter',
  isAuth,
  userController.updateFilter
);

router.delete(
  '/filter',
  isAuth,
  userController.addFilter
);


module.exports = router;
