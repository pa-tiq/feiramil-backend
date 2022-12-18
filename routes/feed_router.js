const express = require('express');
const { body } = require('express-validator');

const feedController = require('../controllers/feed_controller');
const isAuth = require('../util/is-auth');

const router = express.Router();

router.get('/products', isAuth, feedController.getProducts); // GET /feed/products

router.get('/products/:userId', isAuth, feedController.getUserProducts); // GET /feed/products

router.get('/product/:productId', isAuth, feedController.getProduct);

router.post(
  '/product',
  isAuth,
  [
    body('title').trim().isLength({ min: 5 }),
    body('description').trim().isLength({ min: 5 }),
  ],
  feedController.createProduct
); // POST /feed/post

router.put(
  '/product/:productId',
  isAuth,
  [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 }),
  ],
  feedController.updateProduct
);

router.delete('/product/:productId', isAuth, feedController.deleteProduct);

module.exports = router;
