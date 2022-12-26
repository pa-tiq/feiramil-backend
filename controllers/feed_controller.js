const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');

const Product = require('../models/product');
const Image = require('../models/image');
const User = require('../models/user');
const error_messages = require('../util/error_messages.json');
const success_messages = require('../util/success.messages.json');

exports.getProductsExeptUser = (req, res, next) => {
  Product.fetchAllExeptUserId(req.userId)
    .then(([products]) => {
      res.status(200).json({ message: 'Produtos obtidos', products: products }); // 200 = success
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.getUserProducts = (req, res, next) => {
  Product.findByUserId(req.userId)
    .then(([products]) => {
      //if (products.length === 0) {
      //  const error = new Error(error_messages.user_products_not_found);
      //  error.statusCode = 404;
      //  throw error;
      //}
      res.status(200).json({
        message: `Produtos do usuário ${req.userId} obtidos`,
        products: products,
      }); // 200 = success
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then(([products]) => {
      if (products.length === 0) {
        const error = new Error(error_messages.product_not_found);
        error.statusCode = 404;
        throw error;
      }
      res
        .status(200)
        .json({ message: 'Produto encontrado', product: products[0] });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.createProduct = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(error_messages.validation_failed);
    error.statusCode = 422;
    next(error);
  }
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const city = req.body.city;
  const state = req.body.state;
  const userId = req.userId;

  const product = new Product(null, title, price, description, city, state, userId);
  product
    .save()
    .then((result) => {
      // 201 = success, a resource was created
      res.status(201).json({
        message: 'Post created successfully',
        result: result,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.uploadProductImage = (req, res) => {
  try {
    const result = req.pipe(
      fs.createWriteStream('./productPictures/image' + Date.now() + '.png')
    );
    res.status(201).json({
      message: success_messages.product_image_added,
      path: result.path,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
};

exports.addProductImagePath = (req, res, next) => {
  const userId = req.userId;
  const productId = req.params.productId;
  const image = new Image(null, req.body.path, productId);
  image
    .save()
    .then((result) => {
      res.status(201).json({
        message: success_messages.product_image_path_added,
        imageId: result[0].insertId,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.updateProduct = (req, res, next) => {
  const productId = req.params.productId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(error_messages.validation_failed);
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const city = req.body.city;
  const state = req.body.state;
  const userId = req.userId;

  Product.findById(productId)
    .then(([products]) => {
      if (products.length === 0) {
        const error = new Error(error_messages.product_not_found);
        error.statusCode = 404;
        throw error;
      }
      if (products[0].userId.toString() !== userId) {
        const error = new Error(error_messages.not_authorized);
        error.statusCode = 403;
        throw error;
      }
      const product = new Product(productId, title, price, description, city, state, userId);
      return product.update();
    })
    .then((result) => {
      res
        .status(200)
        .json({
          message: success_messages.product_updated,
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

exports.updateProductImagePath = (req, res, next) => {
  const productId = req.params.productId;
  const oldFileExists = fs.existsSync('.' + req.body.oldpath);
  if (oldFileExists) {
    fs.unlinkSync('.' + req.body.oldpath);
  }
  Image.deleteByProductIdAndPath(productId, req.body.oldpath)
    .then((r) => {})
    .catch((error) => {
      console.log(error);
    });
  const image = new Image(null, req.body.path, productId);
  image
    .save()
    .then((result) => {
      res.status(201).json({
        message: success_messages.product_image_path_added,
        imageId: result[0].insertId,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then(([products]) => {
      if (products.length === 0) {
        const error = new Error(error_messages.product_not_found);
        error.statusCode = 404;
        throw error;
      }
      if (products[0].userId != req.userId) {
        const error = new Error(error_messages.not_authorized);
        error.statusCode = 403;
        throw error;
      }
      return Image.findByProductId(productId);
    })
    .then(([images]) => {
      if (images.length !== 0) {
        try {
          fs.unlinkSync('.' + images[0].image);
        } catch (error) {
          console.log(error);
        }
      }
    })
    .then(() => {
      return Image.deleteByProductId(productId);
    })
    .then(() => {
      return Product.deleteById(productId);
    })
    .then(() => {
      res.status(200).json({ message: success_messages.product_deleted });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

const deleteImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
