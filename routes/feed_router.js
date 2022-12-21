const express = require('express');
const { body } = require('express-validator');

const feedController = require('../controllers/feed_controller');
const isAuth = require('../util/is-auth');

const router = express.Router();

router.get('/:userId', isAuth, feedController.getProductsExeptUser); // GET /feed/

router.get('/products/:userId', isAuth, feedController.getUserProducts); // GET /feed/products

router.get('/product/:productId', isAuth, feedController.getProduct);

router.post(
  '/product',
  isAuth,
  [
    body('title').trim().isLength({ min: 1 }),
    body('description').trim().isLength({ min: 1 }),
    body('city').trim().isLength({ min: 1 }),
    body('state').trim().isLength({ min: 1 }),
  ],
  feedController.createProduct
);

router.patch('/image', isAuth, feedController.uploadProductImage); // POST /feed/post

router.post('/image/:productId', isAuth, feedController.addProductImagePath); // POST /feed/post

router.put('/image/:productId', isAuth, feedController.updateProductImagePath); // POST /feed/post

router.put(
  '/product/:productId',
  isAuth,
  [
    body('title').trim().isLength({ min: 1 }),
    body('description').trim().isLength({ min: 1 }),
    body('city').trim().isLength({ min: 1 }),
    body('state').trim().isLength({ min: 1 }),
  ],
  feedController.updateProduct
);

router.delete('/product/:productId', isAuth, feedController.deleteProduct);

module.exports = router;
